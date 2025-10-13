import React, { useState } from 'react';
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

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'staff' | 'technician';
  status: 'active' | 'inactive';
  joinDate: string;
  avatar?: string;
}

const StaffManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'staff' | 'technician'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [staffList] = useState<Staff[]>([
    {
      id: '1',
      firstName: 'Lê',
      lastName: 'Văn Nhân',
      email: 'staff@evservice.vn',
      phone: '0901234567',
      role: 'staff',
      status: 'active',
      joinDate: '2024-01-01'
    },
    {
      id: '2',
      firstName: 'Phạm',
      lastName: 'Thị Hoa',
      email: 'staff2@evservice.vn',
      phone: '0978123456',
      role: 'staff',
      status: 'active',
      joinDate: '2024-01-10'
    },
    {
      id: '3',
      firstName: 'Hoàng',
      lastName: 'Văn Kỹ',
      email: 'technician@evservice.vn',
      phone: '0965432109',
      role: 'technician',
      status: 'active',
      joinDate: '2024-01-05'
    },
    {
      id: '4',
      firstName: 'Đỗ',
      lastName: 'Văn Thuật',
      email: 'technician2@evservice.vn',
      phone: '0943210987',
      role: 'technician',
      status: 'active',
      joinDate: '2024-01-08'
    }
  ]);

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = 
      staff.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleDeleteStaff = (staffId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      console.log('Delete staff:', staffId);
    }
  };

  const handleToggleStatus = (staffId: string) => {
    console.log('Toggle status:', staffId);
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
            <option value="staff">Nhân viên</option>
            <option value="technician">Kỹ thuật viên</option>
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
            <p className="stat-value">{staffList.filter(s => s.role === 'staff').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon tech-icon">
            <Shield size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Kỹ thuật viên</p>
            <p className="stat-value">{staffList.filter(s => s.role === 'technician').length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon active-icon">
            <UserCheck size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Đang làm việc</p>
            <p className="stat-value">{staffList.filter(s => s.status === 'active').length}</p>
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
            {filteredStaff.map((staff) => (
              <tr key={staff.id}>
                <td>
                  <div className="staff-info">
                    <div className="staff-avatar">
                      {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                    </div>
                    <div className="staff-details">
                      <p className="staff-name">{staff.lastName} {staff.firstName}</p>
                      <p className="staff-id">ID: {staff.id}</p>
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
                  <span className={`role-badge ${staff.role}`}>
                    {staff.role === 'staff' ? 'Nhân viên' : 'Kỹ thuật viên'}
                  </span>
                </td>
                <td>
                  <button
                    className={`status-badge ${staff.status}`}
                    onClick={() => handleToggleStatus(staff.id)}
                  >
                    {staff.status === 'active' ? (
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
                <td>{new Date(staff.joinDate).toLocaleDateString('vi-VN')}</td>
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
            ))}
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
