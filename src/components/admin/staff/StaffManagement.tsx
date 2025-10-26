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

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'STAFF' | 'TECHNICIAN'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaff();
  }, []);

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
    setShowAddModal(true);
  };

  const handleEditStaff = (staffId: string) => {
    console.log('Edit staff:', staffId);
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await staffService.deleteStaff(staffId);
        alert('Xóa nhân viên thành công');
        loadStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Không thể xóa nhân viên');
      }
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
        <div className="header-left">
          <h1>Quản lý Nhân sự</h1>
          <p>Quản lý thông tin nhân viên và kỹ thuật viên</p>
        </div>
        <button className="btn-add-staff" onClick={handleAddStaff}>
          <Plus size={20} />
          Thêm nhân viên
        </button>
      </div>

      {/* Filters */}
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
    </div>
  );
};

export default StaffManagement;
