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
import { staffService, Staff } from '../../../services';
import './StaffManagement.css';

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'STAFF' | 'TECHNICIAN'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    try {
      setLoading(true);
      const staff = await staffService.getAllStaff();
      setStaffList(staff);
    } catch (error) {
      console.error('Error loading staff:', error);
      alert('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || staff.role === filterRole;
    const matchesStatus = filterStatus === 'all' || staff.status === filterStatus;
    
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
        loadStaffList();
      } catch (error) {
        console.error('Error deleting staff:', error);
        alert('Không thể xóa nhân viên');
      }
    }
  };

  const handleToggleStatus = async (staffId: string) => {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;
    
    const newStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await staffService.updateStaff(staffId, { status: newStatus });
      alert('Cập nhật trạng thái thành công');
      loadStaffList();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

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
            <option value="ACTIVE">Đang làm việc</option>
            <option value="INACTIVE">Ngừng làm việc</option>
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
            <p className="stat-value">{staffList.filter(s => s.role === 'STAFF').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon tech-icon">
            <Shield size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Kỹ thuật viên</p>
            <p className="stat-value">{staffList.filter(s => s.role === 'TECHNICIAN').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active-icon">
            <UserCheck size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đang làm việc</p>
            <p className="stat-value">{staffList.filter(s => s.status === 'ACTIVE').length}</p>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="staff-table-container">
        {loading ? (
          <div className="loading-state">
            <p>Đang tải danh sách nhân viên...</p>
          </div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Mã nhân viên</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => {
                const nameParts = staff.fullName.split(' ');
                const initials = nameParts.length >= 2 
                  ? nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)
                  : staff.fullName.substring(0, 2).toUpperCase();
                
                return (
                  <tr key={staff.id}>
                    <td>
                      <div className="staff-info">
                        <div className="staff-avatar">
                          {initials}
                        </div>
                        <div className="staff-details">
                          <p className="staff-name">{staff.fullName}</p>
                          <p className="staff-id">{staff.employeeCode || 'N/A'}</p>
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
                        {staff.role === 'STAFF' ? 'Nhân viên' : 'Kỹ thuật viên'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`status-badge ${staff.status.toLowerCase()}`}
                        onClick={() => handleToggleStatus(staff.id)}
                      >
                        {staff.status === 'ACTIVE' ? (
                          <>
                            <UserCheck size={14} />
                            Đang làm
                          </>
                        ) : (
                          <>
                            <UserX size={14} />
                            Ngừng làm
                          </>
                        )}
                      </button>
                    </td>
                    <td>{staff.employeeCode || 'N/A'}</td>
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
                );
              })}
            </tbody>
          </table>
        )}
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
