import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Phone, Mail, Car, MessageSquare,
  Eye, Edit, Trash2, Filter, Download
} from 'lucide-react';
import { MDButton } from '../../ui';
import { customerService, vehicleService, appointmentService } from '../../../services';
import './CustomerManagement.css';

interface StaffCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  vehicles: Array<{
    id: string;
    licensePlate: string;
    model: string;
    year?: number;
    vin?: string;
    color?: string;
    mileage?: number;
  }>;
  totalServices: number;
  lastServiceDate?: Date;
  registeredDate: Date;
  notes?: string;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<StaffCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<StaffCustomer | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Get all customers from API (returns Page object)
      const customerPage = await customerService.getAllCustomers({ size: 100 });
      
      // Extract content array from Page object
      const allCustomers = Array.isArray(customerPage?.content) ? customerPage.content : [];
      
      if (!Array.isArray(allCustomers) || allCustomers.length === 0) {
        setCustomers([]);
        setLoading(false);
        return;
      }
      
      // Get all appointments to calculate service stats
      const { appointments: allAppointments } = await appointmentService.getAllAppointments();
      
      // Convert to staff customer format
      const convertedCustomers: StaffCustomer[] = await Promise.all(
        allCustomers.map(async (customer: any) => {
          // Get customer's vehicles
          let vehicles: any[] = [];
          try {
            const customerId = customer.id?.toString() || customer.id;
            vehicles = await vehicleService.getVehiclesByCustomerId(customerId);
          } catch (error) {
            vehicles = [];
          }
          
          // Count customer's appointments
          const customerAppointments = allAppointments.filter(
            (apt: any) => apt.customerId === customer.id
          );
          
          // Find last service date
          const completedAppointments = customerAppointments.filter(
            (apt: any) => apt.status === 'COMPLETED'
          );
          const lastServiceDate = completedAppointments.length > 0
            ? new Date(Math.max(...completedAppointments.map((apt: any) => new Date(apt.appointmentDate).getTime())))
            : undefined;
          
          return {
            id: customer.id,
            name: customer.fullName || customer.email || 'N/A',
            email: customer.email,
            phone: customer.phone || 'N/A',
            address: customer.address || 'Chưa cập nhật',
            vehicles: vehicles.map((v: any) => ({
              id: v.id,
              licensePlate: v.licensePlate || 'N/A',
              model: v.vehicleModel?.model || 'N/A',
              year: v.vehicleModel?.year,
              vin: v.vin,
              color: v.color,
              mileage: v.mileage
            })),
            totalServices: completedAppointments.length,
            lastServiceDate,
            registeredDate: customer.createdAt ? new Date(customer.createdAt) : new Date(),
            notes: ''
          };
        })
      );
      
      setCustomers(convertedCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.vehicles.some(v => v.licensePlate.includes(searchTerm.toUpperCase()))
  );

  const viewCustomerDetails = (customer: StaffCustomer) => {
    setSelectedCustomer(customer);
    setShowDetails(true);
    setShowChat(false);
  };

  const openChat = (customer: StaffCustomer) => {
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
          <div className="stat-value">5</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Tổng xe đăng ký</div>
          <div className="stat-value">
            {customers.reduce((sum, c) => sum + c.vehicles.length, 0)}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Dịch vụ hoàn thành</div>
          <div className="stat-value">
            {customers.reduce((sum, c) => sum + c.totalServices, 0)}
          </div>
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
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <div className="customer-name">{customer.name}</div>
                      <div className="customer-id">#{customer.id}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="contact-info">
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="contact-item">
                      <Mail size={14} />
                      <span>{customer.email}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="vehicle-count">
                    <Car size={16} />
                    <span>{customer.vehicles.length} xe</span>
                  </div>
                </td>
                <td>
                  <span className="service-count">{customer.totalServices}</span>
                </td>
                <td>
                  {customer.lastServiceDate ? (
                    <span className="last-service">
                      {new Intl.DateTimeFormat('vi-VN').format(customer.lastServiceDate)}
                    </span>
                  ) : (
                    <span className="no-service">Chưa có</span>
                  )}
                </td>
                <td>
                  {new Intl.DateTimeFormat('vi-VN').format(customer.registeredDate)}
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
                      <span>{selectedCustomer.name}</span>
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
                      <span>{selectedCustomer.phone}</span>
                    </div>
                    <div className="detail-item full-width">
                      <strong>Địa chỉ:</strong>
                      <span>{selectedCustomer.address}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Ngày đăng ký:</strong>
                      <span>
                        {new Intl.DateTimeFormat('vi-VN').format(selectedCustomer.registeredDate)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Tổng dịch vụ:</strong>
                      <span>{selectedCustomer.totalServices}</span>
                    </div>
                  </div>
                  {selectedCustomer.notes && (
                    <div className="notes-section">
                      <strong>Ghi chú:</strong>
                      <p>{selectedCustomer.notes}</p>
                    </div>
                  )}
                </div>

                <div className="detail-section">
                  <h4>Danh sách Xe ({selectedCustomer.vehicles.length})</h4>
                  <div className="vehicles-list">
                    {selectedCustomer.vehicles.map(vehicle => (
                      <div key={vehicle.id} className="vehicle-card">
                        <div className="vehicle-header">
                          <div className="vehicle-model">{vehicle.model}</div>
                          <div className="vehicle-year">{vehicle.year}</div>
                        </div>
                        <div className="vehicle-details">
                          <div className="vehicle-detail">
                            <strong>Biển số:</strong>
                            <span>{vehicle.licensePlate}</span>
                          </div>
                          <div className="vehicle-detail">
                            <strong>VIN:</strong>
                            <span className="vin-code">{vehicle.vin || 'N/A'}</span>
                          </div>
                          <div className="vehicle-detail">
                            <strong>Màu sắc:</strong>
                            <span>{vehicle.color || 'N/A'}</span>
                          </div>
                          <div className="vehicle-detail">
                            <strong>Km đã chạy:</strong>
                            <span>{vehicle.mileage ? vehicle.mileage.toLocaleString() + ' km' : 'N/A'}</span>
                          </div>
                        </div>
                        <div className="vehicle-actions">
                          <MDButton variant="outlined" size="small">
                            Lịch sử dịch vụ
                          </MDButton>
                        </div>
                      </div>
                    ))}
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
                <h3>Chat với {selectedCustomer.name}</h3>
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
