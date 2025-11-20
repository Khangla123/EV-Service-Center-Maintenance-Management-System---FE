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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
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
      setCustomers(customersList);
    } catch (err) {
      console.error('Error loading customers:', err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
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

  const closeModals = () => {
    setShowDetails(false);
    setShowChat(false);
    setSelectedCustomer(null);
    setShowAddModal(false);
  };

  const handleAddCustomer = () => {
    setShowAddModal(true);
  };

  const handleSubmitNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newCustomer.email)) {
      alert('Email không hợp lệ');
      return;
    }

    // Validate password
    if (newCustomer.password.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Validate phone
    const phoneRegex = /^[0-9]{10,11}$/;
    if (newCustomer.phone && !phoneRegex.test(newCustomer.phone)) {
      alert('Số điện thoại không hợp lệ (10-11 chữ số)');
      return;
    }

    try {
      // Use the same format as register endpoint
      const customerData = {
        email: newCustomer.email,
        fullName: `${newCustomer.lastName} ${newCustomer.firstName}`.trim(),
        phone: newCustomer.phone,
        password: newCustomer.password
      };
      
      await customerService.createCustomer(customerData as any);
      alert('Thêm khách hàng thành công!');
      setShowAddModal(false);
      setNewCustomer({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: ''
      });
      loadCustomers();
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Có lỗi xảy ra khi thêm khách hàng');
    }
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
      {/* Filters */}
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
            <p className="stat-value">N/A</p>
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
                        {customer.firstName?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="customer-details">
                        <p className="customer-name">{customer.firstName || ''} {customer.lastName || ''}</p>
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
                      N/A
                    </div>
                  </td>
                  <td>
                    <span className="service-badge">N/A</span>
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
                      <button className="btn-action btn-edit" title="Sửa">
                        <Edit size={16} />
                      </button>
                      <button className="btn-action btn-delete" title="Xóa">
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
                      <span>{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
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
                <h3>Chat với {selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
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
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm khách hàng mới</h2>
              <button className="modal-close" onClick={closeModals}>×</button>
            </div>
            <form className="customer-form" onSubmit={handleSubmitNewCustomer}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCustomer.lastName}
                    onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Tên *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newCustomer.firstName}
                    onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  className="form-control"
                  value={newCustomer.password}
                  onChange={(e) => setNewCustomer({...newCustomer, password: e.target.value})}
                  required
                  minLength={6}
                />
                <p className="form-note">Tối thiểu 6 ký tự</p>
              </div>

              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  placeholder="0908474717"
                />
                <p className="form-note">10-11 chữ số</p>
              </div>

              <div className="modal-actions">
                <MDButton type="button" variant="outlined" onClick={closeModals}>
                  Hủy
                </MDButton>
                <MDButton type="submit" variant="filled">
                  Thêm khách hàng
                </MDButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
