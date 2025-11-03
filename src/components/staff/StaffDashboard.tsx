import React, { useState } from 'react';
import { 
  Users, Calendar, Wrench, Package,
  MessageSquare, TrendingUp, Bell, FileText
} from 'lucide-react';
import { CustomerManagement } from './customers';
import { AppointmentManagement } from './appointments';
import { InvoiceManagement } from './invoices';
import './StaffDashboard.css';

type StaffView = 
  | 'overview'
  | 'customers'
  | 'appointments'
  | 'invoices';

const StaffDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<StaffView>('overview');

  const stats = [
    {
      icon: <Calendar className="stat-icon" />,
      label: 'Lịch hẹn hôm nay',
      value: '12',
      trend: '+3',
      color: 'blue'
    },
    {
      icon: <Wrench className="stat-icon" />,
      label: 'Đang bảo dưỡng',
      value: '8',
      trend: '2 hoàn tất',
      color: 'orange'
    },
    {
      icon: <Users className="stat-icon" />,
      label: 'Khách hàng mới',
      value: '5',
      trend: '+2 tuần này',
      color: 'green'
    },
    {
      icon: <Package className="stat-icon" />,
      label: 'Phụ tùng sắp hết',
      value: '4',
      trend: 'Cần đặt hàng',
      color: 'red'
    }
  ];

  const menuItems = [
    { id: 'overview', icon: <TrendingUp />, label: 'Tổng quan', color: '#667eea' },
    { id: 'customers', icon: <Users />, label: 'Quản lý Khách hàng', color: '#10b981' },
    { id: 'appointments', icon: <Calendar />, label: 'Quản lý Lịch hẹn', color: '#3b82f6' },
    { id: 'invoices', icon: <FileText />, label: 'Quản lý Hóa đơn', color: '#f59e0b' }
  ] as const;

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
                <button className="action-btn" onClick={() => setCurrentView('appointments')}>
                  <Calendar />
                  <span>Tạo lịch hẹn mới</span>
                </button>
                <button className="action-btn" onClick={() => setCurrentView('customers')}>
                  <Users />
                  <span>Thêm khách hàng</span>
                </button>
              </div>
            </div>

            <div className="recent-activities">
              <h3>Hoạt động gần đây</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon blue">
                    <Calendar />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Lịch hẹn mới từ Nguyễn Văn A</div>
                    <div className="activity-time">5 phút trước</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon green">
                    <Wrench />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Hoàn thành bảo dưỡng VF8 - BKS: 30A-123.45</div>
                    <div className="activity-time">15 phút trước</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon red">
                    <Bell />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Cảnh báo: Pin Li-ion sắp hết hàng</div>
                    <div className="activity-time">30 phút trước</div>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon orange">
                    <MessageSquare />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">Tin nhắn mới từ khách hàng Trần Thị B</div>
                    <div className="activity-time">1 giờ trước</div>
                  </div>
                </div>
              </div>
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
              onClick={() => setCurrentView(item.id as StaffView)}
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
            {menuItems.find(item => item.id === currentView)?.label || 'Tổng quan'}
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
