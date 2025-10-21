import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Car, Check, X, Edit, Filter, Plus } from 'lucide-react';
import { MDButton } from '../../ui';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import './AppointmentManagement.css';

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'today'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await appointmentService.getAllAppointments();
      setAppointments(response.appointments || []);
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date();
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === today.toDateString();
    }
    return apt.status === filter;
  });

  const getStatusColor = (status: Appointment['status']) => {
    const colors: Record<Appointment['status'], string> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels: Record<Appointment['status'], string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      IN_PROGRESS: 'Đang xử lý',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return labels[status];
  };

  const confirmAppointment = async (id: string) => {
    try {
      await appointmentService.updateAppointment(id, { status: 'CONFIRMED' });
      await loadAppointments();
    } catch (err) {
      console.error('Error confirming appointment:', err);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      await loadAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
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
            Hôm nay ({appointments.filter(a => {
              const aptDate = new Date(a.appointmentDate);
              return aptDate.toDateString() === new Date().toDateString();
            }).length})
          </button>
          <button
            className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Chờ xác nhận ({appointments.filter(a => a.status === 'PENDING').length})
          </button>
          <button
            className={`filter-tab ${filter === 'CONFIRMED' ? 'active' : ''}`}
            onClick={() => setFilter('CONFIRMED')}
          >
            Đã xác nhận ({appointments.filter(a => a.status === 'CONFIRMED').length})
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
                </div>
              </div>

              <div className="vehicle-section">
                <div className="section-icon">
                  <Car size={18} />
                </div>
                <div className="section-content">
                  <div className="vehicle-model">Trung tâm: {appointment.serviceCenterName}</div>
                </div>
              </div>

              <div className="schedule-section">
                <div className="schedule-item">
                  <CalendarIcon size={16} />
                  <span>{new Intl.DateTimeFormat('vi-VN').format(new Date(appointment.appointmentDate))}</span>
                </div>
                <div className="schedule-item">
                  <Clock size={16} />
                  <span>{new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="service-type">
                <strong>Gói dịch vụ:</strong> {appointment.servicePackageName}
              </div>

              {appointment.notes && (
                <div className="appointment-notes">
                  <strong>Ghi chú:</strong> {appointment.notes}
                </div>
              )}
            </div>

            <div className="card-footer">
              {appointment.status === 'PENDING' && (
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
              {(appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
                <>
                  <MDButton variant="outlined" size="small" startIcon={<Edit />}>
                    Chỉnh sửa
                  </MDButton>
                  <MDButton variant="outlined" size="small" startIcon={<User />}>
                    Phân công KTV
                  </MDButton>
                </>
              )}
              {appointment.status === 'COMPLETED' && (
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
