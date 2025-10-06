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
import './CustomerDashboard.css';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const stats = [
    { label: 'Xe của tôi', value: '2', icon: Car, gradient: 'from-blue-500 to-blue-600', link: '/customer/vehicles' },
    { label: 'Lịch dịch vụ', value: '3', icon: Calendar, gradient: 'from-green-500 to-green-600', link: '/customer/appointments' },
    { label: 'Hoàn tất', value: '12', icon: CheckCircle, gradient: 'from-purple-500 to-purple-600', link: '/customer/history' },
    { label: 'Chi phí tháng', value: '2.5M', icon: CreditCard, gradient: 'from-orange-500 to-orange-600', link: '/customer/costs' }
  ];

  const appointments = [
    {
      id: 1,
      vehicle: 'VinFast VF8',
      service: 'Bảo dưỡng định kỳ',
      date: '2025-01-20',
      time: '09:00',
      status: 'confirmed',
      priority: 'high'
    },
    {
      id: 2,
      vehicle: 'VinFast VF5',
      service: 'Kiểm tra pin',
      date: '2025-01-22',
      time: '14:00',
      status: 'pending',
      priority: 'medium'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Bảo dưỡng định kỳ hoàn tất',
      vehicle: 'VinFast VF8',
      date: '2025-01-15',
      type: 'maintenance'
    },
    {
      id: 2,
      action: 'Thanh toán hóa đơn',
      amount: '1.2M VND',
      date: '2025-01-14',
      type: 'payment'
    }
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
    // Load notifications or user data
    const loadUserData = async () => {
      // Mock loading data
      await new Promise(resolve => setTimeout(resolve, 500));
    };
    
    loadUserData();
  }, []);

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
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className={`appointment-card ${getPriorityColor(appointment.priority)}`}>
                        <div className="appointment-content">
                          <div className="appointment-info">
                            <h4>{appointment.vehicle}</h4>
                            <p>{appointment.service}</p>
                            <div className="appointment-time">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.date} - {appointment.time}</span>
                            </div>
                          </div>
                          <div className={`appointment-status ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
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
                      {recentActivity.map((activity) => (
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
                      ))}
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