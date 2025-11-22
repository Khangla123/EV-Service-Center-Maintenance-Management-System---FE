/**
 * @fileoverview Customer Dashboard Component
 * 
 * Component chính cho giao diện khách hàng, hiển thị tổng quan về các hoạt động bảo dưỡng xe,
 * quản lý lịch hẹn, theo dõi chi phí và thống kê các dịch vụ.
 * 
 * Main customer interface component that displays overview of vehicle maintenance activities,
 * appointment management, cost tracking and service statistics.
 * 
 * @module components/customer/CustomerDashboard
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Car, Calendar, History, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle, Home, Menu, X } from 'lucide-react';
import { MDButton } from '../ui';
import AppointmentBooking from './appointments/AppointmentBooking';
import AppointmentTracker from './appointments/AppointmentTracker';
import MaintenanceHistory from './maintenance/MaintenanceHistory';
import CostManagement from './cost/CostManagement';
import OnlinePayment from './payment/OnlinePayment';
import MockPayment from './payment/MockPayment';
import PaymentResult from './payment/PaymentResult';
import VehicleManagement from './vehicles/VehicleManagement';
import vehicleService from '../../services/vehicleService';
import appointmentService from '../../services/appointmentService';
import invoiceService from '../../services/invoiceService';
import './CustomerDashboard.css';

/**
 * Customer Dashboard Component
 * 
 * Hiển thị dashboard chính cho khách hàng bao gồm:
 * - Thống kê tổng quan (số xe, lịch hẹn, chi phí)
 * - Danh sách lịch hẹn sắp tới
 * - Hoạt động gần đây
 * - Điều hướng đến các module con (đặt lịch, theo dõi, thanh toán, quản lý xe)
 * 
 * Displays main customer dashboard including:
 * - Overview statistics (vehicle count, appointments, costs)
 * - Upcoming appointments list
 * - Recent activities
 * - Navigation to sub-modules (booking, tracking, payment, vehicle management)
 * 
 * @returns {JSX.Element} Customer dashboard component
 * 
 * @example
 * // Sử dụng trong router / Used in router
 * <Route path="/customer/*" element={<CustomerDashboard />} />
 */
