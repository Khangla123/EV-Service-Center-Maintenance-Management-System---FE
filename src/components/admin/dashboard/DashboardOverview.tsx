import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  AlertTriangle,
  Clock
} from 'lucide-react';
import appointmentService from '../../../services/appointmentService';
import vehicleService from '../../../services/vehicleService';
import invoiceService from '../../../services/invoiceService';
import './DashboardOverview.css';

interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, vehiclesData, invoicesData] = await Promise.all([
        appointmentService.getAllAppointments(),
        vehicleService.searchVehicles({ page: 1, size: 10000 }).catch(() => ({ vehicles: [], total: 0, page: 1, size: 0 })),
        invoiceService.getAllInvoices().catch(() => [])
      ]);

      setAppointments(appointmentsData.appointments || []);
      setVehicles(vehiclesData.vehicles || []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tính toán doanh thu tháng này
  const calculateMonthlyRevenue = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || invoice.issueDate);
      return invoiceDate.getMonth() === currentMonth && 
             invoiceDate.getFullYear() === currentYear &&
             invoice.status === 'PAID';
    });

    const total = monthlyInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    return total;
  };

  // Tính lịch hẹn trong tuần
  const getWeeklyAppointments = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= weekStart && aptDate <= weekEnd;
    });
  };

  // Tính hiệu suất (appointments completed / total trong tháng này)
  const calculatePerformance = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Lọc appointments trong tháng này, loại trừ CANCELLED
    const thisMonthAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.getMonth() === currentMonth && 
             aptDate.getFullYear() === currentYear &&
             apt.status !== 'CANCELLED';
    });

    if (thisMonthAppointments.length === 0) return 0;
    
    const completed = thisMonthAppointments.filter(apt => apt.status === 'COMPLETED').length;
    return ((completed / thisMonthAppointments.length) * 100).toFixed(1);
  };

  const stats: StatCard[] = [
    {
      label: 'Tổng doanh thu tháng',
      value: `₫${calculateMonthlyRevenue().toLocaleString('vi-VN')}`,
      change: '+15.3%',
      isPositive: true,
      icon: <DollarSign size={24} />
    },
    {
      label: 'Tổng số xe đang quản lý',
      value: vehicles.length.toLocaleString('vi-VN'),
      change: '+8.2%',
      isPositive: true,
      icon: <Users size={24} />
    },
    {
      label: 'Lịch hẹn trong tuần',
      value: getWeeklyAppointments().length.toString(),
      change: '+12%',
      isPositive: true,
      icon: <Calendar size={24} />
    },
    {
      label: 'Hiệu suất trung bình',
      value: `${calculatePerformance()}%`,
      change: '+2.1%',
      isPositive: true,
      icon: <Activity size={24} />
    }
  ];

  // Lấy activities từ appointments gần đây
  const getRecentActivities = () => {
    return appointments
      .sort((a, b) => new Date(b.createdAt || b.appointmentDate).getTime() - new Date(a.createdAt || a.appointmentDate).getTime())
      .slice(0, 4)
      .map((apt, index) => ({
        id: index + 1,
        type: apt.status === 'COMPLETED' ? 'service' : 'appointment',
        description: `${apt.status === 'COMPLETED' ? 'Hoàn thành' : 'Lịch hẹn mới'} - ${apt.customerName || 'Khách hàng'}`,
        time: getTimeAgo(apt.createdAt || apt.appointmentDate)
      }));
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} phút trước`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

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

  const recentActivities = getRecentActivities();

  if (loading) {
    return (
      <div className="dashboard-overview">
        <div className="loading-state">
          <Activity size={48} />
          <p>Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

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
    </div>
  );
};

export default DashboardOverview;
