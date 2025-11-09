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
import './CustomerDashboard.css';

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [monthlyCost, setMonthlyCost] = useState('0');
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const stats = [
    { label: 'Xe của tôi', value: vehicleCount.toString(), icon: Car, gradient: 'from-blue-500 to-blue-600', link: '/customer/vehicles' },
    { label: 'Theo dõi lịch dịch vụ', value: appointmentCount.toString(), icon: Calendar, gradient: 'from-green-500 to-green-600', link: '/customer/appointments' },
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
    // Load user data from API
    const loadUserData = async () => {
      try {
        // Load vehicles
        const vehicles = await vehicleService.getMyVehicles();
        setVehicleCount(vehicles.length);

        // Load appointments
        const { appointments } = await appointmentService.getMyAppointments();
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Filter upcoming appointments (PENDING or CONFIRMED)
        const upcoming = appointments
          .filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED')
          .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
          .slice(0, 5)
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
        setAppointmentCount(appointments.filter(a => 
          a.status === 'PENDING' || a.status === 'CONFIRMED'
        ).length);
        
        const completed = appointments.filter(a => a.status === 'COMPLETED');
        setCompletedCount(completed.length);
        
        // Calculate monthly cost from completed appointments this month
        const monthlyTotal = appointments
          .filter(a => {
            const aptDate = new Date(a.appointmentDate);
            return a.status === 'COMPLETED' && 
                   aptDate.getMonth() === currentMonth && 
                   aptDate.getFullYear() === currentYear;
          })
          .reduce((sum, a) => sum + ((a as any).totalCost || 0), 0);
        
        setMonthlyCost(new Intl.NumberFormat('vi-VN', { 
          style: 'currency', 
          currency: 'VND',
          maximumFractionDigits: 0
        }).format(monthlyTotal));
        
        // Recent activities (last 5 completed appointments)
        const recent = appointments
          .filter(a => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS')
          .sort((a, b) => new Date(b.updatedAt || b.appointmentDate).getTime() - new Date(a.updatedAt || a.appointmentDate).getTime())
          .slice(0, 5)
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