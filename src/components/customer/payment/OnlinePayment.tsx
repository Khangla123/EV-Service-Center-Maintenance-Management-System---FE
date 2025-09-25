import React, { useState, useEffect } from 'react';
import { MDButton } from '../../ui';
import './OnlinePayment.css';

const MomoImage = '/assets/images/MOMO.png';
const ZaloPayImage = '/assets/images/ZaloPay.png';
const VNPayImage = '/assets/images/VNPay.png';
const VietcombankImage = '/assets/images/Vietcombank.png';
const TechcombankImage = '/assets/images/Techcombank.png';
const VisaMasterCardImage = '/assets/images/Visa and MasterCard.png';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'e-wallet' | 'banking' | 'card';
  icon: string;
  enabled: boolean;
  processingFee?: number;
  description?: string;
}

export interface PaymentRequest {
  id: string;
  amount: number;
  description: string;
  serviceId?: string;
  vehicleId?: string;
  dueDate?: Date;
  category: 'maintenance' | 'repair' | 'emergency' | 'subscription';
}

export interface PaymentTransaction {
  id: string;
  paymentRequestId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  completedAt?: Date;
  transactionId?: string;
  errorMessage?: string;
}

interface OnlinePaymentProps {
  paymentRequest?: PaymentRequest;
  onPaymentComplete?: (transaction: PaymentTransaction) => void;
  onCancel?: () => void;
  className?: string;
}