const CustomerDashboard: React.FC = () => {
  // Router hooks for navigation and location tracking
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI state - Mobile sidebar toggle / Trạng thái UI - Toggle sidebar mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Dashboard statistics / Thống kê dashboard
  const [vehicleCount, setVehicleCount] = useState(0);           // Số lượng xe
  const [appointmentCount, setAppointmentCount] = useState(0);   // Số lượng lịch hẹn đang hoạt động
  const [completedCount, setCompletedCount] = useState(0);       // Số lịch hẹn đã hoàn thành
  const [monthlyCost, setMonthlyCost] = useState('0');           // Chi phí tháng hiện tại
  
  // Appointment and activity data / Dữ liệu lịch hẹn và hoạt động
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);  // Lịch hẹn sắp tới
  const [recentActivities, setRecentActivities] = useState<any[]>([]);          // Hoạt động gần đây

  /** 
   * Dashboard statistics cards configuration
   * Cấu hình các thẻ thống kê trên dashboard
   */
  const stats = [
    { label: 'Xe của tôi', value: vehicleCount.toString(), icon: Car, gradient: 'from-blue-500 to-blue-600', link: '/customer/vehicles' },
    { label: 'Theo dõi lịch dịch vụ', value: appointmentCount.toString(), icon: Calendar, gradient: 'from-green-500 to-green-600', link: '/customer/appointments' },
    { label: 'Hoàn tất', value: completedCount.toString(), icon: CheckCircle, gradient: 'from-purple-500 to-purple-600', link: '/customer/history' },
    { label: 'Chi phí tháng', value: monthlyCost, icon: CreditCard, gradient: 'from-orange-500 to-orange-600', link: '/customer/costs' }
  ];

  /** 
   * Sidebar menu items configuration
   * Cấu hình các mục menu thanh bên
   */
  const menuItems = [
    { path: '/customer/dashboard', label: 'Tổng quan khách hàng', icon: Home },
    { path: '/customer/booking', label: 'Đặt lịch dịch vụ', icon: Calendar },
    { path: '/customer/appointments', label: 'Theo dõi lịch dịch vụ', icon: Clock },
    { path: '/customer/history', label: 'Lịch sử bảo dưỡng', icon: History },
    { path: '/customer/costs', label: 'Quản lý chi phí bảo dưỡng', icon: CreditCard },
    { path: '/customer/payment', label: 'Thanh toán bảo dưỡng', icon: CreditCard },
    { path: '/customer/vehicles', label: 'Quản lý xe', icon: Car }
  ];

  /**
   * Load dashboard data on component mount
   * Tải dữ liệu dashboard khi component được mount
   * 
   * Fetches and processes:
   * - User's vehicles count
   * - Active and completed appointments
   * - Monthly cost calculations from invoices
   * - Recent maintenance activities
   */
  useEffect(() => {
    /**
     * Load user data from API
     * Tải dữ liệu người dùng từ API
     */
    const loadUserData = async () => {
      try {
        // Load vehicles / Tải danh sách xe
        const vehicles = await vehicleService.getMyVehicles();
        console.log('🚗 Vehicles loaded:', vehicles);
        setVehicleCount(vehicles.length);

        // Load appointments / Tải lịch hẹn
        const { appointments } = await appointmentService.getMyAppointments();
        console.log('📅 Appointments loaded:', appointments);
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        /**
         * Filter and format upcoming appointments
         * Lọc và định dạng lịch hẹn sắp tới (PENDING hoặc CONFIRMED)
         */
        const upcoming = appointments
          .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          .slice(0, 5)  // Chỉ lấy 5 lịch hẹn gần nhất
          .map(a => {
            const date = new Date(a.appointmentDate);
            return {
              id: a.id,
              service: a.servicePackageName || 'Dịch vụ bảo dưỡng',
              vehicle: `${a.vehicleModel} - ${a.vehicleLicensePlate}`,
              date: date.toLocaleDateString('vi-VN'),
              time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              type: 'maintenance',
              status: a.status
            };
          });
        
        setUpcomingAppointments(upcoming);
        
        // Count active appointments / Đếm số lịch hẹn đang hoạt động
        setAppointmentCount(appointments.filter(a => 
          a.status === 'PENDING' || a.status === 'CONFIRMED'
        ).length);
        
        // Count completed appointments / Đếm số lịch hẹn đã hoàn thành
        const completed = appointments.filter(a => a.status === 'COMPLETED');
        setCompletedCount(completed.length);
        
        /**
         * Load invoices and calculate monthly cost
         * Tải hóa đơn và tính chi phí tháng hiện tại
         */
        try {
          const invoices = await invoiceService.getMyInvoices();
          console.log('💰 Invoices loaded:', invoices);
          
          // Calculate total cost from paid/pending invoices of current month
          // Tính tổng chi phí từ hóa đơn đã thanh toán/đang chờ trong tháng hiện tại
          const monthlyTotal = invoices
            .filter(inv => {
              if (!inv.paidDate && !inv.issueDate) return false;
              const invDate = new Date(inv.paidDate || inv.issueDate);
              return (inv.status === 'PAID' || inv.status === 'PENDING') && 
                     invDate.getMonth() === currentMonth && 
                     invDate.getFullYear() === currentYear;
            })
            .reduce((sum, inv) => sum + (inv.finalAmount || inv.totalAmount || 0), 0);
          
          console.log('💵 Monthly total:', monthlyTotal);
          
          // Format monthly cost in Vietnamese currency / Định dạng chi phí theo tiền tệ Việt Nam
          setMonthlyCost(monthlyTotal > 0 ? new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND',
            maximumFractionDigits: 0
          }).format(monthlyTotal) : '0 ₫');
        } catch (error) {
          console.error('Error loading invoices:', error);
          setMonthlyCost('0 ₫');
        }
        
        /**
         * Get recent activities from completed/in-progress appointments
         * Lấy hoạt động gần đây từ các lịch hẹn đã hoàn thành/đang thực hiện
         */
        const recent = appointments
          .filter(a => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS')
          .sort((a, b) => new Date(b.updatedAt || b.appointmentDate).getTime() - new Date(a.updatedAt || a.appointmentDate).getTime())
          .slice(0, 5)  // Lấy 5 hoạt động gần nhất
          .map(a => {
            const date = new Date(a.updatedAt || a.appointmentDate);
            return {
              id: a.id,
              action: a.status === 'COMPLETED' ? 'Hoàn thành bảo dưỡng' : 'Đang thực hiện',
              vehicle: `${a.vehicleModel} - ${a.vehicleLicensePlate}`,
              date: date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              type: 'maintenance'
            };
          });
        
        setRecentActivities(recent);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };
    
    loadUserData();
  }, []);

  /**
   * Check if a menu path is currently active
   * Kiểm tra xem một đường dẫn menu có đang hoạt động không
   * 
   * @param {string} path - Menu path to check
   * @returns {boolean} True if path is active
   */
  const isActivePath = (path: string) => {
    return location.pathname === path || (path === '/customer/dashboard' && location.pathname === '/customer');
  };

  /**
   * Handle menu item click
   * Xử lý khi click vào mục menu
   * 
   * @param {string} path - Path to navigate to
   */
  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);  // Đóng sidebar trên mobile
  };

  /**
   * Toggle mobile sidebar
   * Bật/tắt sidebar trên mobile
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="customer-dashboard">
      {/* Mobile Menu Toggle */}
      <div className="mobile-menu-toggle">
        <button onClick={toggleSidebar} className="menu-btn">
          {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleMenuClick(item.path)}
              className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
            >
              <item.icon className="nav-icon" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/dashboard" element={
            <div className="dashboard-content">
              {/* Header */}
              <div className="dashboard-header">
                <div className="header-content">
                  <div>
                    <h1>Tổng quan khách hàng</h1>
                    <p>Chào mừng bạn trở lại! Quản lý xe và dịch vụ của bạn tại đây.</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="stat-card"
                    onClick={() => navigate(stat.link)}
                  >
                    <div className={`stat-header bg-gradient-to-r ${stat.gradient}`}>
                      <div className="stat-content">
                        <div>
                          <p className="stat-label">{stat.label}</p>
                          <p className="stat-value">{stat.value}</p>
                        </div>
                        <div className="stat-icon">
                          <stat.icon className="h-8 w-8" />
                        </div>
                      </div>
                    </div>
                    <div className="stat-footer">
                      <div className="stat-trend">
                        <TrendingUp className="h-4 w-4" />
                        <span>+12% từ tháng trước</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div className="dashboard-grid">
                {/* Appointments Section */}
                <div className="appointments-section">
                  <div className="section-header">
                    <h3>Lịch dịch vụ sắp tới</h3>
                    <MDButton 
                      variant="text" 
                      onClick={() => navigate('/customer/appointments')}
                    >
                      Xem tất cả →
                    </MDButton>
                  </div>
                  <div className="appointments-list">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="appointment-card">
                        <div className="appointment-content-wrapper">
                          <div className="appointment-icon-wrapper">
                            <div className={`appointment-icon ${
                              appointment.type === 'maintenance' ? 'bg-blue-100' : 
                              appointment.type === 'checkup' ? 'bg-green-100' : 
                              'bg-purple-100'
                            }`}>
                              {appointment.type === 'maintenance' ? (
                                <Car className="h-5 w-5 text-blue-600" />
                              ) : appointment.type === 'checkup' ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                          </div>
                          <div className="appointment-info">
                            <h4>{appointment.service}</h4>
                            <p>{appointment.vehicle}</p>
                            <div className="appointment-time">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.date} - {appointment.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {upcomingAppointments.length === 0 && (
                      <div className="empty-state">
                        <Calendar className="h-12 w-12" />
                        <p>Không có lịch dịch vụ nào</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Activity Section */}
                <div className="recent-activity-section">
                  <div className="section-header">
                    <h3>Hoạt động gần đây</h3>
                    <MDButton 
                      variant="text" 
                      onClick={() => navigate('/customer/history')}
                    >
                      Xem tất cả →
                    </MDButton>
                  </div>
                  <div className="activity-list">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="activity-card">
                        <div className="activity-content-wrapper">
                          <div className="activity-icon-wrapper">
                            <div className={`activity-icon ${
                              activity.type === 'maintenance' ? 'bg-blue-100' : 
                              activity.type === 'payment' ? 'bg-green-100' : 
                              'bg-purple-100'
                            }`}>
                              {activity.type === 'maintenance' ? (
                                <Car className="h-5 w-5 text-blue-600" />
                              ) : activity.type === 'payment' ? (
                                <CreditCard className="h-5 w-5 text-green-600" />
                              ) : (
                                <Calendar className="h-5 w-5 text-purple-600" />
                              )}
                            </div>
                          </div>
                          <div className="activity-info">
                            <h4>{activity.action}</h4>
                            <p>{activity.vehicle || activity.amount}</p>
                            <div className="activity-date">
                              <Clock className="h-4 w-4" />
                              <span>{activity.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {recentActivities.length === 0 && (
                      <div className="empty-state">
                        <History className="h-12 w-12" />
                        <p>Không có hoạt động gần đây</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          } />
          
          <Route path="/booking" element={<AppointmentBooking />} />
          <Route path="/appointments" element={<AppointmentTracker />} />
          <Route path="/history" element={<MaintenanceHistory />} />
          <Route path="/costs" element={<CostManagement />} />
          <Route path="/payment" element={<OnlinePayment />} />
          <Route path="/payment/mock" element={<MockPayment />} />
          <Route path="/payment/result" element={<PaymentResult />} />
          
          <Route path="/vehicles" element={<VehicleManagement />} />
          
          <Route path="/*" element={
            <div className="placeholder-content">
              <div className="placeholder-card">
                <AlertCircle className="h-16 w-16 text-blue-500" />
                <h2>Tính năng đang phát triển</h2>
                <p>Tính năng này sẽ được hoàn thiện trong phiên bản tiếp theo.</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default CustomerDashboard;