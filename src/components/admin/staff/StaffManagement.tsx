import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import './StaffManagement.css';
import staffService, { Staff, CreateStaffRequest } from '../../../services/staffService';
import serviceCenterService, { ServiceCenter } from '../../../services/serviceCenterService';

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'STAFF' | 'TECHNICIAN'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  
  // Form states for adding new staff
  const [newStaff, setNewStaff] = useState<CreateStaffRequest>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'STAFF',
    serviceCenterId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStaff();
    loadServiceCenters();
  }, []);

  const loadServiceCenters = async () => {
    try {
      const response = await serviceCenterService.getAllServiceCenters();
      setServiceCenters(response.serviceCenters || []);
    } catch (error) {
      console.error('Error loading service centers:', error);
      setServiceCenters([]);
    }
  };

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await staffService.getAllStaff();
      console.log('Staff data loaded:', data);
      console.log('Number of staff:', data?.length || 0);
      
      // Log currentStatus để debug
      data.forEach(staff => {
        console.log(`${staff.fullName} - Role: ${staff.role} - CurrentStatus: ${staff.currentStatus}`);
      });
      
      setStaffList(data || []);
      
      if (!data || data.length === 0) {
        console.warn('No staff found in database');
      }
    } catch (error) {
      console.error('Error loading staff:', error);
      alert('Không thể tải danh sách nhân viên: ' + (error as any)?.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role.toUpperCase() === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && staff.isActive) ||
      (filterStatus === 'inactive' && !staff.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = () => {
    // Reset form
    setNewStaff({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'STAFF',
      serviceCenterId: ''
    });
    setShowAddModal(true);
  };

  const handleSubmitNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newStaff.email || !newStaff.password || !newStaff.fullName || !newStaff.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newStaff.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      // Backend will convert role to lowercase automatically
      await staffService.createStaff(newStaff as any);
      alert('Thêm nhân viên thành công!');
      setShowAddModal(false);
      loadStaff(); // Reload list
    } catch (error: any) {
      console.error('Error creating staff:', error);
      alert(error?.response?.data?.message || 'Không thể thêm nhân viên. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setEditingStaff(staff);
      setShowEditModal(true);
    }
  };

  const handleSubmitEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingStaff) return;

    // Validation
    if (!editingStaff.fullName || !editingStaff.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmitting(true);
      await staffService.updateStaff(editingStaff.id, {
        fullName: editingStaff.fullName,
        phone: editingStaff.phone,
      });
      
      alert('Cập nhật nhân viên thành công');
      setShowEditModal(false);
      setEditingStaff(null);
      loadStaff();
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('Không thể cập nhật nhân viên: ' + (error as any)?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setDeletingStaff(staff);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteStaff = async () => {
    if (!deletingStaff) return;

    try {
      setSubmitting(true);
      await staffService.deleteStaff(deletingStaff.id);
      alert('Xóa nhân viên thành công');
      setShowDeleteModal(false);
      setDeletingStaff(null);
      loadStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Không thể xóa nhân viên: ' + (error as any)?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    try {
      const staff = staffList.find(s => s.id === staffId);
      if (staff) {
        // Toggle isActive status (for STAFF only)
        await staffService.updateStaff(staffId, {
          fullName: staff.fullName,
          phone: staff.phone,
        });
        loadStaff();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleToggleAvailability = async (staffId: string) => {
    try {
      const staff = staffList.find(s => s.id === staffId);
      if (staff && staff.role.toUpperCase() === 'TECHNICIAN') {
        // Toggle isAvailable status (for TECHNICIAN only)
        await staffService.updateStaff(staffId, {
          fullName: staff.fullName,
          phone: staff.phone,
        });
        loadStaff();
        alert(`Đã cập nhật trạng thái kỹ thuật viên thành ${!staff.isAvailable ? 'Rảnh' : 'Bận'}`);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Không thể cập nhật trạng thái rảnh/bận');
    }
  };

  if (loading) {
    return (
      <div className="staff-management">
        <div className="loading-state">
          <Users size={48} />
          <p>Đang tải danh sách nhân viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-management">
      <div className="staff-header">
        <h1>Quản lý Nhân sự</h1>
        <p>Quản lý thông tin nhân viên và kỹ thuật viên</p>
      </div>

      {/* Filters and Add Button */}
      <div className="staff-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)}>
            <option value="all">Tất cả vai trò</option>
            <option value="STAFF">Nhân viên</option>
            <option value="TECHNICIAN">Kỹ thuật viên</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang làm việc</option>
            <option value="inactive">Ngừng làm việc</option>
          </select>
        </div>

        <button className="btn-add-staff" onClick={handleAddStaff}>
          <Plus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Stats */}
      <div className="staff-stats">
        <div className="stat-item">
          <div className="stat-icon staff-icon">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng nhân viên</p>
            <p className="stat-value">{staffList.filter(s => s.role.toUpperCase() === 'STAFF').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon tech-icon">
            <Shield size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Kỹ thuật viên</p>
            <p className="stat-value">{staffList.filter(s => s.role.toUpperCase() === 'TECHNICIAN').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active-icon">
            <UserCheck size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đang làm việc</p>
            <p className="stat-value">{staffList.filter(s => s.isActive).length}</p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="staff-table-container">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày vào làm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Users size={48} style={{ opacity: 0.3 }} />
                    <div>
                      <p style={{ opacity: 0.6, marginBottom: '0.5rem' }}>
                        Chưa có nhân viên nào trong hệ thống
                      </p>
                      <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>
                        Nhấn "Thêm nhân viên" để tạo nhân viên mới
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Users size={48} style={{ opacity: 0.3 }} />
                    <p style={{ opacity: 0.6 }}>
                      Không tìm thấy nhân viên phù hợp với bộ lọc
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredStaff.map((staff) => (
              <tr key={staff.id}>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">
                      {staff.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className="staff-details">
                      <p className="staff-name">{staff.fullName}</p>
                      <p className="staff-id">ID: {staff.id.substring(0, 8)}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <Mail size={14} />
                    {staff.email}
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <Phone size={14} />
                    {staff.phone}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${staff.role.toLowerCase()}`}>
                    {staff.role.toUpperCase() === 'STAFF' ? 'Nhân viên' : 'Thợ kỹ thuật'}
                  </span>
                </td>
                <td>
                  {staff.role.toUpperCase() === 'TECHNICIAN' ? (
                    // Technician: Hiển thị trạng thái real-time từ backend (đang bận/sẵn sàng)
                    <span className={`status-badge ${staff.currentStatus === 'BUSY' ? 'inactive' : 'active'}`}>
                      {staff.currentStatus === 'BUSY' ? (
                        <>
                          🔧 Đang bận
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} />
                          Sẵn sàng
                        </>
                      )}
                    </span>
                  ) : (
                    // Staff: Hiển thị trạng thái active/inactive (đang làm/nghỉ việc)
                    <button
                      className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleToggleStatus(staff.id)}
                      title="Nhấn để thay đổi trạng thái làm việc"
                    >
                      {staff.isActive ? (
                        <>
                          <UserCheck size={14} />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <UserX size={14} />
                          Ngưng làm
                        </>
                      )}
                    </button>
                  )}
                </td>
                <td>{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEditStaff(staff.id)}
                      title="Chỉnh sửa"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteStaff(staff.id)}
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )))
          }
          </tbody>
        </table>
      </div>

      {filteredStaff.length === 0 && (
        <div className="no-results">
          <Users size={48} />
          <p>Không tìm thấy nhân viên nào</p>
        </div>
      )}

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm nhân viên mới</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowAddModal(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitNewStaff}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="fullName">
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    className="form-control"
                    placeholder="Nhập họ và tên"
                    value={newStaff.fullName}
                    onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="email@example.com"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Mật khẩu <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="form-control"
                    placeholder="Tối thiểu 6 ký tự"
                    value={newStaff.password}
                    onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="form-control"
                    placeholder="0123456789"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">
                    Vai trò <span className="required">*</span>
                  </label>
                  <select
                    id="role"
                    className="form-control"
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'STAFF' | 'TECHNICIAN' })}
                    required
                  >
                    <option value="STAFF">Nhân viên</option>
                    <option value="TECHNICIAN">Kỹ thuật viên</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="serviceCenter">
                    Trung tâm dịch vụ <span className="required">*</span>
                  </label>
                  <select
                    id="serviceCenter"
                    className="form-control"
                    value={newStaff.serviceCenterId}
                    onChange={(e) => setNewStaff({ ...newStaff, serviceCenterId: e.target.value })}
                    required
                  >
                    <option value="">Chọn trung tâm</option>
                    {serviceCenters.map(center => (
                      <option key={center.id} value={center.id}>
                        {center.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn-confirm"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Thêm nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {showEditModal && editingStaff && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin nhân viên</h2>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingStaff(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEditStaff}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="edit-fullName">
                    Họ và tên <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="edit-fullName"
                    className="form-control"
                    placeholder="Nhập họ và tên"
                    value={editingStaff.fullName}
                    onChange={(e) => setEditingStaff({ ...editingStaff, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="edit-email"
                    className="form-control"
                    value={editingStaff.email}
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Email không thể thay đổi
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-phone">
                    Số điện thoại <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="edit-phone"
                    className="form-control"
                    placeholder="0123456789"
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-role">
                    Vai trò
                  </label>
                  <input
                    type="text"
                    id="edit-role"
                    className="form-control"
                    value={editingStaff.role === 'STAFF' ? 'Nhân viên' : 'Kỹ thuật viên'}
                    disabled
                    style={{ backgroundColor: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Vai trò không thể thay đổi
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingStaff(null);
                  }}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn-confirm"
                  disabled={submitting}
                >
                  {submitting ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingStaff && (
        <div className="modal-overlay">
          <div className="modal-content modal-delete">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingStaff(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={48} color="#ef4444" />
                <h3>Bạn có chắc chắn muốn xóa nhân viên này?</h3>
                <div className="staff-info-delete">
                  <p><strong>Họ và tên:</strong> {deletingStaff.fullName}</p>
                  <p><strong>Email:</strong> {deletingStaff.email}</p>
                  <p><strong>Vai trò:</strong> {deletingStaff.role === 'STAFF' ? 'Nhân viên' : 'Kỹ thuật viên'}</p>
                </div>
                <p className="warning-text">
                  <strong>⚠️ Chú ý:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến nhân viên này sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn-cancel" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingStaff(null);
                }}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                type="button"
                className="btn-delete"
                onClick={confirmDeleteStaff}
                disabled={submitting}
              >
                {submitting ? 'Đang xóa...' : 'Xóa nhân viên'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
