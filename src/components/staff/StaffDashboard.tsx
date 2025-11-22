/**
 * @fileoverview Staff Dashboard Component
 * 
 * Component chính cho giao diện nhân viên, quản lý khách hàng, lịch hẹn và hóa đơn.
 * Hiển thị tổng quan với thống kê và danh sách lịch hẹn gần đây.
 * 
 * Main staff interface component for managing customers, appointments and invoices.
 * Displays overview with statistics and recent appointments list.
 * 
 * @module components/staff/StaffDashboard
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Users, Calendar, Wrench, Package,
  TrendingUp, FileText, Activity
} from 'lucide-react';
import { CustomerManagement } from './customers';
import { AppointmentManagement } from './appointments';
import { InvoiceManagement } from './invoices';
import appointmentService from '../../services/appointmentService';
import customerService from '../../services/customerService';
import partService from '../../services/partService';
import './StaffDashboard.css';

/**
 * Staff view types / Các loại giao diện nhân viên
 */
type StaffView = 
  | 'overview'
  | 'customers'
  | 'appointments'
  | 'invoices';

/**
 * Staff Dashboard Component
 * 
 * Quản lý giao diện nhân viên với các chức năng:
 * - Tổng quan thống kê (lịch hẹn hôm nay, đang bảo dưỡng, khách hàng, phụ tùng)
 * - Quản lý khách hàng
 * - Quản lý lịch hẹn
 * - Quản lý hóa đơn
 * 
 * Manages staff interface with features:
 * - Overview statistics (today's appointments, in-progress, customers, parts)
 * - Customer management
 * - Appointment management
 * - Invoice management
 * 
 * @returns {JSX.Element} Staff dashboard component
 * 
 * @example
 * // Sử dụng trong router / Used in router
 * <Route path="/staff/*" element={<StaffDashboard />} />
 */
const StaffDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Current view state / Trạng thái view hiện tại
  const [currentView, setCurrentView] = useState<StaffView>('overview');
  const [loading, setLoading] = useState(true);
  
  /**
   * Dashboard statistics data / Dữ liệu thống kê dashboard
   */
  const [dashboardData, setDashboardData] = useState({
    todayAppointments: 0,        // Số lịch hẹn hôm nay
    inProgressCount: 0,          // Số lịch đang thực hiện
    totalCustomers: 0,           // Tổng số khách hàng
    lowStockParts: 0,            // Số phụ tùng sắp hết
    recentAppointments: [] as any[]  // Danh sách lịch hẹn gần đây
  });

  /**
   * Sync currentView with URL
   * Đồng bộ currentView với URL
   * 
   * Automatically updates view based on current route.
   * Tự động cập nhật view dựa trên route hiện tại.
   */
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/appointments')) {
      setCurrentView('appointments');
    } else if (path.includes('/customers')) {
      setCurrentView('customers');
    } else if (path.includes('/services') || path.includes('/invoices')) {
      setCurrentView('invoices');
    } else {
      setCurrentView('overview');
    }
  }, [location.pathname]);

  /**
   * Update URL when view changes
   * Cập nhật URL khi view thay đổi
   * 
   * @param {StaffView} view - View to navigate to
   */
  const handleViewChange = (view: StaffView) => {
    setCurrentView(view);
    const pathMap: Record<StaffView, string> = {
      'overview': '/staff/dashboard',
      'customers': '/staff/customers',
      'appointments': '/staff/appointments',
      'invoices': '/staff/services'
    };
    navigate(pathMap[view]);
  };

  /**
   * Load dashboard data when view is overview
   * Tải dữ liệu dashboard khi view là overview
   */
  useEffect(() => {
    if (currentView === 'overview') {
      loadDashboardData();
    }
  }, [currentView]);

  /**
   * Load dashboard statistics from APIs
   * Tải thống kê dashboard từ các API
   * 
   * Fetches:
   * - All appointments (count today's, in-progress, recent)
   * - All customers (count total)
   * - All parts (count low stock items)
   */
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch data from multiple APIs in parallel / Lấy dữ liệu từ nhiều API song song
      const [appointmentsResponse, customersResponse, parts] = await Promise.all([
        appointmentService.getAllAppointments(),
        customerService.getAllCustomers(),
        partService.getAllParts()
      ]);

      // Handle paginated response for appointments / Xử lý response phân trang cho lịch hẹn
      const appointments = Array.isArray(appointmentsResponse) 
        ? appointmentsResponse 
        : (appointmentsResponse.appointments || []);

      const now = new Date();
      const today = now.toDateString();
      
      /**
       * Count today's appointments
       * Đếm số lịch hẹn hôm nay
       */
      const todayAppointments = appointments.filter((apt: any) => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate.toDateString() === today;
      }).length;

      /**
       * Count in-progress appointments
       * Đếm số lịch hẹn đang thực hiện (IN_PROGRESS hoặc ASSIGNED)
       */
      const inProgressCount = appointments.filter((apt: any) => 
        apt.status === 'IN_PROGRESS' || apt.status === 'ASSIGNED'
      ).length;

      /**
       * Count total customers
       * Đếm tổng số khách hàng
       */
      const customersList = customersResponse.content || customersResponse || [];
      const totalCustomers = customersList.length;

      /**
       * Count low stock parts (quantity < 10)
       * Đếm số phụ tùng sắp hết (số lượng < 10)
       */
      const lowStockParts = parts.filter((part: any) => part.quantity < 10).length;

      /**
       * Get recent appointments (last 4)
       * Lấy lịch hẹn gần đây (4 lịch gần nhất)
       */
      const recentAppointments = appointments
        .sort((a: any, b: any) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
        .slice(0, 4);

      setDashboardData({
        todayAppointments,
        inProgressCount,
        totalCustomers,
        lowStockParts,
        recentAppointments
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculate time ago from a date
   * Tính thời gian trôi qua từ một ngày
   * 
   * @param {Date | string} date - Date to calculate from
   * @returns {string} Formatted time ago string in Vietnamese
   * 
   * @example
   * getTimeAgo(new Date()) // "Vừa xong"
   * getTimeAgo('2024-01-01') // "5 ngày trước"
   */
  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  /**
   * Get Vietnamese status text from status code
   * Lấy text trạng thái tiếng Việt từ mã trạng thái
   * 
   * @param {string} status - Status code
   * @returns {string} Vietnamese status text
   * 
   * @example
   * getStatusText('PENDING') // "Chờ xác nhận"
   * getStatusText('COMPLETED') // "Hoàn thành"
   */
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'Chờ xác nhận',
      'CONFIRMED': 'Đã xác nhận',
      'ASSIGNED': 'Đã phân công',
      'IN_PROGRESS': 'Đang thực hiện',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  /**
   * Sidebar menu items configuration / Cấu hình các mục menu sidebar
   */
  const menuItems = [
    { id: 'overview', icon: <TrendingUp />, label: 'Tổng quan nhân viên', color: '#667eea' },
    { id: 'customers', icon: <Users />, label: 'Quản lý Khách hàng', color: '#10b981' },
    { id: 'appointments', icon: <Calendar />, label: 'Quản lý Lịch hẹn', color: '#3b82f6' },
    { id: 'invoices', icon: <FileText />, label: 'Quản lý Hóa đơn', color: '#f59e0b' }
  ] as const;

  /**
   * Render content based on current view
   * Render nội dung dựa trên view hiện tại
   * 
   * @returns {JSX.Element} Content component for the current view
   */
  const renderContent = () => {
    switch (currentView) {
      case 'customers':
        return <CustomerManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'overview':
      default:
        if (loading) {
          return (
            <div className="overview-content">
              <div className="loading-state">
                <Activity className="loading-icon" size={48} />
                <p>Đang tải dữ liệu tổng quan...</p>
              </div>
            </div>
          );
        }

        const stats = [
          {
            icon: <Calendar className="stat-icon" />,
            label: 'Lịch hẹn hôm nay',
            value: dashboardData.todayAppointments.toString(),
            trend: dashboardData.todayAppointments > 0 ? 'Có lịch hẹn' : 'Chưa có lịch',
            color: 'blue'
          },
          {
            icon: <Wrench className="stat-icon" />,
            label: 'Đang bảo dưỡng',
            value: dashboardData.inProgressCount.toString(),
            trend: dashboardData.inProgressCount > 0 ? 'Đang thực hiện' : 'Không có',
            color: 'orange'
          },
          {
            icon: <Users className="stat-icon" />,
            label: 'Tổng khách hàng',
            value: dashboardData.totalCustomers.toString(),
            trend: 'Tổng số',
            color: 'green'
          },
          {
            icon: <Package className="stat-icon" />,
            label: 'Phụ tùng sắp hết',
            value: dashboardData.lowStockParts.toString(),
            trend: dashboardData.lowStockParts > 0 ? 'Cần đặt hàng' : 'Đủ hàng',
            color: 'red'
          }
        ];

        return (
          <div className="overview-content">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.color}`}>
                  <div className="stat-icon-wrapper">
                    {stat.icon}
                  </div>
                  <div className="stat-content">
                    <div className="stat-label">{stat.label}</div>
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-trend">{stat.trend}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="quick-actions">
              <h3>Thao tác nhanh</h3>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => handleViewChange('appointments')}>
                  <Calendar />
                  <span>Quản lý lịch hẹn</span>
                </button>
                <button className="action-btn" onClick={() => handleViewChange('customers')}>
                  <Users />
                  <span>Quản lý khách hàng</span>
                </button>
              </div>
            </div>

            <div className="recent-activities">
              <h3>Lịch hẹn gần đây</h3>
              {dashboardData.recentAppointments.length === 0 ? (
                <div className="empty-activities">
                  <Calendar size={48} style={{ opacity: 0.3 }} />
                  <p>Chưa có lịch hẹn nào</p>
                </div>
              ) : (
                <div className="activity-list">
                  {dashboardData.recentAppointments.map((appointment, index) => (
                    <div key={appointment.id || index} className="activity-item">
                      <div className={`activity-icon ${
                        appointment.status === 'COMPLETED' ? 'green' :
                        appointment.status === 'IN_PROGRESS' || appointment.status === 'ASSIGNED' ? 'orange' :
                        appointment.status === 'CONFIRMED' ? 'blue' : 'gray'
                      }`}>
                        <Calendar />
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">
                          {appointment.servicePackageName || 'Dịch vụ'} - {getStatusText(appointment.status)}
                        </div>
                        <div className="activity-time">
                          {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')} - {getTimeAgo(appointment.createdAt || appointment.appointmentDate)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="staff-dashboard">
      <div className="dashboard-sidebar">
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`menu-item ${currentView === item.id ? 'active' : ''}`}
              onClick={() => handleViewChange(item.id as StaffView)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="dashboard-main">
        <div className="main-header">
          <h1>
            {menuItems.find(item => item.id === currentView)?.label || 'Tổng quan nhân viên'}
          </h1>
        </div>
        <div className="main-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
