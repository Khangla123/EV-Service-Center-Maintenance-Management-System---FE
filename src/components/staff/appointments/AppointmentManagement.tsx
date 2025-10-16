import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Car, Check, X, Edit, Filter, Plus } from 'lucide-react';
import { MDButton } from '../../ui';
import { appointmentService } from '../../../services';
import './AppointmentManagement.css';

interface StaffAppointment {
  id: string;
  customerName: string;
  phone: string;
  vehicleModel: string;
  licensePlate: string;
  scheduledDate: Date;
  scheduledTime: string;
  serviceType: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  technicianName?: string;
  notes?: string;
}

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<StaffAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'today'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      
      // Get all appointments from API
      const { appointments: allAppointments } = await appointmentService.getAllAppointments();
      
      // Convert to staff appointment format
      const convertedAppointments: StaffAppointment[] = allAppointments.map((apt: any) => {
        const appointmentDate = new Date(apt.appointmentDate);
        
        return {
          id: apt.id,
          customerName: apt.customerName || 'N/A',
          phone: apt.customerPhone || 'N/A',
          vehicleModel: apt.vehicleModel || 'N/A',
          licensePlate: apt.vehicleLicensePlate || 'N/A',
          scheduledDate: appointmentDate,
          scheduledTime: appointmentDate.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          serviceType: apt.servicePackageName || 'N/A',
          status: apt.status?.toLowerCase() || 'pending',
          technicianName: apt.technicianName,
          notes: apt.notes
        };
      });
      
      setAppointments(convertedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      const today = new Date();
      return apt.scheduledDate.toDateString() === today.toDateString();
    }
    return apt.status === filter;
  });

  const getStatusColor = (status: StaffAppointment['status']) => {
    const colors: Record<StaffAppointment['status'], string> = {
      pending: 'warning',
      confirmed: 'info',
      'in-progress': 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status];
  };

  const getStatusLabel = (status: StaffAppointment['status']) => {
    const labels: Record<StaffAppointment['status'], string> = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      'in-progress': 'Đang xử lý',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return labels[status];
  };

  const confirmAppointment = async (id: string) => {
    try {
      await appointmentService.updateAppointment(id, {
        status: 'CONFIRMED'
      });
      
      // Update local state
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === id ? { ...apt, status: 'confirmed' as const } : apt
        )
      );
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Không thể xác nhận lịch hẹn. Vui lòng thử lại!');
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      
      // Reload appointments to get updated data
      await loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Không thể hủy lịch hẹn. Vui lòng thử lại!');
    }
  };

  const editAppointment = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) return;
    
    alert(`Chức năng chỉnh sửa lịch hẹn:\n\nKhách hàng: ${appointment.customerName}\nXe: ${appointment.vehicleModel} (${appointment.licensePlate})\nThời gian: ${appointment.scheduledDate.toLocaleDateString('vi-VN')} ${appointment.scheduledTime}\nDịch vụ: ${appointment.serviceType}\n\nChức năng đang được phát triển...`);
    // TODO: Open edit modal with appointment details
  };

  const assignTechnician = (id: string) => {
    const appointment = appointments.find(apt => apt.id === id);
    if (!appointment) return;
    
    alert(`Chức năng phân công kỹ thuật viên:\n\nLịch hẹn: ${appointment.customerName}\nXe: ${appointment.vehicleModel} (${appointment.licensePlate})\nThời gian: ${appointment.scheduledDate.toLocaleDateString('vi-VN')} ${appointment.scheduledTime}\n\nChức năng đang được phát triển...`);
    // TODO: Open technician assignment modal
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
                  <MDButton 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => editAppointment(appointment.id)}
                  >
                    Chỉnh sửa
                  </MDButton>
                  <MDButton 
                    variant="outlined" 
                    size="small" 
                    startIcon={<User />}
                    onClick={() => assignTechnician(appointment.id)}
                  >
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