const OnlinePayment: React.FC<OnlinePaymentProps> = ({
  paymentRequest,
  onPaymentComplete,
  onCancel,
  className
}) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm' | 'processing' | 'result'>('select');
  const [transaction, setTransaction] = useState<PaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form data for different payment methods
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Mock payment request if not provided
  const defaultPaymentRequest: PaymentRequest = {
    id: 'payment-001',
    amount: 1760000,
    description: 'Thanh toán bảo dưỡng định kỳ - VinFast VF8',
    serviceId: 'service-001',
    vehicleId: 'vehicle-001',
    category: 'maintenance'
  };

  const currentRequest = paymentRequest || defaultPaymentRequest;

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const methods: PaymentMethod[] = [
        {
          id: 'momo',
          name: 'MoMo',
          type: 'e-wallet',
          icon: MomoImage,
          enabled: true,
          description: 'Thanh toán nhanh với ví MoMo'
        },
        {
          id: 'zalopay',
          name: 'ZaloPay',
          type: 'e-wallet',
          icon: ZaloPayImage,
          enabled: true,
          description: 'Thanh toán với ví ZaloPay'
        },
        {
          id: 'vnpay',
          name: 'VNPay',
          type: 'e-wallet',
          icon: VNPayImage,
          enabled: true,
          description: 'Cổng thanh toán VNPay'
        },
        {
          id: 'vietcombank',
          name: 'Vietcombank',
          type: 'banking',
          icon: VietcombankImage,
          enabled: true,
          description: 'Chuyển khoản ngân hàng Vietcombank'
        },
        {
          id: 'techcombank',
          name: 'Techcombank',
          type: 'banking',
          icon: TechcombankImage,
          enabled: true,
          description: 'Chuyển khoản ngân hàng Techcombank'
        },
        {
          id: 'visa',
          name: 'Thẻ Visa/Mastercard',
          type: 'card',
          icon: VisaMasterCardImage,
          enabled: true,
          description: 'Thanh toán bằng thẻ tín dụng/ghi nợ'
        }
      ];
      
      setPaymentMethods(methods);
      setLoading(false);
    };

    loadPaymentMethods();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const calculateTotalAmount = () => {
    const processingFee = selectedMethod?.processingFee || 0;
    return currentRequest.amount + processingFee;
  };

  const selectPaymentMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setCurrentStep('confirm');
    setError(null);
  };

  const confirmPayment = () => {
    if (!selectedMethod) return;
    
    setCurrentStep('processing');
    setError(null);
    
    // Create transaction
    const newTransaction: PaymentTransaction = {
      id: `txn-${Date.now()}`,
      paymentRequestId: currentRequest.id,
      amount: calculateTotalAmount(),
      method: selectedMethod,
      status: 'processing',
      createdAt: new Date()
    };
    
    setTransaction(newTransaction);
    
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        const completedTransaction: PaymentTransaction = {
          ...newTransaction,
          status: 'completed',
          completedAt: new Date(),
          transactionId: `VIN${Date.now()}`
        };
        setTransaction(completedTransaction);
        setCurrentStep('result');
        onPaymentComplete?.(completedTransaction);
      } else {
        const failedTransaction: PaymentTransaction = {
          ...newTransaction,
          status: 'failed',
          errorMessage: 'Giao dịch không thành công. Vui lòng thử lại.'
        };
        setTransaction(failedTransaction);
        setCurrentStep('result');
      }
    }, 3000);
  };

  const retryPayment = () => {
    setCurrentStep('select');
    setSelectedMethod(null);
    setTransaction(null);
    setError(null);
  };

  const handleCancel = () => {
    if (transaction && transaction.status === 'processing') {
      // Cannot cancel processing transaction
      return;
    }
    onCancel?.();
  };

  if (loading) {
    return (
      <div className={`online-payment loading ${className || ''}`}>
        <div className="loading-spinner">Đang tải các phương thức thanh toán...</div>
      </div>
    );
  }

  return (
    <div className={`online-payment ${className || ''}`}>
      {/* Header */}
      <div className="payment-header">
        <h2>Thanh toán bảo dưỡng</h2>
        <div className="payment-amount">
          <span className="amount-label">Số tiền cần thanh toán:</span>
          <span className="amount-value">{formatCurrency(currentRequest.amount)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="payment-info">
        <div className="info-item">
          <strong>Mô tả:</strong>
          <span>{currentRequest.description}</span>
        </div>
        {currentRequest.dueDate && (
          <div className="info-item">
            <strong>Hạn thanh toán:</strong>
            <span>{new Intl.DateTimeFormat('vi-VN').format(currentRequest.dueDate)}</span>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="payment-content">
        {currentStep === 'select' && (
          <div className="method-selection">
            <h3>Chọn phương thức thanh toán</h3>
            <div className="methods-grid">
              {paymentMethods.map(method => (
                <div 
                  key={method.id}
                  className={`method-card ${!method.enabled ? 'disabled' : ''}`}
                  onClick={() => method.enabled && selectPaymentMethod(method)}
                >
                  <div className="method-icon">
                    {typeof method.icon === 'string' && (method.icon.endsWith('.png') || method.icon.endsWith('.jpg') || method.icon.endsWith('.jpeg')) ? 
                      <img src={method.icon} alt={method.name} /> : 
                      method.icon
                    }
                  </div>
                  <div className="method-info">
                    <div className="method-name">{method.name}</div>
                    <div className="method-description">{method.description}</div>
                    {(method.processingFee ?? 0) > 0 && (
                      <div className="processing-fee">
                        Phí xử lý: {formatCurrency(method.processingFee ?? 0)}
                      </div>
                    )}
                  </div>
                  {!method.enabled && (
                    <div className="disabled-badge">Tạm ngưng</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'confirm' && selectedMethod && (
          <div className="payment-confirmation">
            <h3>Xác nhận Thanh toán</h3>
            
            <div className="selected-method">
              <div className="method-summary">
                <div className="method-icon">
                  {typeof selectedMethod.icon === 'string' && (selectedMethod.icon.endsWith('.png') || selectedMethod.icon.endsWith('.jpg') || selectedMethod.icon.endsWith('.jpeg')) ? 
                    <img src={selectedMethod.icon} alt={selectedMethod.name} /> : 
                    selectedMethod.icon
                  }
                </div>
                <div className="method-details">
                  <div className="method-name">{selectedMethod.name}</div>
                  <div className="method-type">{selectedMethod.description}</div>
                </div>
              </div>
            </div>

            <div className="payment-breakdown">
              <div className="breakdown-item">
                <span>Số tiền gốc:</span>
                <span>{formatCurrency(currentRequest.amount)}</span>
              </div>
              {(selectedMethod.processingFee ?? 0) > 0 && (
                <div className="breakdown-item">
                  <span>Phí xử lý:</span>
                  <span>{formatCurrency(selectedMethod.processingFee ?? 0)}</span>
                </div>
              )}
              <div className="breakdown-item total">
                <span>Tổng cộng:</span>
                <span>{formatCurrency(calculateTotalAmount())}</span>
              </div>
            </div>

            {/* Additional forms for specific payment methods */}
            {selectedMethod.type === 'card' && (
              <div className="card-form">
                <h4>Thông tin Thẻ</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Số thẻ:</label>
                    <input 
                      type="text" 
                      placeholder="1234 5678 9012 3456"
                      value={cardData.number}
                      onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                      maxLength={19}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tên chủ thẻ:</label>
                    <input 
                      type="text" 
                      placeholder="NGUYEN VAN A"
                      value={cardData.name}
                      onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Ngày hết hạn:</label>
                    <input 
                      type="text" 
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                      maxLength={5}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV:</label>
                    <input 
                      type="text" 
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {selectedMethod.type === 'banking' && (
              <div className="banking-form">
                <h4>Thông tin Chuyển khoản</h4>
                <div className="banking-info">
                  <p>Vui lòng chuyển khoản đến:</p>
                  <div className="bank-details">
                    <div><strong>Ngân hàng:</strong> {selectedMethod.name}</div>
                    <div><strong>Số tài khoản:</strong> 1234567890</div>
                    <div><strong>Tên tài khoản:</strong> CONG TY VINFAST</div>
                    <div><strong>Nội dung:</strong> {currentRequest.id}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="confirmation-actions">
              <MDButton 
                variant="outlined" 
                onClick={() => setCurrentStep('select')}
              >
                Quay lại
              </MDButton>
              <MDButton 
                variant="filled" 
                onClick={confirmPayment}
              >
                Xác nhận Thanh toán
              </MDButton>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="payment-processing">
            <div className="processing-icon">⏳</div>
            <h3>Đang xử lý Thanh toán</h3>
            <p>Vui lòng không đóng cửa sổ này...</p>
            <div className="processing-steps">
              <div className="step active">Khởi tạo giao dịch</div>
              <div className="step active">Kết nối với {selectedMethod?.name}</div>
              <div className="step active">Xử lý thanh toán</div>
              <div className="step">Hoàn tất</div>
            </div>
          </div>
        )}

        {currentStep === 'result' && transaction && (
          <div className="payment-result">
            {transaction.status === 'completed' ? (
              <div className="success-result">
                <div className="result-icon">✅</div>
                <h3>Thanh toán Thành công!</h3>
                <div className="transaction-details">
                  <div className="detail-item">
                    <strong>Mã giao dịch:</strong>
                    <span>{transaction.transactionId}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Phương thức:</strong>
                    <span>{transaction.method.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Số tiền:</strong>
                    <span>{formatCurrency(transaction.amount)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Thời gian:</strong>
                    <span>{new Intl.DateTimeFormat('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(transaction.completedAt || transaction.createdAt)}</span>
                  </div>
                </div>
                <p className="success-message">
                  Bạn sẽ nhận được email xác nhận trong vòng vài phút.
                </p>
              </div>
            ) : (
              <div className="error-result">
                <div className="result-icon">❌</div>
                <h3>Thanh toán Thất bại</h3>
                <p className="error-message">{transaction.errorMessage}</p>
                <div className="error-actions">
                  <MDButton variant="outlined" onClick={retryPayment}>
                    Thử lại
                  </MDButton>
                  <MDButton variant="text" onClick={handleCancel}>
                    Hủy bỏ
                  </MDButton>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {(currentStep === 'select' || currentStep === 'confirm') && (
        <div className="payment-footer">
          <MDButton variant="text" onClick={handleCancel}>
            Hủy bỏ
          </MDButton>
          <div className="security-info">
            <span>🔒 Giao dịch được bảo mật bằng SSL</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default OnlinePayment;