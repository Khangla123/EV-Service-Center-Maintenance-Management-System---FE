import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Wrench
} from 'lucide-react';
import './AppointmentManagement.css';

interface Appointment {
  id: string;
  customerName: string;
  vehicleModel: string;
  serviceName: string;
  technicianName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
}

const AppointmentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');

  const [appointments] = useState<Appointment[]>([
    {
      id: '1',
      customerName: 'Nguyễn Văn A',
      vehicleModel: 'VinFast VF8',
      serviceName: 'Bảo dưỡng định kỳ',
      technicianName: 'Hoàng Văn Kỹ',
      date: '2025-10-13',
      time: '09:00',
      status: 'confirmed',
      priority: 'normal'
    },
    {
      id: '2',
      customerName: 'Trần Thị B',
      vehicleModel: 'VinFast VF9',
      serviceName: 'Thay pin EV',
      technicianName: 'Đỗ Văn Thuật',
      date: '2025-10-13',
      time: '11:30',
      status: 'in-progress',
      priority: 'urgent'
    },
    {
      id: '3',
      customerName: 'Lê Văn C',
      vehicleModel: 'VinFast VF8',
      serviceName: 'Kiểm tra hệ thống điện',
      technicianName: 'Hoàng Văn Kỹ',
      date: '2025-10-13',
      time: '14:00',
      status: 'pending',
      priority: 'normal'
    },
    {
      id: '4',
      customerName: 'Phạm Thị D',
      vehicleModel: 'VinFast VF5',
      serviceName: 'Sửa chữa khẩn cấp',
      technicianName: 'Đỗ Văn Thuật',
      date: '2025-10-13',
      time: '16:30',
      status: 'pending',
      priority: 'urgent'
    }
  ]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'in-progress': return 'status-in-progress';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={14} />;
      case 'in-progress': return <Clock size={14} />;
      case 'completed': return <CheckCircle size={14} />;
      case 'cancelled': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.vehicleModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: 'Tổng lịch hẹn',
      value: appointments.length,
      icon: <Calendar size={20} />,
      color: 'blue'
    },
    {
      label: 'Chờ xác nhận',
      value: appointments.filter(a => a.status === 'pending').length,
      icon: <AlertCircle size={20} />,
      color: 'yellow'
    },
    {
      label: 'Đang thực hiện',
      value: appointments.filter(a => a.status === 'in-progress').length,
      icon: <Clock size={20} />,
      color: 'purple'
    },
    {
      label: 'Hoàn thành',
      value: appointments.filter(a => a.status === 'completed').length,
      icon: <CheckCircle size={20} />,
      color: 'green'
    }
  ];

  return (
    <div className="appointment-management">
      <div className="appointment-header">
        <div className="header-left">
          <h1>Quản lý Lịch hẹn</h1>
          <p>Điều phối và theo dõi lịch hẹn toàn trung tâm</p>
        </div>
      </div>

      {/* Stats */}
      <div className="appointment-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="appointment-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng, dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="in-progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-list">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="appointment-card">
            <div className="appointment-time">
              <Clock size={20} />
              <div>
                <p className="time">{appointment.time}</p>
                <p className="date">{new Date(appointment.date).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="appointment-details">
              <div className="detail-row">
                <User size={16} />
                <div>
                  <p className="label">Khách hàng</p>
                  <p className="value">{appointment.customerName}</p>
                </div>
              </div>

              <div className="detail-row">
                <Wrench size={16} />
                <div>
                  <p className="label">Dịch vụ</p>
                  <p className="value">{appointment.serviceName}</p>
                  <p className="sub-value">{appointment.vehicleModel}</p>
                </div>
              </div>

              <div className="detail-row">
                <Users size={16} />
                <div>
                  <p className="label">Kỹ thuật viên</p>
                  <p className="value">{appointment.technicianName}</p>
                </div>
              </div>
            </div>

            <div className="appointment-status">
              <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                {getStatusIcon(appointment.status)}
                {getStatusText(appointment.status)}
              </span>
              {appointment.priority === 'urgent' && (
                <span className="priority-badge urgent">Khẩn cấp</span>
              )}
            </div>

            <div className="appointment-actions">
              <button className="btn-action btn-view">Xem chi tiết</button>
              <button className="btn-action btn-edit">Chỉnh sửa</button>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="no-results">
          <Calendar size={48} />
          <p>Không tìm thấy lịch hẹn nào</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
