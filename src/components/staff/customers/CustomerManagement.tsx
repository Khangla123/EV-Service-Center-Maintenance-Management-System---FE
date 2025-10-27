import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Phone, Mail, Car, MessageSquare,
  Eye, Edit, Trash2, Filter, Download
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
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng, SĐT, biển số xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <MDButton variant="outlined" startIcon={<Filter />}>
            Lọc
          </MDButton>
          <MDButton variant="outlined" startIcon={<Download />}>
            Xuất Excel
          </MDButton>
          <MDButton variant="filled" startIcon={<Plus />}>
            Thêm khách hàng
          </MDButton>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-label">Tổng khách hàng</div>
          <div className="stat-value">{customers.length}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Khách hàng mới (tháng này)</div>
          <div className="stat-value">
            {customers.filter(c => {
              const createdDate = c.createdAt ? new Date(c.createdAt) : null;
              if (!createdDate) return false;
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Tổng xe đăng ký</div>
          <div className="stat-value">N/A</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Dịch vụ hoàn thành</div>
          <div className="stat-value">N/A</div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Liên hệ</th>
              <th>Số xe</th>
              <th>Dịch vụ</th>
              <th>Lần cuối</th>
              <th>Ngày đăng ký</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div className="customer-info">
                    <div className="customer-avatar">
                      {customer.firstName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="customer-name">{customer.firstName || ''} {customer.lastName || ''}</div>
                      <div className="customer-id">#{customer.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{customer.phone || 'N/A'}</span>
                    </div>
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{customer.email || 'N/A'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="vehicle-count">
                    <Car size={16} />
                    <span>N/A</span>
                  </div>
                </td>
                <td>
                  <span className="service-count">N/A</span>
                </td>
                <td>
                  <span className="no-service">N/A</span>
                </td>
                <td>
                  {customer.createdAt ? new Intl.DateTimeFormat('vi-VN').format(new Date(customer.createdAt)) : 'N/A'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => viewCustomerDetails(customer)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn chat"
                      onClick={() => openChat(customer)}
                      title="Chat"
                    >
                      <MessageSquare size={16} />
                    </button>
                    <button className="action-btn edit" title="Sửa">
                      <Edit size={16} />
                    </button>
                    <button className="action-btn delete" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
    </div>
  );
};

export default CustomerManagement;
