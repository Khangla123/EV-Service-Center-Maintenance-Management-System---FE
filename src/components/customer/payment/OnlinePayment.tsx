import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MDButton } from '../../ui';
import './OnlinePayment.css';
import invoiceService, { InvoiceResponse } from '../../../services/invoiceService';
import paymentService from '../../../services/paymentService';

const VNPayImage = '/assets/images/VNPay.png';

const OnlinePayment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentData = location.state as {
    recordId?: string;
    amount?: number;
    serviceName?: string;
    vehicleName?: string;
    date?: Date;
  } | null;
  
  const [invoices, setInvoices] = useState<InvoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadUnpaidInvoices();
  }, []);

  const loadUnpaidInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const unpaidInvoices = await invoiceService.getUnpaidInvoices();
      setInvoices(unpaidInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      setError('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(dateString));
  };

  const handlePayment = async (invoice: InvoiceResponse) => {
    try {
      setProcessing(true);
      setError(null);

      console.log('=== STARTING MOCK PAYMENT PROCESS ===');
      console.log('Invoice:', invoice);
      console.log('Invoice ID:', invoice.id);
      console.log('Amount:', invoice.finalAmount);

      // Tạo URL thanh toán GIẢ LẬP (mock payment)
      const orderInfo = `Thanh toan hoa don ${invoice.id.substring(0, 8)}`;
      
      console.log('Calling backend API: POST /api/payments/mock/create');
      console.log('Params:', { invoiceId: invoice.id, amount: invoice.finalAmount, orderInfo });
      
      const paymentUrl = await paymentService.createMockPaymentUrl(
        invoice.id,
        invoice.finalAmount,
        orderInfo
      );

      console.log('✅ Backend response - Payment URL:', paymentUrl);
      console.log('🔄 Redirecting to payment page...');

      // Redirect đến trang thanh toán giả lập
      window.location.href = paymentUrl;
    } catch (error: any) {
      console.error('❌ ERROR creating payment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo thanh toán. Vui lòng thử lại.';
      setError(errorMessage);
      setProcessing(false);
      
      // Hiển thị chi tiết lỗi để debug
      alert(`❌ LỖI KHI TẠO THANH TOÁN:\n\n${errorMessage}\n\nChi tiết:\n- Status: ${error.response?.status || 'N/A'}\n- Backend: ${error.response ? 'Có phản hồi' : 'Không phản hồi'}\n\nMở Console (F12) để xem chi tiết!`);
    }
  };

  if (loading) {
    return (
      <div className="online-payment loading">
        <div className="loading-spinner">
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <div>Đang tải thông tin thanh toán...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="online-payment">
      <div className="payment-header">
        <h2>Thanh toán bảo dưỡng</h2>
        {invoices.length > 0 && (
          <div className="payment-amount">
            <span className="amount-label">Số tiền cần thanh toán:</span>
            <span className="amount-value">
              {formatCurrency(invoices.reduce((sum, inv) => sum + inv.finalAmount, 0))}
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          <span> {error}</span>
        </div>
      )}

      <div className="payment-content">
        {invoices.length === 0 && !paymentData ? (
          <div className="empty-state">
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
            <h3>Không có hóa đơn cần thanh toán</h3>
            <p>Bạn đã thanh toán tất cả các hóa đơn hoặc chưa có dịch vụ nào cần thanh toán</p>
            <MDButton variant="outlined" onClick={() => navigate('/customer/history')}>
              📜 Xem lịch sử bảo dưỡng
            </MDButton>
          </div>
        ) : paymentData && invoices.length === 0 ? (
          <div className="payment-info-card">
            <h3>📋 Thông tin thanh toán</h3>
            <div className="payment-details">
              <div className="detail-row">
                <strong>🔧 Dịch vụ:</strong>
                <span>{paymentData.serviceName}</span>
              </div>
              <div className="detail-row">
                <strong>🚗 Xe:</strong>
                <span>{paymentData.vehicleName}</span>
              </div>
              {paymentData.date && (
                <div className="detail-row">
                  <strong>📅 Ngày:</strong>
                  <span>{formatDate(paymentData.date.toString())}</span>
                </div>
              )}
              <div className="detail-row total">
                <strong>💰 Số tiền:</strong>
                <span>{formatCurrency(paymentData.amount || 0)}</span>
              </div>
            </div>
            
            <div className="payment-notice">
              <p>⚠️ Hiện tại chưa có hóa đơn được tạo cho dịch vụ này.</p>
              <p>Vui lòng liên hệ trung tâm để được hỗ trợ tạo hóa đơn và thanh toán.</p>
            </div>

            <div className="payment-actions">
              <MDButton variant="outlined" onClick={() => navigate('/customer/costs')}>
                ← Quay lại
              </MDButton>
            </div>
          </div>
        ) : (
          <div className="invoices-list">
            <h3>📄 Danh sách hóa đơn chưa thanh toán</h3>
            {invoices.map((invoice) => (
              <div key={invoice.id} className="invoice-card">
                <div className="invoice-header">
                  <div className="invoice-id">
                    <strong>Mã hóa đơn:</strong> {invoice.invoiceNumber || invoice.id.substring(0, 8)}
                  </div>
                  <div className={`invoice-status ${invoice.status.toLowerCase()}`}>
                    {invoice.status === 'PENDING' ? 'Chờ thanh toán' :
                     invoice.status === 'OVERDUE' ? 'Quá hạn' : invoice.status}
                  </div>
                </div>

                <div className="invoice-details">
                  {invoice.vehicleLicensePlate && (
                    <div className="detail-row">
                      <strong>Biển số:</strong>
                      <span>{invoice.vehicleLicensePlate}</span>
                    </div>
                  )}

                  <div className="detail-row">
                    <strong>Số tiền gốc:</strong>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>

                  {invoice.discount && invoice.discount > 0 && (
                    <div className="detail-row discount">
                      <strong>Giảm giá:</strong>
                      <span>-{formatCurrency(invoice.discount)}</span>
                    </div>
                  )}

                  <div className="detail-row total">
                    <strong>Tổng cộng:</strong>
                    <span>{formatCurrency(invoice.finalAmount)}</span>
                  </div>

                  <div className="detail-row">
                    <strong>Ngày phát hành:</strong>
                    <span>{formatDate(invoice.issueDate)}</span>
                  </div>

                  {invoice.dueDate && (
                    <div className="detail-row">
                      <strong>Hạn thanh toán:</strong>
                      <span>{formatDate(invoice.dueDate)}</span>
                    </div>
                  )}

                  {invoice.notes && (
                    <div className="detail-row">
                      <strong>Ghi chú:</strong>
                      <span>{invoice.notes}</span>
                    </div>
                  )}
                </div>

                <div className="invoice-actions">
                  <div className="payment-method-info">
                    <img src={VNPayImage} alt="VNPay" className="payment-icon" />
                    <span>Thanh toán qua VNPay</span>
                  </div>
                  <MDButton
                    variant="filled"
                    onClick={() => handlePayment(invoice)}
                    disabled={processing}
                    className={processing ? 'processing-button' : 'payment-button-primary'}
                  >
                    {processing ? '⏳ Đang xử lý...' : '💳 Thanh toán ngay'}
                  </MDButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default OnlinePayment;
