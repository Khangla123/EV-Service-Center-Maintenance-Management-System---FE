import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Filter, DollarSign, 
  CheckCircle, Clock, XCircle, AlertCircle,
  Eye, Edit, Download, RefreshCw, Plus, Wrench
} from 'lucide-react';
import invoiceService, { InvoiceResponse, CreateInvoiceRequest } from '../../../services/invoiceService';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import serviceOrderService from '../../../services/serviceOrderService';
import servicePackageService from '../../../services/servicePackageService';
import './InvoiceManagement.css';

type InvoiceStatus = 'ALL' | 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
type ViewMode = 'invoices' | 'pending-appointments';

const InvoiceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('pending-appointments');
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [creatingInvoiceFor, setCreatingInvoiceFor] = useState<string | null>(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedAppointmentForInvoice, setSelectedAppointmentForInvoice] = useState<Appointment | null>(null);
  const [invoiceAmount, setInvoiceAmount] = useState<number>(0);
  const [packagePrice, setPackagePrice] = useState<number>(0);
  const [additionalFee, setAdditionalFee] = useState<number>(0);
  const [loadingPackagePrice, setLoadingPackagePrice] = useState(false);

  useEffect(() => {
    console.log('🎯 InvoiceManagement mounted, viewMode:', viewMode);
    loadData();
  }, [viewMode]);

  useEffect(() => {
    console.log('🔄 Filtering invoices, total:', invoices.length, 'searchTerm:', searchTerm, 'statusFilter:', statusFilter);
    filterInvoices();
  }, [invoices, searchTerm, statusFilter]);

  // Create invoice for a completed appointment
  const createInvoiceForAppointment = async (appointmentId: string, amount?: number) => {
    try {
      console.log('🔨 Creating invoice for appointment:', appointmentId, 'amount:', amount);
      setCreatingInvoiceFor(appointmentId);

      // Get the appointment details
      const appointment = pendingAppointments.find(apt => apt.id === appointmentId);
      if (!appointment) {
        alert('Không tìm thấy thông tin lịch hẹn!');
        return;
      }

      // If no amount provided, show price input modal
      if (!amount) {
        setSelectedAppointmentForInvoice(appointment);
        setAdditionalFee(0);
        setShowPriceModal(true);
        
        // Load service package price
        setLoadingPackagePrice(true);
        try {
          const servicePackage = await servicePackageService.getServicePackageById(appointment.servicePackageId);
          setPackagePrice(servicePackage.price);
          setInvoiceAmount(servicePackage.price); // Set initial amount = package price
          console.log('📦 Loaded service package:', servicePackage);
        } catch (error) {
          console.error('Error loading service package:', error);
          setPackagePrice(0);
          setInvoiceAmount(0);
        } finally {
          setLoadingPackagePrice(false);
        }
        
        setCreatingInvoiceFor(null);
        return;
      }

      // Get service order by appointment ID (direct lookup instead of filtering all orders)
      let serviceOrder;
      try {
        console.log('� Looking for service order by appointmentId:', appointmentId);
        serviceOrder = await serviceOrderService.getServiceOrderByAppointmentId(appointmentId);
        console.log('✅ Found service order:', serviceOrder);
      } catch (error: any) {
        console.error('❌ No service order found for appointment:', appointmentId);
        console.error('Error details:', error.response?.data);
        
        // Nếu lỗi 404 = chưa có service order
        if (error.response?.status === 404) {
          alert('⚠️ Chưa có phiếu dịch vụ cho lịch hẹn này!\n\nVui lòng đảm bảo:\n1. Đã phân công kỹ thuật viên cho lịch hẹn\n2. Kỹ thuật viên đã hoàn thành công việc');
        } else {
          alert(`Lỗi khi tìm phiếu dịch vụ: ${error.response?.data?.message || error.message}`);
        }
        return;
      }
      
      // Use provided amount (backend will check for duplicates)
      const subtotal = amount;
      const taxAmount = Math.round(subtotal * 0.1 * 100) / 100; // 10% tax
      const discountAmount = 0; // No discount
      
      // Create invoice with correct request format
      const createRequest: CreateInvoiceRequest = {
        serviceOrderId: serviceOrder.id,
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      console.log('📤 Sending create invoice request:', JSON.stringify(createRequest, null, 2));
      console.log('🔍 Request details:', {
        serviceOrderId: serviceOrder.id,
        subtotalType: typeof subtotal,
        subtotalValue: subtotal,
        taxAmountType: typeof taxAmount,
        taxAmountValue: taxAmount,
        discountAmountType: typeof discountAmount,
        discountAmountValue: discountAmount,
        dueDateType: typeof createRequest.dueDate,
        dueDateValue: createRequest.dueDate
      });

      const newInvoice = await invoiceService.createInvoice(createRequest);
      console.log('✅ Invoice created successfully:', newInvoice);

      alert('✅ Tạo hóa đơn thành công!');
      
      // Refresh both invoices and pending appointments (to remove from list)
      await loadInvoices();
      await loadPendingAppointments();
      
      // Switch to invoices tab to show newly created invoice
      setViewMode('invoices');
      setShowPriceModal(false);
      setSelectedAppointmentForInvoice(null);
      
    } catch (error: any) {
      console.error('❌ Error creating invoice:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error headers:', error.response?.headers);
      
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi tạo hóa đơn';
      alert(`❌ ${errorMsg}\n\nChi tiết: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setCreatingInvoiceFor(null);
    }
  };

  const loadData = async () => {
    if (viewMode === 'invoices') {
      await loadInvoices();
    } else {
      await loadPendingAppointments();
    }
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      console.log('📄 Loading invoices...');
      
      const data = await invoiceService.getAllInvoices();
      
      console.log('✅ Invoices loaded:', data);
      console.log('✅ Invoices type:', typeof data);
      console.log('✅ Is array?', Array.isArray(data));
      console.log('✅ Number of invoices:', data?.length || 0);
      
      // Backend có thể trả về array trực tiếp hoặc object {result: [...]}
      const invoicesList = Array.isArray(data) ? data : ((data as any)?.result || []);
      console.log('✅ Processed invoices list:', invoicesList);
      
      setInvoices(invoicesList || []);
    } catch (error: any) {
      console.error('❌ Error loading invoices:', error);
      console.error('❌ Error response:', error?.response);
      console.error('❌ Error data:', error?.response?.data);
      console.error('❌ Error status:', error?.response?.status);
      console.error('❌ Error message:', error?.message);
      
      // Set empty array để không crash UI
      setInvoices([]);
      
      // Hiển thị thông báo lỗi cụ thể
      if (error?.response?.status === 400) {
        console.warn('⚠️ Bad Request khi load invoices. Có thể backend yêu cầu params hoặc permissions');
      } else if (error?.response?.status === 404) {
        console.warn('⚠️ Endpoint /invoices không tồn tại');
      } else if (error?.response?.status === 403) {
        console.warn('⚠️ Không có quyền xem invoices');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPendingAppointments = async () => {
    try {
      setLoading(true);
      console.log('📋 Loading completed appointments...');
      
      // Lấy tất cả appointments
      const response = await appointmentService.getAllAppointments({});
      console.log('API Response:', response);
      
      // Backend có thể trả về trực tiếp array hoặc object {appointments: [...]}
      const allAppointments = Array.isArray(response) 
        ? response 
        : ((response as any).appointments || []);
      
      console.log('All appointments loaded:', allAppointments.length);
      
      // Lấy tất cả invoices để check xem appointment nào đã có invoice
      let existingInvoices: any[] = [];
      try {
        existingInvoices = await invoiceService.getAllInvoices();
        console.log('📄 Existing invoices loaded:', existingInvoices.length);
      } catch (err) {
        console.warn('Could not load invoices for filtering, continuing...');
      }
      
      // Tạo Set các appointmentId đã có invoice (để check nhanh hơn)
      const appointmentIdsWithInvoice = new Set(
        existingInvoices
          .map((inv: any) => inv.appointmentId) // Lấy appointmentId trực tiếp từ invoice response
          .filter(Boolean) // Loại bỏ undefined/null
      );
      
      console.log('📋 Appointments already have invoices:', appointmentIdsWithInvoice.size);
      console.log('📋 AppointmentIds with invoice:', Array.from(appointmentIdsWithInvoice));
      
      // Lọc ra các appointment đã COMPLETED và CHƯA có invoice
      const completedAppointmentsWithoutInvoice = allAppointments.filter((apt: Appointment) => {
        const isCompleted = apt.status === 'COMPLETED';
        const hasNoInvoice = !appointmentIdsWithInvoice.has(apt.id);
        
        if (isCompleted && !hasNoInvoice) {
          console.log(`⏭️ Skipping appointment ${apt.id.substring(0, 8)} - already has invoice`);
        }
        
        return isCompleted && hasNoInvoice;
      });
      
      console.log('✅ Completed appointments WITHOUT invoice:', completedAppointmentsWithoutInvoice.length);
      console.log('Completed appointments data:', completedAppointmentsWithoutInvoice);
      
      setPendingAppointments(completedAppointmentsWithoutInvoice);
    } catch (error) {
      console.error('❌ Error loading pending appointments:', error);
      console.error('Error details:', error);
      setPendingAppointments([]);
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

  const renderPendingOrders = () => {
    console.log('🎨 Rendering pending orders, count:', pendingAppointments.length, 'loading:', loading);
    
    return (
    <div className="invoice-table-container">
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : pendingAppointments.length === 0 ? (
        <div className="no-data">
          <Wrench size={48} />
          <p>Không có công việc hoàn thành nào</p>
          <p className="hint">
            Danh sách appointments đã hoàn thành sẽ hiển thị ở đây
          </p>
        </div>
      ) : (
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Mã lịch hẹn</th>
              <th>Khách hàng</th>
              <th>Biển số xe</th>
              <th>Gói dịch vụ</th>
              <th>Ngày hoàn thành</th>
              <th>Kỹ thuật viên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {pendingAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>
                  <span className="invoice-code">
                    #{appointment.id.substring(0, 8)}
                  </span>
                </td>
                <td>{appointment.customerName || 'N/A'}</td>
                <td>
                  <span className="license-plate">
                    {appointment.vehicleLicensePlate || 'N/A'}
                  </span>
                </td>
                <td>{appointment.servicePackageName || 'N/A'}</td>
                <td>
                  {appointment.actualCompletion 
                    ? formatDate(new Date(appointment.actualCompletion).toISOString())
                    : formatDate(new Date(appointment.appointmentDate).toISOString())
                  }
                </td>
                <td>{appointment.technicianName || 'Chưa phân công'}</td>
                <td>
                  <span className="status-badge success">
                    <CheckCircle size={14} />
                    Đã hoàn thành
                  </span>
                </td>
                <td>
                  <div className="action-buttons" style={{ gap: '8px', display: 'flex', justifyContent: 'center' }}>
                    <button
                      className="action-btn primary"
                      onClick={() => createInvoiceForAppointment(appointment.id)}
                      disabled={creatingInvoiceFor === appointment.id}
                      title="Tạo hóa đơn cho lịch hẹn này"
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: creatingInvoiceFor === appointment.id ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        opacity: creatingInvoiceFor === appointment.id ? 0.6 : 1
                      }}
                    >
                      {creatingInvoiceFor === appointment.id ? (
                        <>
                          <RefreshCw size={16} className="spinning" />
                          Đang tạo...
                        </>
                      ) : (
                        <>
                          <Plus size={16} />
                          Tạo hóa đơn
                        </>
                      )}
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => {
                        console.log('� Viewing invoices tab');
                        setViewMode('invoices');
                        loadInvoices();
                      }}
                      title="Xem danh sách hóa đơn đã tạo"
                      style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <FileText size={16} />
                      Xem danh sách HĐ
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
  };

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
      label: 'Đã hoàn thành',
      value: pendingAppointments.length,
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
          className={`tab-btn ${viewMode === 'pending-appointments' ? 'active' : ''}`}
          onClick={() => setViewMode('pending-appointments')}
        >
          <Wrench size={18} />
          Công việc hoàn thành ({pendingAppointments.length})
        </button>
        <button
          className={`tab-btn ${viewMode === 'invoices' ? 'active' : ''}`}
          onClick={() => setViewMode('invoices')}
        >
          <FileText size={18} />
          Hóa đơn đã tạo ({invoices.length})
        </button>
        <button
          className="refresh-btn"
          onClick={() => {
            console.log('🔄 Refreshing all data...');
            loadData();
          }}
          style={{ marginLeft: 'auto' }}
          title="Làm mới dữ liệu"
        >
          <RefreshCw size={18} />
          Làm mới
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
      {viewMode === 'pending-appointments' ? renderPendingOrders() : renderInvoices()}

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

      {/* Price Input Modal */}
      {showPriceModal && selectedAppointmentForInvoice && (
        <div className="modal-overlay" onClick={() => {
          setShowPriceModal(false);
          setSelectedAppointmentForInvoice(null);
          setInvoiceAmount(0);
          setPackagePrice(0);
          setAdditionalFee(0);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💰 Tạo hóa đơn dịch vụ</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedAppointmentForInvoice(null);
                  setInvoiceAmount(0);
                  setPackagePrice(0);
                  setAdditionalFee(0);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="invoice-detail">
                <div className="detail-row">
                  <span className="label">Mã lịch hẹn:</span>
                  <span className="value">#{selectedAppointmentForInvoice.id.substring(0, 8)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{selectedAppointmentForInvoice.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Biển số xe:</span>
                  <span className="value">
                    <span className="license-plate">{selectedAppointmentForInvoice.vehicleLicensePlate}</span>
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Gói dịch vụ:</span>
                  <span className="value">{selectedAppointmentForInvoice.servicePackageName}</span>
                </div>
                
                <div style={{ margin: '24px 0', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '2px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>
                    💵 Chi phí dịch vụ
                  </h3>
                  
                  {/* Package Price */}
                  <div className="detail-row" style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'white', borderRadius: '8px' }}>
                    <span className="label" style={{ fontSize: '14px' }}>Giá gói dịch vụ:</span>
                    <span className="value" style={{ fontSize: '16px', fontWeight: '700', color: '#059669' }}>
                      {loadingPackagePrice ? 'Đang tải...' : formatCurrency(packagePrice)}
                    </span>
                  </div>
                  
                  {/* Additional Fee Input */}
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: '#475569' }}>
                      Phí phát sinh (nếu có):
                    </label>
                    <input
                      type="number"
                      value={additionalFee}
                      onChange={(e) => {
                        const fee = Number(e.target.value);
                        setAdditionalFee(fee);
                        setInvoiceAmount(packagePrice + fee);
                      }}
                      placeholder="Nhập phí phát sinh..."
                      min="0"
                      step="10000"
                      disabled={loadingPackagePrice}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '15px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '8px',
                        fontWeight: '600',
                        backgroundColor: loadingPackagePrice ? '#f1f5f9' : 'white'
                      }}
                    />
                    <p style={{ marginTop: '6px', fontSize: '12px', color: '#64748b' }}>
                      💡 VD: Chi phí vật tư phụ tùng, công thêm ngoài gói...
                    </p>
                  </div>
                </div>

                {/* Calculation Summary */}
                {!loadingPackagePrice && (
                  <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '2px solid #3b82f6' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#1e40af' }}>
                      📊 Tổng kết chi phí
                    </h3>
                    
                    <div className="detail-row" style={{ marginBottom: '8px' }}>
                      <span className="label">Giá gói dịch vụ:</span>
                      <span className="value">{formatCurrency(packagePrice)}</span>
                    </div>
                    
                    {additionalFee > 0 && (
                      <div className="detail-row" style={{ marginBottom: '8px' }}>
                        <span className="label">Phí phát sinh:</span>
                        <span className="value" style={{ color: '#ea580c' }}>+{formatCurrency(additionalFee)}</span>
                      </div>
                    )}
                    
                    <div className="detail-row" style={{ marginBottom: '8px', paddingTop: '12px', borderTop: '1px solid #bfdbfe' }}>
                      <span className="label">Tạm tính:</span>
                      <span className="value" style={{ fontWeight: '700' }}>{formatCurrency(invoiceAmount)}</span>
                    </div>
                    
                    <div className="detail-row" style={{ marginBottom: '8px' }}>
                      <span className="label">Thuế VAT (10%):</span>
                      <span className="value">{formatCurrency(invoiceAmount * 0.1)}</span>
                    </div>
                    
                    <div className="detail-row highlight" style={{ fontSize: '18px', fontWeight: '800', paddingTop: '12px', borderTop: '2px solid #3b82f6' }}>
                      <span className="label" style={{ color: '#1e40af' }}>TỔNG THANH TOÁN:</span>
                      <span className="value amount" style={{ fontSize: '20px' }}>{formatCurrency(invoiceAmount * 1.1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowPriceModal(false);
                  setSelectedAppointmentForInvoice(null);
                  setInvoiceAmount(0);
                  setPackagePrice(0);
                  setAdditionalFee(0);
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (invoiceAmount <= 0) {
                    alert('Số tiền không hợp lệ!');
                    return;
                  }
                  createInvoiceForAppointment(selectedAppointmentForInvoice.id, invoiceAmount);
                }}
                disabled={loadingPackagePrice || invoiceAmount <= 0}
                style={{
                  opacity: loadingPackagePrice || invoiceAmount <= 0 ? 0.5 : 1,
                  cursor: loadingPackagePrice || invoiceAmount <= 0 ? 'not-allowed' : 'pointer'
                }}
              >
                <Plus size={16} />
                {loadingPackagePrice ? 'Đang tải...' : 'Tạo hóa đơn'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceManagement;
