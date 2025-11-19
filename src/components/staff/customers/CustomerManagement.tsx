import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Phone, Mail, Car, MessageSquare,
  Eye, Edit, Trash2
} from 'lucide-react';
import { MDButton } from '../../ui';
import customerService, { Customer } from '../../../services/customerService';
import './CustomerManagement.css';

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerService.getAllCustomers();
      // Backend returns paginated response
      const customersList = response.content || response || [];
      
      // Log để debug cấu trúc dữ liệu
      console.log('Raw API response:', response);
      console.log('Customers list:', customersList);
      if (customersList.length > 0) {
        console.log('First customer structure:', customersList[0]);
      }
      
      setCustomers(customersList);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = (customer.fullName || `${customer.firstName} ${customer.lastName}`).toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) ||
           customer.email.toLowerCase().includes(search) ||
           (customer.phone && customer.phone.includes(searchTerm));
  });

  const viewCustomerDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
    setShowChat(false);
  };

  const openChat = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowChat(true);
    setShowDetails(false);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeletingCustomer(customer);
    setShowDeleteModal(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  const handleAddCustomer = () => {
    setNewCustomer({
      email: '',
      password: '',
      fullName: '',
      phone: ''
    });
    setShowAddModal(true);
  };

  const handleSubmitNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newCustomer.email || !newCustomer.password || !newCustomer.fullName || !newCustomer.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newCustomer.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      alert('Email không hợp lệ');
      return;
    }

    // Validate phone format (Vietnamese phone number)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(newCustomer.phone)) {
      alert('Số điện thoại phải có 10-11 chữ số');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Uncomment when API is ready
      // await customerService.createCustomer({
      //   email: newCustomer.email,
      //   password: newCustomer.password,
      //   fullName: newCustomer.fullName,
      //   phone: newCustomer.phone
      // });
      
      alert('Thêm khách hàng thành công! (Chức năng sẽ được kết nối với API)');
      setShowAddModal(false);
      setNewCustomer({
        email: '',
        password: '',
        fullName: '',
        phone: ''
      });
      // await loadCustomers();
    } catch (error) {
      console.error('Error adding customer:', error);
      alert('Không thể thêm khách hàng: ' + (error as any)?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCustomer) return;

    // Validation
    if (!editingCustomer.fullName && !editingCustomer.firstName && !editingCustomer.lastName) {
      alert('Vui lòng nhập họ tên');
      return;
    }

    if (!editingCustomer.phone) {
      alert('Vui lòng nhập số điện thoại');
      return;
    }

    try {
      setSubmitting(true);
      // TODO: Uncomment when API is ready
      // await customerService.updateCustomer(editingCustomer.id, {
      //   fullName: editingCustomer.fullName,
      //   firstName: editingCustomer.firstName,
      //   lastName: editingCustomer.lastName,
      //   phone: editingCustomer.phone,
      // });
      
      alert('Chức năng cập nhật khách hàng sẽ được kết nối với API sau');
      setShowEditModal(false);
      setEditingCustomer(null);
      // await loadCustomers();
    } catch (error) {
      console.error('Error updating customer:', error);
      alert('Không thể cập nhật khách hàng: ' + (error as any)?.message);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    try {
      setSubmitting(true);
      // TODO: Uncomment when API is ready
      // await customerService.deleteCustomer(deletingCustomer.id);
      // await loadCustomers();
      
      alert('Chức năng xóa khách hàng sẽ được kết nối với API sau');
      setShowDeleteModal(false);
      setDeletingCustomer(null);
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Không thể xóa khách hàng. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModals = () => {
    setShowDetails(false);
    setShowChat(false);
    setSelectedCustomer(null);
  };

  if (loading) {
    return (
      <div className="customer-management loading">
        <div className="loading-spinner">Đang tải danh sách khách hàng...</div>
      </div>
    );
  }

  return (
    <div className="customer-management">
      {/* Header */}
      <div className="customer-header">
        <h1>Quản lý Khách hàng</h1>
        <p>Quản lý thông tin khách hàng và dịch vụ</p>
      </div>

      {/* Filters and Add Button */}
      <div className="customer-filters">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <MDButton variant="filled" startIcon={<Plus />} onClick={handleAddCustomer}>
          Thêm khách hàng
        </MDButton>
      </div>

      {/* Stats */}
      <div className="customer-stats">
        <div className="stat-item">
          <div className="stat-icon customer-icon">
            <Search size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng khách hàng</p>
            <p className="stat-value">{customers.length}</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon new-icon">
            <Plus size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Khách hàng mới (tháng này)</p>
            <p className="stat-value">
              {customers.filter(c => {
                const createdDate = c.createdAt ? new Date(c.createdAt) : null;
                if (!createdDate) return false;
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon vehicle-icon">
            <Car size={20} />
          </div>
          <div className="stat-info">
            <p className="stat-label">Tổng xe đăng ký</p>
            <p className="stat-value">
              {customers.reduce((total, c) => {
                return total + ((c as any).vehicleCount || (c as any).totalVehicles || 0);
              }, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="customer-table-container">
        <table className="customer-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Số xe</th>
              <th>Dịch vụ</th>
              <th>Ngày đăng ký</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Search size={48} style={{ opacity: 0.3 }} />
                    <p style={{ opacity: 0.6 }}>Không tìm thấy khách hàng phù hợp</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {(customer.fullName || customer.firstName || 'U')?.charAt(0).toUpperCase()}
                      </div>
                      <div className="customer-details">
                        <p className="customer-name">
                          {customer.fullName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'N/A'}
                        </p>
                        <p className="customer-id">ID: {customer.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <Mail size={14} />
                      {customer.email || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <Phone size={14} />
                      {customer.phone || 'N/A'}
                    </div>
                  </td>
                  <td>
                    <div className="vehicle-badge">
                      <Car size={14} />
                      {(customer as any).vehicleCount || (customer as any).totalVehicles || 0}
                    </div>
                  </td>
                  <td>
                    <span className="service-badge">
                      {(customer as any).serviceCount || (customer as any).totalServices || 0}
                    </span>
                  </td>
                  <td>
                    {customer.createdAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(customer.createdAt)) : 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-view"
                        onClick={() => viewCustomerDetails(customer)}
                        title="Xem chi tiết"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEditCustomer(customer)}
                        title="Chỉnh sửa"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeleteCustomer(customer)}
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showDetails && selectedCustomer && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hồ sơ Khách hàng</h3>
              <button className="close-btn" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="customer-details">
                <div className="detail-section">
                  <h4>Thông tin cá nhân</h4>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <strong>Họ tên:</strong>
                      <span>{selectedCustomer.fullName || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Mã KH:</strong>
                      <span>{selectedCustomer.id}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Email:</strong>
                      <span>{selectedCustomer.email}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Điện thoại:</strong>
                      <span>{selectedCustomer.phone || 'N/A'}</span>
                    </div>
                    <div className="detail-item full-width">
                      <strong>Địa chỉ:</strong>
                      <span>{selectedCustomer.address || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Ngày đăng ký:</strong>
                      <span>
                        {selectedCustomer.createdAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(selectedCustomer.createdAt)) : 'N/A'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Tổng dịch vụ:</strong>
                      <span>N/A</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Danh sách Xe (Chưa tải)</h4>
                  <div className="vehicles-list">
                    <p>Cần gọi API riêng để lấy danh sách xe của khách hàng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && selectedCustomer && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content chat-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="chat-header-info">
                <h3>Chat với {selectedCustomer.fullName || `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''}`.trim() || 'Khách hàng'}</h3>
                <span className="online-status">● Online</span>
              </div>
              <button className="close-btn" onClick={closeModals}>×</button>
            </div>
            <div className="modal-body">
              <div className="chat-container">
                <div className="chat-messages">
                  <div className="message received">
                    <div className="message-content">
                      Xin chào, tôi muốn đặt lịch bảo dưỡng cho xe VF8
                    </div>
                    <div className="message-time">10:30</div>
                  </div>
                  <div className="message sent">
                    <div className="message-content">
                      Chào anh/chị! Em xin kiểm tra lịch và báo lại ngay ạ
                    </div>
                    <div className="message-time">10:31</div>
                  </div>
                  <div className="message received">
                    <div className="message-content">
                      Cảm ơn bạn!
                    </div>
                    <div className="message-time">10:32</div>
                  </div>
                </div>
                <div className="chat-input">
                  <input type="text" placeholder="Nhập tin nhắn..." />
                  <MDButton variant="filled">Gửi</MDButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Thêm khách hàng mới</h2>
              <button 
                className="btn-close" 
                onClick={() => setShowAddModal(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitNewCustomer}>
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
                    value={newCustomer.fullName}
                    onChange={(e) => setNewCustomer({ ...newCustomer, fullName: e.target.value })}
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
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
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
                    value={newCustomer.password}
                    onChange={(e) => setNewCustomer({ ...newCustomer, password: e.target.value })}
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
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-note">
                  <p>
                    <strong>💡 Lưu ý:</strong> Khách hàng sẽ nhận email và mật khẩu để đăng nhập vào hệ thống.
                  </p>
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
                  {submitting ? 'Đang xử lý...' : 'Thêm khách hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chỉnh sửa thông tin khách hàng</h2>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEditCustomer}>
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
                    value={editingCustomer.fullName || `${editingCustomer.firstName || ''} ${editingCustomer.lastName || ''}`.trim()}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, fullName: e.target.value })}
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
                    value={editingCustomer.email}
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
                    value={editingCustomer.phone || ''}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn-cancel" 
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
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
      {showDeleteModal && deletingCustomer && (
        <div className="modal-overlay">
          <div className="modal-content modal-delete">
            <div className="modal-header">
              <h2>Xác nhận xóa</h2>
              <button 
                className="btn-close" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCustomer(null);
                }}
                type="button"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={48} color="#ef4444" />
                <h3>Bạn có chắc chắn muốn xóa khách hàng này?</h3>
                <div className="customer-info-delete">
                  <p><strong>Họ và tên:</strong> {deletingCustomer.fullName || `${deletingCustomer.firstName || ''} ${deletingCustomer.lastName || ''}`.trim()}</p>
                  <p><strong>Email:</strong> {deletingCustomer.email}</p>
                  <p><strong>Số điện thoại:</strong> {deletingCustomer.phone || 'N/A'}</p>
                </div>
                <p className="warning-text">
                  <strong>⚠️ Chú ý:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến khách hàng này (xe, lịch hẹn, hóa đơn) sẽ bị xóa vĩnh viễn.
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button"
                className="btn-cancel" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingCustomer(null);
                }}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                type="button"
                className="btn-delete"
                onClick={confirmDeleteCustomer}
                disabled={submitting}
              >
                {submitting ? 'Đang xóa...' : 'Xóa khách hàng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
