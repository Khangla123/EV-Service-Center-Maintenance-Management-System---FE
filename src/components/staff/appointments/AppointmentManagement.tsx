import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Car, Check, X, Edit, Filter, Plus } from 'lucide-react';
import { MDButton } from '../../ui';
import { getAllAppointments, Appointment } from '../../../services/mockData';
import './AppointmentManagement.css';

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'today'>('all');
  // const [selectedDate, setSelectedDate] = useState(new Date()); // Reserved for future date filtering

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Use shared mock data
    const sharedMockAppointments = getAllAppointments();
    setAppointments(sharedMockAppointments);
    setLoading(false);
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date();
      return apt.scheduledDate.toDateString() === today.toDateString();
    }
    return apt.status === filter;
  });

  const getStatusColor = (status: Appointment['status']) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      'in-progress': 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      'in-progress': 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status];
  };

  const confirmAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
      )
    );
  };

  const cancelAppointment = (id: string) => {
    setAppointments(prev =>
      prev.map(apt =>
        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
      )
    );
  };

  if (loading) {
    return (
      <div className="appointment-management loading">
        <div className="loading-spinner">Đang tải danh sách lịch hẹn...</div>
      </div>
    );
  }

  return (
    <div className="appointment-management">
      {/* Header Controls */}
      <div className="controls-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({appointments.length})
          </button>
          <button
            className={`filter-tab ${filter === 'today' ? 'active' : ''}`}
            onClick={() => setFilter('today')}
          >
            Hôm nay ({appointments.filter(a => a.scheduledDate.toDateString() === new Date().toDateString()).length})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Chờ xác nhận ({appointments.filter(a => a.status === 'pending').length})
          </button>
          <button
            className={`filter-tab ${filter === 'confirmed' ? 'active' : ''}`}
            onClick={() => setFilter('confirmed')}
          >
            Đã xác nhận ({appointments.filter(a => a.status === 'confirmed').length})
          </button>
        </div>
        <div className="action-buttons">
          <MDButton variant="outlined" startIcon={<Filter />}>
            Lọc nâng cao
          </MDButton>
          <MDButton variant="filled" startIcon={<Plus />}>
            Tạo lịch hẹn mới
          </MDButton>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="appointments-grid">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="card-header">
              <div className="appointment-id">#{appointment.id}</div>
              <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>

            <div className="card-body">
              <div className="customer-section">
                <div className="section-icon">
                  <User size={18} />
                </div>
                <div className="section-content">
                  <div className="customer-name">{appointment.customerName}</div>
                  <div className="customer-phone">{appointment.phone}</div>
                </div>
              </div>

              <div className="vehicle-section">
                <div className="section-icon">
                  <Car size={18} />
                </div>
                <div className="section-content">
                  <div className="vehicle-model">{appointment.vehicleModel}</div>
                  <div className="license-plate">{appointment.licensePlate}</div>
                </div>
              </div>

              <div className="schedule-section">
                <div className="schedule-item">
                  <CalendarIcon size={16} />
                  <span>{new Intl.DateTimeFormat('vi-VN').format(appointment.scheduledDate)}</span>
                </div>
                <div className="schedule-item">
                  <Clock size={16} />
                  <span>{appointment.scheduledTime}</span>
                </div>
              </div>

              <div className="service-type">
                <strong>Dịch vụ:</strong> {appointment.serviceType}
              </div>

              {appointment.technicianName && (
                <div className="technician-info">
                  <strong>KTV:</strong> {appointment.technicianName}
                </div>
              )}

              {appointment.notes && (
                <div className="appointment-notes">
                  <strong>Ghi chú:</strong> {appointment.notes}
                </div>
              )}
            </div>

            <div className="card-footer">
              {appointment.status === 'pending' && (
                <>
                  <MDButton
                    variant="filled"
                    size="small"
                    startIcon={<Check />}
                    onClick={() => confirmAppointment(appointment.id)}
                  >
                    Xác nhận
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    size="small"
                    startIcon={<X />}
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    Từ chối
                  </MDButton>
                </>
              )}
              {(appointment.status === 'confirmed' || appointment.status === 'in-progress') && (
                <>
                  <MDButton variant="outlined" size="small" startIcon={<Edit />}>
                    Chỉnh sửa
                  </MDButton>
                  <MDButton variant="outlined" size="small" startIcon={<User />}>
                    Phân công KTV
                  </MDButton>
                </>
              )}
              {appointment.status === 'completed' && (
                <MDButton variant="outlined" size="small">
                  Xem chi tiết
                </MDButton>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="no-appointments">
          <p>Không có lịch hẹn nào</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
