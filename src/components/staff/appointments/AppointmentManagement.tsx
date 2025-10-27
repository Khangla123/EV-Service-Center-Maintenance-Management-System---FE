import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Car, Check, X, Edit, Filter, Plus, UserPlus } from 'lucide-react';
import { MDButton } from '../../ui';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import staffService, { Staff } from '../../../services/staffService';
import serviceOrderService from '../../../services/serviceOrderService';
import './AppointmentManagement.css';

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'today'>('all');
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Staff[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');

  useEffect(() => {
    loadAppointments();
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      // Thử dùng API getAvailableStaff trước
      let allStaff: Staff[] = [];
      try {
        allStaff = await staffService.getAvailableStaff();
        console.log('Available staff loaded:', allStaff);
      } catch (availErr) {
        // Nếu không có quyền, thử getAllStaff
        console.log('Trying getAllStaff instead...');
        allStaff = await staffService.getAllStaff();
        console.log('All staff loaded:', allStaff);
      }
      
      // Lọc staff có thể làm kỹ thuật viên (có specialization hoặc role TECHNICIAN)
      const techs = allStaff.filter(staff => {
        const canBeTechnician = staff.isAvailable !== false && 
                               staff.isActive !== false &&
                               (staff.specialization || 
                                staff.role === 'TECHNICIAN' || 
                                staff.role === 'ROLE_TECHNICIAN');
        return canBeTechnician;
      });
      
      console.log('Filtered technicians:', techs);
      setTechnicians(techs);
      
      // Nếu không có technician nào, hiển thị tất cả staff available
      if (techs.length === 0 && allStaff.length > 0) {
        console.log('No technicians found, showing all available staff');
        setTechnicians(allStaff.filter(s => s.isAvailable !== false && s.isActive !== false));
      }
    } catch (err) {
      console.error('Error loading technicians:', err);
    }
  };

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

  const openAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTechnicianId(appointment.technicianId || '');
    setShowAssignModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleAssignTechnician = async () => {
    if (!selectedAppointment || !selectedTechnicianId) return;
    
    try {
      // Gọi API tạo Service Order từ Appointment và phân công Technician
      await serviceOrderService.createServiceOrderFromAppointment(
        selectedAppointment.id,
        selectedTechnicianId
      );
      
      // Reload danh sách appointments để cập nhật trạng thái
      await loadAppointments();
      setShowAssignModal(false);
      setSelectedAppointment(null);
      setSelectedTechnicianId('');
      
      alert('Đã phân công kỹ thuật viên và tạo đơn dịch vụ thành công!');
    } catch (err: any) {
      console.error('Error assigning technician:', err);
      const errorMsg = err?.response?.data?.message || 'Không thể phân công kỹ thuật viên. Vui lòng thử lại.';
      alert(errorMsg);
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await appointmentService.updateAppointment(selectedAppointment.id, {
        appointmentDate: selectedAppointment.appointmentDate instanceof Date 
          ? selectedAppointment.appointmentDate.toISOString() 
          : selectedAppointment.appointmentDate,
        status: selectedAppointment.status,
        notes: selectedAppointment.notes
      });
      await loadAppointments();
      setShowEditModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Không thể cập nhật lịch hẹn. Vui lòng thử lại.');
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

              {appointment.technicianName && (
                <div className="technician-info">
                  <UserPlus size={16} />
                  <span><strong>KTV:</strong> {appointment.technicianName}</span>
                </div>
              )}

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
                  <MDButton 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => openEditModal(appointment)}
                  >
                    Chỉnh sửa
                  </MDButton>
                  <MDButton 
                    variant="outlined" 
                    size="small" 
                    startIcon={<UserPlus />}
                    onClick={() => openAssignModal(appointment)}
                  >
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

      {/* Assign Technician Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phân công Kỹ thuật viên</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="appointment-info">
                <p><strong>Mã lịch hẹn:</strong> #{selectedAppointment.id.substring(0, 8)}</p>
                <p><strong>Khách hàng:</strong> {selectedAppointment.customerName}</p>
                <p><strong>Dịch vụ:</strong> {selectedAppointment.servicePackageName}</p>
              </div>
              <div className="form-group">
                <label>Chọn kỹ thuật viên:</label>
                <select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Chọn KTV --</option>
                  {technicians.length === 0 && (
                    <option disabled>Không có kỹ thuật viên khả dụng</option>
                  )}
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName} {tech.specialization ? `(${tech.specialization})` : ''}
                    </option>
                  ))}
                </select>
                {technicians.length === 0 && (
                  <small className="text-muted">
                    Vui lòng tạo staff với vai trò Technician hoặc có chuyên môn trong hệ thống
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <MDButton variant="outlined" onClick={() => setShowAssignModal(false)}>
                Hủy
              </MDButton>
              <MDButton 
                variant="filled" 
                onClick={handleAssignTechnician}
                disabled={!selectedTechnicianId}
              >
                Phân công
              </MDButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa lịch hẹn</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateAppointment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Ngày hẹn:</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={selectedAppointment.appointmentDate instanceof Date
                      ? selectedAppointment.appointmentDate.toISOString().slice(0, 16)
                      : new Date(selectedAppointment.appointmentDate).toISOString().slice(0, 16)}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      appointmentDate: new Date(e.target.value)
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái:</label>
                  <select
                    className="form-control"
                    value={selectedAppointment.status}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      status: e.target.value as Appointment['status']
                    })}
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ghi chú:</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={selectedAppointment.notes || ''}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      notes: e.target.value
                    })}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <MDButton variant="outlined" type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </MDButton>
                <MDButton variant="filled" type="submit">
                  Lưu thay đổi
                </MDButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
