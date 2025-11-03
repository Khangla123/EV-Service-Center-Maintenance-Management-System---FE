import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, DollarSign, 
  CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Edit, Download, RefreshCw, Plus, Wrench
} from 'lucide-react';
import invoiceService, { InvoiceResponse, CreateInvoiceRequest } from '../../../services/invoiceService';
import serviceOrderService, { ServiceOrder } from '../../../services/serviceOrderService';
import './InvoiceManagement.css';

type InvoiceStatus = 'ALL' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
type ViewMode = 'invoices' | 'pending-orders';

const InvoiceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('pending-orders');
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [pendingOrders, setPendingOrders] = useState<ServiceOrder[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  useEffect(() => {
    loadData();
  }, [viewMode]);

  useEffect(() => {
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  const loadData = async () => {
    if (viewMode === 'invoices') {
      await loadInvoices();
    } else {
      await loadPendingOrders();
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      console.log('Loading invoices...');
      const data = await invoiceService.getAllInvoices();
      console.log('Invoices loaded:', data);
      console.log('Number of invoices:', data?.length || 0);
      setInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      alert('Không thể tải danh sách hóa đơn. Vui lòng thử lại.');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading completed service orders...');
      
      // Lấy tất cả service orders
      const response = await serviceOrderService.getAllServiceOrders({});
      console.log('API Response:', response);
      
      // Backend có thể trả về trực tiếp array hoặc object {serviceOrders: [...]}
      const allOrders = Array.isArray(response) 
        ? response 
        : (response.serviceOrders || (response as any).result || []);
      
      console.log('All service orders loaded:', allOrders.length);
      
      // Lọc ra các order đã COMPLETED
      const completedOrders = allOrders.filter(order => order.status === 'COMPLETED');
      console.log('Completed orders:', completedOrders.length);
      
      // Lọc ra các order đã có hóa đơn
      const allInvoices = await invoiceService.getAllInvoices();
      const orderIdsWithInvoice = new Set(allInvoices.map(inv => inv.serviceOrderId));
      
      const ordersWithoutInvoice = completedOrders.filter(order => !orderIdsWithInvoice.has(order.id));
      console.log('Orders without invoice:', ordersWithoutInvoice.length);
      
      setPendingOrders(ordersWithoutInvoice);
    } catch (error) {
      console.error('Error loading pending orders:', error);
      console.error('Error details:', error);
      setPendingOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.customerName?.toLowerCase().includes(term) ||
        invoice.vehicleLicensePlate?.toLowerCase().includes(term) ||
        invoice.id.toLowerCase().includes(term)
      );
    }

    setFilteredInvoices(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { icon: <Clock size={14} />, label: 'Chờ thanh toán', class: 'warning' },
      PAID: { icon: <CheckCircle size={14} />, label: 'Đã thanh toán', class: 'success' },
      CANCELLED: { icon: <XCircle size={14} />, label: 'Đã hủy', class: 'danger' },
      OVERDUE: { icon: <AlertCircle size={14} />, label: 'Quá hạn', class: 'danger' }
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const handleViewDetail = (invoice: InvoiceResponse) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleCreateInvoice = (order: ServiceOrder) => {
    setSelectedOrder(order);
    setShowCreateInvoiceModal(true);
  };

  const handleConfirmCreateInvoice = async () => {
    if (!selectedOrder) return;

    try {
      setCreatingInvoice(true);
      
      const totalAmount = selectedOrder.totalCost || 0;
      const taxAmount = totalAmount * 0.1; // 10% VAT
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7); // 7 ngày

      const request: CreateInvoiceRequest = {
        serviceOrderId: selectedOrder.id,
        customerId: selectedOrder.customerId,
        vehicleId: selectedOrder.vehicleId,
        totalAmount: totalAmount,
        discount: 0,
        dueDate: dueDate.toISOString(),
        notes: `Hóa đơn cho dịch vụ: ${selectedOrder.serviceType}`
      };

      await invoiceService.createInvoice(request);
      alert('Tạo hóa đơn thành công!');
      
      setShowCreateInvoiceModal(false);
      setSelectedOrder(null);
      
      // Refresh data
      await loadData();
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Không thể tạo hóa đơn. Vui lòng thử lại.');
    } finally {
      setCreatingInvoice(false);
    }
  };

  const renderPendingOrders = () => (
    <div className="invoice-table-container">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : pendingOrders.length === 0 ? (
        <div className="no-data">
          <Wrench size={48} />
          <p>Không có công việc hoàn thành nào chờ tạo hóa đơn</p>
          <p className="hint">
            Hóa đơn sẽ được tạo sau khi kỹ thuật viên hoàn thành công việc
          </p>
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Mã công việc</th>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Loại dịch vụ</th>
              <th>Ngày hoàn thành</th>
              <th>Tổng chi phí</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrders.map((order) => (
              <tr key={order.id}>
                <td>
                  <span className="invoice-code">
                    #{order.id.substring(0, 8)}
                  </span>
                </td>
                <td>
                  {order.customer 
                    ? `${order.customer.firstName} ${order.customer.lastName}`
                    : 'N/A'
                  }
                </td>
                <td>
                  <span className="license-plate">
                    {order.vehicle?.licensePlate || 'N/A'}
                  </span>
                </td>
                <td>{order.serviceType || 'N/A'}</td>
                <td>
                  {order.completionDate 
                    ? formatDate(new Date(order.completionDate).toISOString())
                    : 'N/A'
                  }
                </td>
                <td>
                  <span className="amount">
                    {formatCurrency(order.totalCost || 0)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn create"
                      onClick={() => handleCreateInvoice(order)}
                      title="Tạo hóa đơn"
                    >
                      <Plus size={16} />
                      Tạo HĐ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderInvoices = () => (
    <div className="invoice-table-container">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="no-data">
          <FileText size={48} />
          {searchTerm || statusFilter !== 'ALL' ? (
            <>
              <p>Không tìm thấy hóa đơn nào</p>
              <p className="hint">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
            </>
          ) : (
            <>
              <p>Chưa có hóa đơn nào trong hệ thống</p>
              <p className="hint">
                Tạo hóa đơn từ các công việc đã hoàn thành
              </p>
            </>
          )}
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Mã HĐ</th>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Ngày lập</th>
              <th>Hạn thanh toán</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>
                  <span className="invoice-code">
                    #{invoice.id.substring(0, 8)}
                  </span>
                </td>
                <td>{invoice.customerName || 'N/A'}</td>
                <td>
                  <span className="license-plate">
                    {invoice.vehicleLicensePlate || 'N/A'}
                  </span>
                </td>
                <td>{formatDate(invoice.issueDate)}</td>
                <td>{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</td>
                <td>
                  <span className="amount">
                    {formatCurrency(invoice.finalAmount || invoice.totalAmount)}
                  </span>
                </td>
                <td>{getStatusBadge(invoice.status)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewDetail(invoice)}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const stats = [
    {
      icon: <Wrench />,
      label: 'Chờ tạo hóa đơn',
      value: pendingOrders.length,
      color: 'orange'
    },
    {
      icon: <FileText />,
      label: 'Tổng hóa đơn',
      value: invoices.length,
      color: 'blue'
    },
    {
      icon: <Clock />,
      label: 'Chờ thanh toán',
      value: invoices.filter(i => i.status === 'PENDING').length,
      color: 'orange'
    },
    {
      icon: <CheckCircle />,
      label: 'Đã thanh toán',
      value: invoices.filter(i => i.status === 'PAID').length,
      color: 'green'
    }
  ];

  return (
    <div className="invoice-management">
      {/* Statistics Cards */}
      <div className="invoice-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* View Mode Tabs */}
      <div className="view-tabs">
        <button
          className={`tab-btn ${viewMode === 'pending-orders' ? 'active' : ''}`}
          onClick={() => setViewMode('pending-orders')}
        >
          <Wrench size={18} />
          Công việc hoàn thành ({pendingOrders.length})
        </button>
        <button
          className={`tab-btn ${viewMode === 'invoices' ? 'active' : ''}`}
          onClick={() => setViewMode('invoices')}
        >
          <FileText size={18} />
          Hóa đơn đã tạo ({invoices.length})
        </button>
      </div>

      {/* Filters and Search - Only for invoices view */}
      {viewMode === 'invoices' && (
        <div className="invoice-controls">
          <div className="search-box">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng, biển số xe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <Filter className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus)}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ thanh toán</option>
              <option value="PAID">Đã thanh toán</option>
              <option value="OVERDUE">Quá hạn</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <button className="refresh-btn" onClick={loadInvoices}>
            <RefreshCw size={18} />
            Làm mới
          </button>
        </div>
      )}

      {/* Content based on view mode */}
      {viewMode === 'pending-orders' ? renderPendingOrders() : renderInvoices()}

      {/* Create Invoice Modal */}
      {showCreateInvoiceModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowCreateInvoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Tạo hóa đơn</h2>
              <button
                className="close-btn"
                onClick={() => setShowCreateInvoiceModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail">
                <div className="detail-row">
                  <span className="label">Mã công việc:</span>
                  <span className="value">#{selectedOrder.id.substring(0, 8)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">
                    {selectedOrder.customer
                      ? `${selectedOrder.customer.firstName} ${selectedOrder.customer.lastName}`
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Biển số xe:</span>
                  <span className="value">{selectedOrder.vehicle?.licensePlate || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Loại dịch vụ:</span>
                  <span className="value">{selectedOrder.serviceType}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Chi phí dịch vụ:</span>
                  <span className="value amount">
                    {formatCurrency(selectedOrder.totalCost || 0)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Thuế VAT (10%):</span>
                  <span className="value">
                    {formatCurrency((selectedOrder.totalCost || 0) * 0.1)}
                  </span>
                </div>
                <div className="detail-row highlight">
                  <span className="label">Tổng thanh toán:</span>
                  <span className="value amount">
                    {formatCurrency((selectedOrder.totalCost || 0) * 1.1)}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="detail-row full-width">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowCreateInvoiceModal(false)}
                disabled={creatingInvoice}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmCreateInvoice}
                disabled={creatingInvoice}
              >
                {creatingInvoice ? 'Đang tạo...' : 'Tạo hóa đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết hóa đơn</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail">
                <div className="detail-row">
                  <span className="label">Mã hóa đơn:</span>
                  <span className="value">#{selectedInvoice.id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{selectedInvoice.customerName || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Biển số xe:</span>
                  <span className="value">{selectedInvoice.vehicleLicensePlate || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Ngày lập:</span>
                  <span className="value">{formatDate(selectedInvoice.issueDate)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Hạn thanh toán:</span>
                  <span className="value">
                    {selectedInvoice.dueDate ? formatDate(selectedInvoice.dueDate) : 'N/A'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Tổng tiền:</span>
                  <span className="value amount">
                    {formatCurrency(selectedInvoice.totalAmount)}
                  </span>
                </div>
                {selectedInvoice.discount && selectedInvoice.discount > 0 && (
                  <div className="detail-row">
                    <span className="label">Giảm giá:</span>
                    <span className="value discount">
                      -{formatCurrency(selectedInvoice.discount)}
                    </span>
                  </div>
                )}
                <div className="detail-row highlight">
                  <span className="label">Thành tiền:</span>
                  <span className="value amount">
                    {formatCurrency(selectedInvoice.finalAmount || selectedInvoice.totalAmount)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Trạng thái:</span>
                  <span className="value">{getStatusBadge(selectedInvoice.status)}</span>
                </div>
                {selectedInvoice.notes && (
                  <div className="detail-row full-width">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{selectedInvoice.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
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

export default InvoiceManagement;
