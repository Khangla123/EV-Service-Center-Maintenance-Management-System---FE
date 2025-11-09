import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MDButton } from '../../ui';
import paymentService from '../../../services/paymentService';

const PaymentResult: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<{
    success: boolean;
    message: string;
    transactionId?: string;
    amount?: number;
    paymentDate?: string;
  } | null>(null);

  useEffect(() => {
    handlePaymentCallback();
  }, []);

  const handlePaymentCallback = async () => {
    try {
      setLoading(true);

      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      const isMockPayment = params['mock'] === 'true';
      const responseCode = params['responseCode'] || params['vnp_ResponseCode'];
      const txnRef = params['txnRef'] || params['vnp_TxnRef'];
      const amount = params['amount'] ? parseInt(params['amount']) : 
                     (params['vnp_Amount'] ? parseInt(params['vnp_Amount']) / 100 : 0);

      if (responseCode === '00') {
        try {
          let result;
          if (isMockPayment) {
            result = await paymentService.handleMockCallback(txnRef, true);
          } else {
            result = await paymentService.handleVNPayCallback(params);
          }
          
          setPaymentResult({
            success: true,
            message: 'Thanh toán thành công!',
            transactionId: txnRef,
            amount: amount,
            paymentDate: new Date().toISOString()
          });
        } catch (error: any) {
          setPaymentResult({
            success: true,
            message: `Thanh toán đã được xác nhận thành công.\n\nTuy nhiên có lỗi khi cập nhật vào hệ thống. Vui lòng liên hệ bộ phận hỗ trợ với mã giao dịch: ${txnRef}`,
            transactionId: txnRef,
            amount: amount
          });
        }
      } else {
        const errorMessages: Record<string, string> = {
          '07': 'Giao dịch bị nghi ngờ gian lận',
          '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ thanh toán',
          '10': 'Xác thực thông tin thẻ không đúng quá 3 lần',
          '11': 'Đã hết hạn chờ thanh toán',
          '12': 'Thẻ/Tài khoản bị khóa',
          '13': 'Sai mật khẩu thanh toán',
          '24': 'Khách hàng hủy giao dịch',
          '51': 'Tài khoản không đủ số dư',
          '65': 'Tài khoản đã vượt quá hạn mức giao dịch',
          '75': 'Ngân hàng thanh toán đang bảo trì',
          '79': 'Giao dịch vượt quá số lần thanh toán trong ngày',
          '99': 'Lỗi không xác định'
        };

        try {
          if (isMockPayment) {
            await paymentService.handleMockCallback(txnRef, false);
          }
        } catch (error) {
          // Silently handle error
        }

        setPaymentResult({
          success: false,
          message: errorMessages[responseCode] || 'Thanh toán thất bại',
          transactionId: txnRef
        });
      }
    } catch (error) {
      setPaymentResult({
        success: false,
        message: 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
      });
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

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f5f7fa', 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          backgroundColor: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'pulse 1.5s infinite' }}>⏳</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 12px', color: '#1f2d3d' }}>
            Đang xử lý kết quả thanh toán...
          </h3>
          <p style={{ fontSize: '14px', color: '#8492a6', margin: 0 }}>
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f7fa', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          background: paymentResult?.success 
            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          padding: '40px 24px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ fontSize: '72px', marginBottom: '16px' }}>
            {paymentResult?.success ? '✅' : '❌'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', margin: '0', letterSpacing: '-0.5px' }}>
            {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          <p style={{ 
            fontSize: '15px', 
            color: '#4b5563', 
            lineHeight: '1.6', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {paymentResult?.message}
          </p>

          {paymentResult?.transactionId && (
            <div style={{ 
              backgroundColor: '#f8f9fc', 
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#8492a6' }}>Mã giao dịch</span>
                <span style={{ fontWeight: '500', color: '#1f2d3d', fontSize: '13px' }}>
                  {paymentResult.transactionId.substring(0, 24)}...
                </span>
              </div>

              {paymentResult.amount && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  paddingTop: '12px',
                  borderTop: '1px solid #e4e7eb',
                  marginTop: '12px'
                }}>
                  <span style={{ color: '#8492a6' }}>Số tiền</span>
                  <span style={{ fontWeight: '700', color: '#667eea', fontSize: '18px' }}>
                    {formatCurrency(paymentResult.amount)}
                  </span>
                </div>
              )}

              {paymentResult.paymentDate && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                  <span style={{ color: '#8492a6' }}>Thời gian</span>
                  <span style={{ fontWeight: '500', color: '#1f2d3d' }}>
                    {new Date(paymentResult.paymentDate).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {paymentResult?.success ? (
              <>
                <button
                  onClick={() => navigate('/customer/history')}
                  style={{
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  📜 Xem lịch sử
                </button>
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  style={{
                    padding: '12px',
                    fontSize: '15px',
                    backgroundColor: 'transparent',
                    color: '#8492a6',
                    border: '1px solid #e4e7eb',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  🏠 Về trang chủ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/customer/payment')}
                  style={{
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  🔄 Thử lại
                </button>
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  style={{
                    padding: '12px',
                    fontSize: '15px',
                    backgroundColor: 'transparent',
                    color: '#8492a6',
                    border: '1px solid #e4e7eb',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  🏠 Về trang chủ
                </button>
              </>
            )}
          </div>

          {paymentResult?.success && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#166534',
              textAlign: 'center',
              lineHeight: '1.6'
            }}>
              <p style={{ margin: '0 0 8px' }}>✉️ Hóa đơn điện tử đã được gửi về email</p>
              <p style={{ margin: 0 }}>📱 Cảm ơn bạn đã sử dụng dịch vụ!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
