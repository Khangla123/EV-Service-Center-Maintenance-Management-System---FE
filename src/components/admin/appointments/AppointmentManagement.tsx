import React, { useState, useEffect } from 'react';
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
  Wrench,
  UserPlus,
  X
} from 'lucide-react';
import './AppointmentManagement.css';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import staffService, { Staff } from '../../../services/staffService';

const AppointmentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('today');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [availableTechnicians, setAvailableTechnicians] = useState<Staff[]>([]);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');
  const [editNotes, setEditNotes] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAppointment, setDetailAppointment] = useState<Appointment | null>(null);
  const [technicianAvailability, setTechnicianAvailability] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAppointments();
    loadTechnicians();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { appointments: data } = await appointmentService.getAllAppointments();
      console.log('Appointments loaded:', data);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      alert('Không thể tải danh sách lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  const getTechnicianName = (appointment: Appointment): string => {
    // Ưu tiên lấy từ DB
    if (appointment.technicianName) {
      return appointment.technicianName;
    }
    
    // Fallback: parse từ notes (cho data cũ)
    if (appointment.notes) {
      const match = appointment.notes.match(/Technician: (.+?) \(/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return 'Chưa phân công';
  };

  const loadTechnicians = async () => {
    try {
      const allStaff = await staffService.getAllStaff();
      // Lọc chỉ lấy technician
      const technicians = allStaff.filter(s => s.role.toUpperCase() === 'TECHNICIAN' && s.isActive);
      console.log('Available technicians:', technicians);
      setAvailableTechnicians(technicians);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const handleAssignClick = async (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTechnicianId('');
    setShowAssignModal(true);
    
    // Check availability for each technician
    await checkTechniciansAvailability(appointment.appointmentDate);
  };

  const checkTechniciansAvailability = async (appointmentDate: Date) => {
    console.log('Checking availability for appointment date:', appointmentDate);
    const availabilityMap: Record<string, boolean> = {};
    
    for (const tech of availableTechnicians) {
      try {
        const isAvailable = await staffService.checkAvailability(
          tech.id,
          new Date(appointmentDate).toISOString()
        );
        console.log(`Technician ${tech.fullName} (${tech.id}): ${isAvailable ? 'AVAILABLE' : 'BUSY'}`);
        availabilityMap[tech.id] = isAvailable;
      } catch (error) {
        console.error(`Error checking availability for ${tech.fullName}:`, error);
        availabilityMap[tech.id] = false;
      }
    }
    
    console.log('Final availability map:', availabilityMap);
    setTechnicianAvailability(availabilityMap);
  };

  const handleAssignTechnician = async () => {
    if (!selectedAppointment || !selectedTechnicianId) {
      alert('Vui lòng chọn kỹ thuật viên');
      return;
    }

    try {
      const selectedTech = availableTechnicians.find(t => t.id === selectedTechnicianId);
      
      // Gửi technicianId vào database
      await appointmentService.updateAppointment(selectedAppointment.id, {
        status: 'CONFIRMED',
        technicianId: selectedTechnicianId, // Lưu vào DB
      });
      
      alert(`Đã phân công kỹ thuật viên: ${selectedTech?.fullName}`);
      setShowAssignModal(false);
      loadAppointments(); // Reload danh sách
    } catch (error) {
      console.error('Error assigning technician:', error);
      alert('Không thể phân công kỹ thuật viên');
    }
  };

  const handleEditClick = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setEditStatus(appointment.status);
    setEditNotes(appointment.notes || '');
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      await appointmentService.updateAppointment(editingAppointment.id, {
        status: editStatus,
        notes: editNotes,
      });
      
      alert('Cập nhật lịch hẹn thành công!');
      setShowEditModal(false);
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Không thể cập nhật lịch hẹn');
    }
  };

  const handleViewDetails = (appointment: Appointment) => {
    setDetailAppointment(appointment);
    setShowDetailModal(true);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
      return;
    }

    try {
      await appointmentService.cancelAppointment(appointmentId);
      alert('Đã hủy lịch hẹn');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Không thể hủy lịch hẹn');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const normalizedStatus = status.toUpperCase().replace('_', '-');
    switch (normalizedStatus) {
      case 'PENDING': return 'status-pending';
      case 'CONFIRMED': return 'status-confirmed';
      case 'IN-PROGRESS': return 'status-in-progress';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'CONFIRMED': return <CheckCircle size={14} />;
      case 'IN_PROGRESS': 
      case 'IN-PROGRESS': return <Clock size={14} />;
      case 'COMPLETED': return <CheckCircle size={14} />;
      case 'CANCELLED': return <XCircle size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getStatusText = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'IN_PROGRESS':
      case 'IN-PROGRESS': return 'Đang thực hiện';
      case 'COMPLETED': return 'Hoàn thành';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = 
      apt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.servicePackageName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.serviceCenterName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apt.status.toUpperCase() === filterStatus.toUpperCase();
    
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
      value: appointments.filter(a => a.status.toUpperCase() === 'PENDING').length,
      icon: <AlertCircle size={20} />,
      color: 'yellow'
    },
    {
      label: 'Đang thực hiện',
      value: appointments.filter(a => a.status.toUpperCase() === 'IN_PROGRESS').length,
      icon: <Clock size={20} />,
      color: 'purple'
    },
    {
      label: 'Hoàn thành',
      value: appointments.filter(a => a.status.toUpperCase() === 'COMPLETED').length,
      icon: <CheckCircle size={20} />,
      color: 'green'
    }
  ];

  if (loading) {
    return (
      <div className="appointment-management">
        <div className="loading-state">
          <Calendar size={48} />
          <p>Đang tải danh sách lịch hẹn...</p>
        </div>
      </div>
    );
  }

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
        {filteredAppointments.length === 0 ? (
          <div className="no-results">
            <Calendar size={48} />
            <p>Không tìm thấy lịch hẹn nào</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => {
            const appointmentDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : null;
            const timeStr = appointmentDate ? appointmentDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            const dateStr = appointmentDate ? appointmentDate.toLocaleDateString('vi-VN') : 'N/A';

            return (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-time">
                  <Clock size={20} />
                  <div>
                    <p className="time">{timeStr}</p>
                    <p className="date">{dateStr}</p>
                  </div>
                </div>

                <div className="appointment-details">
                  <div className="detail-row">
                    <User size={16} />
                    <div>
                      <p className="label">Khách hàng</p>
                      <p className="value">{appointment.customerName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <Wrench size={16} />
                    <div>
                      <p className="label">Dịch vụ</p>
                      <p className="value">{appointment.servicePackageName || 'N/A'}</p>
                      <p className="sub-value">{appointment.serviceCenterName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="detail-row">
                    <Users size={16} />
                    <div>
                      <p className="label">Kỹ thuật viên</p>
                      <p className="value">{getTechnicianName(appointment)}</p>
                    </div>
                  </div>
                </div>

                <div className="appointment-status">
                  <span className={`status-badge ${getStatusBadgeClass(appointment.status)}`}>
                    {getStatusIcon(appointment.status)}
                    {getStatusText(appointment.status)}
                  </span>
                </div>

                <div className="appointment-actions">
                  <button 
                    className="btn-action btn-view"
                    onClick={() => handleViewDetails(appointment)}
                  >
                    Xem chi tiết
                  </button>
                  {appointment.status.toUpperCase() === 'PENDING' && (
                    <button 
                      className="btn-action btn-assign"
                      onClick={() => handleAssignClick(appointment)}
                    >
                      <UserPlus size={16} />
                      Phân công
                    </button>
                  )}
                  {appointment.status.toUpperCase() !== 'PENDING' && appointment.status.toUpperCase() !== 'CANCELLED' && (
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(appointment)}
                    >
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal phân công kỹ thuật viên */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Phân công kỹ thuật viên</h2>
              <button className="btn-close" onClick={() => setShowAssignModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="appointment-info">
                <h3>Thông tin lịch hẹn</h3>
                <p><strong>Khách hàng:</strong> {selectedAppointment?.customerName}</p>
                <p><strong>Dịch vụ:</strong> {selectedAppointment?.servicePackageName}</p>
                <p><strong>Thời gian:</strong> {selectedAppointment?.appointmentDate ? 
                  new Date(selectedAppointment.appointmentDate).toLocaleString('vi-VN') : 'N/A'
                }</p>
              </div>

              <div className="technician-select">
                <h3>Chọn kỹ thuật viên</h3>
                {availableTechnicians.length === 0 ? (
                  <p className="no-technicians">Không có kỹ thuật viên sẵn sàng</p>
                ) : (
                  <div className="technician-list">
                    {availableTechnicians.map(tech => {
                      const isAvailable = technicianAvailability[tech.id] !== false;
                      return (
                        <div 
                          key={tech.id}
                          className={`technician-card ${selectedTechnicianId === tech.id ? 'selected' : ''} ${!isAvailable ? 'unavailable' : ''}`}
                          onClick={() => isAvailable && setSelectedTechnicianId(tech.id)}
                          style={{ cursor: isAvailable ? 'pointer' : 'not-allowed', opacity: isAvailable ? 1 : 0.6 }}
                        >
                          <div className="tech-avatar">
                            {tech.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="tech-info">
                            <p className="tech-name">{tech.fullName}</p>
                            <p className="tech-email">{tech.email}</p>
                            <span className={`tech-status ${isAvailable ? 'available' : 'busy'}`}>
                              {isAvailable ? '⚡ Sẵn sàng' : '🔧 Đang bận'}
                            </span>
                          </div>
                          {selectedTechnicianId === tech.id && (
                            <CheckCircle size={20} className="check-icon" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowAssignModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-confirm"
                onClick={handleAssignTechnician}
                disabled={!selectedTechnicianId}
              >
                Xác nhận phân công
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa lịch hẹn */}
      {showEditModal && editingAppointment && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa lịch hẹn</h2>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="appointment-info">
                <h3>Thông tin lịch hẹn</h3>
                <p><strong>Khách hàng:</strong> {editingAppointment.customerName}</p>
                <p><strong>Dịch vụ:</strong> {editingAppointment.servicePackageName}</p>
                <p><strong>Thời gian:</strong> {editingAppointment.appointmentDate ? 
                  new Date(editingAppointment.appointmentDate).toLocaleString('vi-VN') : 'N/A'
                }</p>
              </div>

              <div className="edit-form">
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="IN_PROGRESS">Đang thực hiện</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="form-textarea"
                    rows={4}
                    placeholder="Nhập ghi chú về lịch hẹn..."
                  />
                </div>

                <div className="status-info">
                  <p><strong>Trạng thái hiện tại:</strong> {getStatusText(editingAppointment.status)}</p>
                  <p><strong>Trạng thái mới:</strong> {getStatusText(editStatus)}</p>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-delete"
                onClick={() => {
                  setShowEditModal(false);
                  handleCancelAppointment(editingAppointment.id);
                }}
              >
                Hủy lịch hẹn
              </button>
              <button 
                className="btn-confirm"
                onClick={handleUpdateAppointment}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết lịch hẹn</h3>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4><User size={18} /> Thông tin khách hàng</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Tên khách hàng:</span>
                    <span className="value">{detailAppointment.customerName}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><Wrench size={18} /> Thông tin xe</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Biển số xe:</span>
                    <span className="value">{detailAppointment.vehicleLicensePlate}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Mẫu xe:</span>
                    <span className="value">{detailAppointment.vehicleModel}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><Calendar size={18} /> Thông tin dịch vụ</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Trung tâm:</span>
                    <span className="value">{detailAppointment.serviceCenterName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Gói dịch vụ:</span>
                    <span className="value">{detailAppointment.servicePackageName}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Ngày hẹn:</span>
                    <span className="value">
                      {new Date(detailAppointment.appointmentDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4><UserPlus size={18} /> Phân công</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Kỹ thuật viên:</span>
                    <span className="value">{getTechnicianName(detailAppointment)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Trạng thái:</span>
                    <span className={`status-badge ${getStatusBadgeClass(detailAppointment.status)}`}>
                      {getStatusIcon(detailAppointment.status)}
                      {getStatusText(detailAppointment.status)}
                    </span>
                  </div>
                </div>
              </div>

              {detailAppointment.notes && (
                <div className="detail-section">
                  <h4>Ghi chú</h4>
                  <div className="notes-content">
                    {detailAppointment.notes}
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h4><Clock size={18} /> Thời gian</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="label">Ngày tạo:</span>
                    <span className="value">
                      {detailAppointment.createdAt ? 
                        new Date(detailAppointment.createdAt).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Cập nhật lần cuối:</span>
                    <span className="value">
                      {detailAppointment.updatedAt ? 
                        new Date(detailAppointment.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  {detailAppointment.estimatedCompletion && (
                    <div className="detail-item">
                      <span className="label">Dự kiến hoàn thành:</span>
                      <span className="value">
                        {new Date(detailAppointment.estimatedCompletion).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                  {detailAppointment.actualCompletion && (
                    <div className="detail-item">
                      <span className="label">Hoàn thành thực tế:</span>
                      <span className="value">
                        {new Date(detailAppointment.actualCompletion).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
