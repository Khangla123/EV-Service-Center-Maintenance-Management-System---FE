import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Car, Calendar, History, CreditCard, TrendingUp, Clock, CheckCircle, AlertCircle, Home, Menu, X } from 'lucide-react';
import { MDButton } from '../ui';
import AppointmentBooking from './appointments/AppointmentBooking';
import AppointmentTracker from './appointments/AppointmentTracker';
import MaintenanceHistory from './maintenance/MaintenanceHistory';
import CostManagement from './cost/CostManagement';
import OnlinePayment from './payment/OnlinePayment';
import VehicleManagement from './vehicles/VehicleManagement';
import { vehicleService, appointmentService } from '../../services';
import './CustomerDashboard.css';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // State for dashboard data
  const [vehicleCount, setVehicleCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState('0');
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const stats = [
    { label: 'Xe của tôi', value: vehicleCount.toString(), icon: Car, gradient: 'from-blue-500 to-blue-600', link: '/customer/vehicles' },
    { label: 'Lịch dịch vụ', value: appointmentCount.toString(), icon: Calendar, gradient: 'from-green-500 to-green-600', link: '/customer/appointments' },
    { label: 'Hoàn tất', value: completedCount.toString(), icon: CheckCircle, gradient: 'from-purple-500 to-purple-600', link: '/customer/history' },
    { label: 'Chi phí tháng', value: monthlyCost, icon: CreditCard, gradient: 'from-orange-500 to-orange-600', link: '/customer/costs' }
  ];

  const menuItems = [
    { path: '/customer/dashboard', label: 'Tổng quan khách hàng', icon: Home },
    { path: '/customer/booking', label: 'Đặt lịch dịch vụ', icon: Calendar },
    { path: '/customer/appointments', label: 'Theo dõi lịch dịch vụ', icon: Clock },
    { path: '/customer/history', label: 'Lịch sử bảo dưỡng', icon: History },
    { path: '/customer/costs', label: 'Quản lý chi phí bảo dưỡng', icon: CreditCard },
    { path: '/customer/payment', label: 'Thanh toán bảo dưỡng', icon: CreditCard },
    { path: '/customer/vehicles', label: 'Quản lý xe', icon: Car }
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get customer ID from localStorage or auth context
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.error('No user found in localStorage');
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      const customerId = user.id;
      
      console.log('Dashboard - User info:', user);
      console.log('Dashboard - Customer ID:', customerId);

      // Load vehicles count
      try {
        const vehiclesResponse = await vehicleService.getMyVehicles();
        setVehicleCount(vehiclesResponse.length || 0);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        setVehicleCount(0);
      }

      // Load appointments
      try {
        // Try to get appointments with customerId filter
        const appointmentsResponse = await appointmentService.getAllAppointments({
          customerId: customerId
        });
        const allAppointments = appointmentsResponse.appointments || [];
        
        console.log('Dashboard - Customer ID:', customerId);
        console.log('Dashboard - All appointments:', allAppointments);
        console.log('Dashboard - Appointments count:', allAppointments.length);
        
        // Count total appointments (excluding cancelled)
        const activeAppointments = allAppointments.filter(
          (apt: any) => apt.status !== 'CANCELLED'
        );
        setAppointmentCount(activeAppointments.length);

        // Count completed appointments
        const completed = allAppointments.filter(
          (apt: any) => apt.status === 'COMPLETED'
        );
        setCompletedCount(completed.length);

        // Get upcoming appointments (PENDING or CONFIRMED, future dates)
        const now = new Date();
        console.log('Dashboard - Current date:', now);
        
        const upcoming = allAppointments
          .filter((apt: any) => {
            const aptDate = new Date(apt.appointmentDate);
            console.log(`Dashboard - Checking appointment ${apt.id}:`, {
              status: apt.status,
              date: aptDate,
              isFuture: aptDate >= now,
              isValidStatus: apt.status === 'PENDING' || apt.status === 'CONFIRMED'
            });
            return (
              (apt.status === 'PENDING' || apt.status === 'CONFIRMED') &&
              aptDate >= now
            );
          })
          .sort((a: any, b: any) => {
            return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
          })
          .slice(0, 3); // Take first 3 upcoming appointments

        console.log('Dashboard - Upcoming appointments:', upcoming);
        
        // If no upcoming appointments, show the most recent ones
        if (upcoming.length === 0 && allAppointments.length > 0) {
          const recentAppointments = allAppointments
            .sort((a: any, b: any) => {
              return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
            })
            .slice(0, 3);
          console.log('Dashboard - No upcoming, showing recent:', recentAppointments);
          setUpcomingAppointments(recentAppointments);
        } else {
          setUpcomingAppointments(upcoming);
        }

        // Calculate monthly cost (from completed appointments this month)
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const thisMonthCompleted = allAppointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointmentDate);
          return (
            apt.status === 'COMPLETED' &&
            aptDate.getMonth() === currentMonth &&
            aptDate.getFullYear() === currentYear
          );
        });
        
        // Estimate cost (assume average 500k per service)
        const estimatedCost = thisMonthCompleted.length * 500000;
        setMonthlyCost(estimatedCost >= 1000000 
          ? `${(estimatedCost / 1000000).toFixed(1)}M` 
          : `${Math.round(estimatedCost / 1000)}K`
        );

        // Get recent activity (last 5 completed appointments)
        const recentCompleted = allAppointments
          .filter((apt: any) => apt.status === 'COMPLETED')
          .sort((a: any, b: any) => {
            const dateA = new Date(a.actualCompletion || a.appointmentDate);
            const dateB = new Date(b.actualCompletion || b.appointmentDate);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 5)
          .map((apt: any) => ({
            id: apt.id,
            action: `${apt.servicePackageName || 'Dịch vụ'} hoàn tất`,
            vehicle: `${apt.vehicleModel || 'N/A'} - ${apt.vehicleLicensePlate || ''}`,
            date: new Date(apt.actualCompletion || apt.appointmentDate).toLocaleDateString('vi-VN'),
            type: 'maintenance'
          }));
        
        setRecentActivity(recentCompleted);
      } catch (error) {
        console.error('Error loading appointments:', error);
        setAppointmentCount(0);
        setCompletedCount(0);
        setMonthlyCost('0');
        setUpcomingAppointments([]);
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || (path === '/customer/dashboard' && location.pathname === '/customer');
  };

  const handleMenuClick = (path: string) => {
    navigate(path);
    setIsSidebarOpen(false);
  };

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
                    {loading ? (
                      <div className="empty-state">
                        <p>Đang tải dữ liệu...</p>
                      </div>
                    ) : upcomingAppointments.length > 0 ? (
                      upcomingAppointments.map((appointment) => {
                        const aptDate = new Date(appointment.appointmentDate);
                        const status = appointment.status.toLowerCase();
                        
                        return (
                          <div key={appointment.id} className={`appointment-card border-l-blue-500`}>
                            <div className="appointment-content">
                              <div className="appointment-info">
                                <h4>{appointment.vehicleModel || 'N/A'} - {appointment.vehicleLicensePlate || ''}</h4>
                                <p>{appointment.servicePackageName || 'Dịch vụ'}</p>
                                <div className="appointment-time">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {aptDate.toLocaleDateString('vi-VN')} - {aptDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                              <div className={`appointment-status ${getStatusColor(status)}`}>
                                {getStatusText(status)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <Calendar className="h-12 w-12" />
                        <p>Không có lịch dịch vụ nào</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="dashboard-sidebar">
                  {/* Quick Actions */}
                  <div className="quick-actions">
                    <h3>Thao tác nhanh</h3>
                    <div className="actions-grid">
                      {[
                        { path: '/customer/booking', icon: Calendar, label: 'Đặt lịch dịch vụ', color: 'bg-blue-500' },
                        { path: '/customer/vehicles', icon: Car, label: 'Quản lý xe', color: 'bg-green-500' },
                        { path: '/customer/history', icon: History, label: 'Lịch sử bảo dưỡng', color: 'bg-purple-500' },
                        { path: '/customer/payment', icon: CreditCard, label: 'Thanh toán bảo dưỡng', color: 'bg-orange-500' }
                      ].map((action, index) => (
                        <button
                          key={index}
                          onClick={() => navigate(action.path)}
                          className="action-btn"
                        >
                          <div className={`action-icon ${action.color}`}>
                            <action.icon className="h-6 w-6 text-white" />
                          </div>
                          <p>{action.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="recent-activity">
                    <h3>Hoạt động gần đây</h3>
                    <div className="activity-list">
                      {loading ? (
                        <div className="empty-state">
                          <p>Đang tải...</p>
                        </div>
                      ) : recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <div className={`activity-icon ${activity.type === 'maintenance' ? 'bg-blue-100' : 'bg-green-100'}`}>
                              {activity.type === 'maintenance' ? (
                                <Car className="h-4 w-4 text-blue-600" />
                              ) : (
                                <CreditCard className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                            <div className="activity-content">
                              <p className="activity-action">{activity.action}</p>
                              <p className="activity-detail">{activity.vehicle || activity.amount}</p>
                              <p className="activity-date">{activity.date}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          <History className="h-8 w-8" />
                          <p>Chưa có hoạt động nào</p>
                        </div>
                      )}
                    </div>
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