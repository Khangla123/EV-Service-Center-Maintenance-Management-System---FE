import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  AlertTriangle,
  Package,
  Award,
  Clock
} from 'lucide-react';
import './DashboardOverview.css';

interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const DashboardOverview: React.FC = () => {
  const stats: StatCard[] = [
    {
      label: 'Tổng doanh thu tháng',
      value: '₫325,450,000',
      change: '+15.3%',
      isPositive: true,
      icon: <DollarSign size={24} />
    },
    {
      label: 'Tổng số xe đang quản lý',
      value: '1,234',
      change: '+8.2%',
      isPositive: true,
      icon: <Users size={24} />
    },
    {
      label: 'Lịch hẹn trong tuần',
      value: '156',
      change: '+12%',
      isPositive: true,
      icon: <Calendar size={24} />
    },
    {
      label: 'Hiệu suất trung bình',
      value: '94.5%',
      change: '+2.1%',
      isPositive: true,
      icon: <Activity size={24} />
    }
  ];

  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Tồn kho thấp',
      message: 'Pin VinFast VF8 chỉ còn 3 chiếc',
      time: '10 phút trước'
    },
    {
      id: 2,
      type: 'danger',
      title: 'Lịch hẹn quá tải',
      message: 'Ngày 15/10 đã đầy, cần điều phối',
      time: '25 phút trước'
    },
    {
      id: 3,
      type: 'warning',
      title: 'Chứng chỉ sắp hết hạn',
      message: 'KTV Hoàng Văn Kỹ - hết hạn 20/10',
      time: '1 giờ trước'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      description: 'Lịch hẹn mới được tạo - Nguyễn Văn A',
      time: '5 phút trước'
    },
    {
      id: 2,
      type: 'payment',
      description: 'Thanh toán hoàn thành - ₫2,500,000',
      time: '15 phút trước'
    },
    {
      id: 3,
      type: 'service',
      description: 'Hoàn thành bảo dưỡng VF9 - KTV Đỗ Văn Thuật',
      time: '30 phút trước'
    },
    {
      id: 4,
      type: 'user',
      description: 'Khách hàng mới đăng ký - Trần Thị B',
      time: '1 giờ trước'
    }
  ];

  const topServices = [
    { name: 'Bảo dưỡng định kỳ', count: 45, revenue: '₫112.5M', percentage: 35 },
    { name: 'Thay pin EV', count: 28, revenue: '₫98.0M', percentage: 28 },
    { name: 'Kiểm tra hệ thống điện', count: 38, revenue: '₫57.0M', percentage: 22 },
    { name: 'Sửa chữa khẩn cấp', count: 12, revenue: '₫36.0M', percentage: 15 }
  ];

  return (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h1>Dashboard Tổng Quan</h1>
        <p>Giám sát hoạt động trung tâm dịch vụ EV</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                {stat.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{stat.change} so với tháng trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main-grid">
        {/* Alerts Section */}
        <div className="dashboard-section alerts-section">
          <div className="section-header">
            <AlertTriangle size={20} />
            <h2>Cảnh báo Quan trọng</h2>
          </div>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-${alert.type}`}>
                <div className="alert-icon">
                  <AlertTriangle size={18} />
                </div>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-section activities-section">
          <div className="section-header">
            <Clock size={20} />
            <h2>Hoạt động Gần đây</h2>
          </div>
          <div className="activities-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className={`activity-icon activity-${activity.type}`}>
                  {activity.type === 'appointment' && <Calendar size={16} />}
                  {activity.type === 'payment' && <DollarSign size={16} />}
                  {activity.type === 'service' && <Activity size={16} />}
                  {activity.type === 'user' && <Users size={16} />}
                </div>
                <div className="activity-content">
                  <p>{activity.description}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="dashboard-section top-services-section">
        <div className="section-header">
          <Award size={20} />
          <h2>Dịch vụ Phổ biến Nhất</h2>
        </div>
        <div className="top-services-grid">
          {topServices.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-header">
                <h4>{service.name}</h4>
                <span className="service-count">{service.count} lần</span>
              </div>
              <div className="service-revenue">{service.revenue}</div>
              <div className="service-bar">
                <div 
                  className="service-bar-fill" 
                  style={{ width: `${service.percentage}%` }}
                />
              </div>
              <div className="service-percentage">{service.percentage}% tổng doanh thu</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
