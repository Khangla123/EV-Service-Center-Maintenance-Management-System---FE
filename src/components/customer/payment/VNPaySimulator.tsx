import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VNPaySimulator.css';

const VNPaySimulator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'card' | 'otp'>('card');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Parse payment info from URL params
    const info = {
      amount: searchParams.get('vnp_Amount'),
      orderInfo: searchParams.get('vnp_OrderInfo'),
      txnRef: searchParams.get('vnp_TxnRef'),
      returnUrl: searchParams.get('vnp_ReturnUrl')
    };
    setPaymentInfo(info);
  }, [searchParams]);

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '0 ₫';
    const value = parseInt(amount) / 100;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      alert('Vui lòng nhập đầy đủ thông tin thẻ');
      return;
    }

    // Validate card (simple check)
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Số thẻ không hợp lệ (phải có 16 số)');
      return;
    }

    setStep('otp');
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      alert('Mã OTP phải có 6 số');
      return;
    }

    setProcessing(true);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check OTP (accept "123456" as valid for demo)
    const isSuccess = otp === '123456';

    // Build return URL with result
    const resultParams = new URLSearchParams({
      vnp_TxnRef: paymentInfo.txnRef || `TXN${Date.now()}`,
      vnp_Amount: paymentInfo.amount || '0',
      vnp_ResponseCode: isSuccess ? '00' : '13',
      vnp_TransactionNo: `${Math.floor(Math.random() * 1000000)}`,
      vnp_PayDate: new Date().toISOString(),
      vnp_SecureHash: 'simulator_hash'
    });

    // Redirect to result page
    navigate(`/customer/payment/result?${resultParams.toString()}`);
  };

  const handleCancel = () => {
    const resultParams = new URLSearchParams({
      vnp_TxnRef: paymentInfo?.txnRef || `TXN${Date.now()}`,
      vnp_Amount: paymentInfo?.amount || '0',
      vnp_ResponseCode: '24', // User cancelled
      vnp_TransactionNo: `${Math.floor(Math.random() * 1000000)}`,
      vnp_PayDate: new Date().toISOString()
    });

    navigate(`/customer/payment/result?${resultParams.toString()}`);
  };

  if (!paymentInfo) {
    return <div className="vnpay-simulator loading">Đang tải...</div>;
  }

  return (
    <div className="vnpay-simulator">
      <div className="vnpay-header">
        <div className="vnpay-logo">
          <div className="logo-text">VNPAY</div>
        </div>
        <div className="vnpay-secure">
          <span>🔒 Giao dịch bảo mật</span>
        </div>
      </div>

      <div className="vnpay-content">
        <div className="payment-summary">
          <h3>Thông tin thanh toán</h3>
          <div className="summary-row">
            <span>Nội dung:</span>
            <strong>{paymentInfo.orderInfo}</strong>
          </div>
          <div className="summary-row total">
            <span>Số tiền thanh toán:</span>
            <strong className="amount">{formatCurrency(paymentInfo.amount)}</strong>
          </div>
        </div>

        {step === 'card' ? (
          <form onSubmit={handleCardSubmit} className="card-form">
            <h3>Thông tin thẻ</h3>
            
            <div className="form-group">
              <label>Số thẻ *</label>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                  const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                  setCardNumber(formatted);
                }}
                maxLength={19}
                required
              />
              <small>Sử dụng số thẻ test: 9704 0000 0000 0018</small>
            </div>

            <div className="form-group">
              <label>Tên chủ thẻ *</label>
              <input
                type="text"
                placeholder="NGUYEN VAN A"
                value={cardName}
                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ngày hết hạn *</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setExpiryDate(value);
                  }}
                  maxLength={5}
                  required
                />
              </div>

              <div className="form-group">
                <label>CVV *</label>
                <input
                  type="password"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  maxLength={3}
                  required
                />
              </div>
            </div>

            <div className="simulator-notice">
              <strong>💡 Hướng dẫn test:</strong>
              <ul>
                <li>Số thẻ: 9704 0000 0000 0018</li>
                <li>Tên: Bất kỳ</li>
                <li>Ngày hết hạn: 03/07</li>
                <li>CVV: Bất kỳ (3 số)</li>
              </ul>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Hủy giao dịch
              </button>
              <button type="submit" className="btn-submit">
                Tiếp tục
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="otp-form">
            <h3>Xác thực OTP</h3>
            
            <p className="otp-notice">
              Mã OTP đã được gửi đến số điện thoại đăng ký với ngân hàng
            </p>

            <div className="form-group">
              <label>Nhập mã OTP *</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                className="otp-input"
                required
                autoFocus
              />
            </div>

            <div className="simulator-notice">
              <strong>💡 Mã OTP test: 123456</strong>
              <p>Nhập mã này để thanh toán thành công</p>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Hủy giao dịch
              </button>
              <button 
                type="submit" 
                className="btn-submit"
                disabled={processing}
              >
                {processing ? '⏳ Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="vnpay-footer">
        <p>© 2025 VNPAY - Cổng thanh toán trực tuyến</p>
        <p className="simulator-badge">🎭 SIMULATOR MODE - For Testing Only</p>
      </div>
    </div>
  );
};

export default VNPaySimulator;
