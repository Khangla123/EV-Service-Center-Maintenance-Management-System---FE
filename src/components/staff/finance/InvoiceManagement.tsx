import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle, Plus, Eye } from 'lucide-react';
import { MDButton } from '../../ui';
import CreateInvoiceModal from './CreateInvoiceModal';
import './InvoiceManagement.css';
import invoiceService, { InvoiceResponse } from '../../../services/invoiceService';
import appointmentService, { AppointmentResponse } from '../../../services/appointmentService';

const InvoiceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'completed' | 'invoices'>('completed');
  const [completedAppointments, setCompletedAppointments] = useState<AppointmentResponse[]>([]);
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'completed') {
        // Lấy danh sách appointments COMPLETED
        console.log('🔍 Loading COMPLETED appointments...');
        const completed = await appointmentService.getAppointmentsByStatus('COMPLETED');
        console.log('✅ Completed appointments:', completed);
        console.log('📊 Number of completed appointments:', completed.length);
        if (completed.length > 0) {
          console.log('📋 First appointment sample:', completed[0]);
        }
        setCompletedAppointments(completed);
      } else {
        // Lấy tất cả invoices
        console.log('🔍 Loading all invoices...');
        const allInvoices = await invoiceService.getAllInvoices();
        console.log('✅ All invoices:', allInvoices);
        console.log('📊 Number of invoices:', allInvoices.length);
        setInvoices(allInvoices);
      }
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      setError(error.response?.data?.message || 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = (appointment: AppointmentResponse) => {
    setSelectedAppointment(appointment);
    setShowCreateModal(true);
  };

  const handleInvoiceCreated = () => {
    setShowCreateModal(false);
    setSelectedAppointment(null);
    loadData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      PENDING: { icon: <Clock size={16} />, className: 'status-pending', label: 'Chờ thanh toán' },
      PAID: { icon: <CheckCircle size={16} />, className: 'status-paid', label: 'Đã thanh toán' },
      OVERDUE: { icon: <AlertCircle size={16} />, className: 'status-overdue', label: 'Quá hạn' },
      CANCELLED: { icon: <AlertCircle size={16} />, className: 'status-cancelled', label: 'Đã hủy' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="invoice-management loading">
        <div className="loading-spinner">
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <div>Đang tải dữ liệu...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-management">
      <div className="page-header">
        <div className="header-content">
          <FileText size={32} />
          <div>
            <h1>Quản lý hóa đơn</h1>
            <p>Tạo và quản lý hóa đơn cho dịch vụ đã hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircle size={20} />
          Dịch vụ đã hoàn thành ({completedAppointments.length})
        </button>
        <button
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FileText size={20} />
          Danh sách hóa đơn ({invoices.length})
        </button>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="content">
        {activeTab === 'completed' ? (
          <div className="completed-appointments">
            {completedAppointments.length === 0 ? (
              <div className="empty-state">
                <CheckCircle size={64} />
                <h3>Không có dịch vụ đã hoàn thành</h3>
                <p>Chưa có dịch vụ nào hoàn thành để tạo hóa đơn</p>
              </div>
            ) : (
              <div className="appointments-grid">
                {completedAppointments.map((appointment) => (
                  <div key={appointment.id} className="appointment-card">
                    <div className="card-header">
                      <div className="appointment-info">
                        <h3>#{appointment.id.substring(0, 8).toUpperCase()}</h3>
                        <span className="appointment-date">
                          {formatDate(appointment.appointmentDate)}
                        </span>
                      </div>
                      <span className="status-badge status-completed">
                        <CheckCircle size={16} />
                        Đã hoàn thành
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="label">Khách hàng:</span>
                        <span className="value">{appointment.customerName}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Biển số xe:</span>
                        <span className="value">{appointment.vehicleLicensePlate}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Dịch vụ:</span>
                        <span className="value">{appointment.servicePackageName}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Kỹ thuật viên:</span>
                        <span className="value">{appointment.technicianName || 'Chưa phân công'}</span>
                      </div>
                      {appointment.actualCompletion && (
                        <div className="info-row">
                          <span className="label">Hoàn thành lúc:</span>
                          <span className="value">{formatDate(appointment.actualCompletion)}</span>
                        </div>
                      )}
                    </div>

                    <div className="card-footer">
                      <MDButton
                        variant="filled"
                        onClick={() => handleCreateInvoice(appointment)}
                      >
                        <Plus size={18} />
                        Tạo hóa đơn
                      </MDButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="invoices-list">
            {invoices.length === 0 ? (
              <div className="empty-state">
                <FileText size={64} />
                <h3>Chưa có hóa đơn</h3>
                <p>Chưa có hóa đơn nào được tạo</p>
              </div>
            ) : (
              <div className="invoices-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mã hóa đơn</th>
                      <th>Khách hàng</th>
                      <th>Biển số xe</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Ngày phát hành</th>
                      <th>Hạn thanh toán</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>
                          <span className="invoice-code">
                            {invoice.invoiceNumber || `INV-${invoice.id.substring(0, 8)}`}
                          </span>
                        </td>
                        <td>{invoice.customerName}</td>
                        <td>{invoice.vehicleLicensePlate || 'N/A'}</td>
                        <td className="amount">{formatCurrency(invoice.finalAmount)}</td>
                        <td>{getStatusBadge(invoice.status)}</td>
                        <td>{formatDate(invoice.issueDate)}</td>
                        <td>{invoice.dueDate ? formatDate(invoice.dueDate) : 'N/A'}</td>
                        <td>
                          <button className="btn-icon" title="Xem chi tiết">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && selectedAppointment && (
        <CreateInvoiceModal
          appointment={selectedAppointment}
          onClose={() => {
            setShowCreateModal(false);
            setSelectedAppointment(null);
          }}
          onSuccess={handleInvoiceCreated}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;
