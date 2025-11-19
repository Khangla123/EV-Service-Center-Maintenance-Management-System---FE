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
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Header với icon và tiêu đề */}
        <div style={{ 
          background: paymentResult?.success 
            ? '#1eb854'
            : '#dc3545',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ 
            width: '80px',
            height: '80px',
            margin: '0 auto 16px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
          }}>
            {paymentResult?.success ? '✓' : '✕'}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '600', margin: '0' }}>
            {paymentResult?.success ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            lineHeight: '1.6', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            {paymentResult?.message}
          </p>

          {paymentResult?.transactionId && (
            <div style={{ 
              backgroundColor: '#fff', 
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
              padding: '16px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <span style={{ color: '#666' }}>Mã giao dịch</span>
                <span style={{ fontWeight: '600', color: '#333' }}>
                  {paymentResult.transactionId.substring(0, 20)}...
                </span>
              </div>

              {paymentResult.amount && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ color: '#666' }}>Số tiền</span>
                  <span style={{ fontWeight: '700', color: '#1eb854', fontSize: '16px' }}>
                    {formatCurrency(paymentResult.amount)}
                  </span>
                </div>
              )}

              {paymentResult.paymentDate && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '8px 0'
                }}>
                  <span style={{ color: '#666' }}>Thời gian</span>
                  <span style={{ fontWeight: '500', color: '#333' }}>
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
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    backgroundColor: '#ff7518',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e66a15'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff7518'}
                >
                  📋 Xem lịch sử
                </button>
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.borderColor = '#999';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#ddd';
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
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '600',
                    backgroundColor: '#ff7518',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e66a15'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff7518'}
                >
                  🔄 Thử lại
                </button>
                <button
                  onClick={() => navigate('/customer/dashboard')}
                  style={{
                    padding: '12px 24px',
                    fontSize: '15px',
                    fontWeight: '500',
                    backgroundColor: 'transparent',
                    color: '#666',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                    e.currentTarget.style.borderColor = '#999';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = '#ddd';
                  }}
                >
                  🏠 Về trang chủ
                </button>
              </>
            )}
          </div>

          {paymentResult?.success && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #e0f2fe',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#0369a1',
              lineHeight: '1.6'
            }}>
              <div style={{ marginBottom: '4px' }}>
                <input type="checkbox" id="emailNotif" style={{ marginRight: '8px' }} />
                <label htmlFor="emailNotif">Hóa đơn điện tử đã được gửi về email</label>
              </div>
              <div>
                <input type="checkbox" id="serviceUsage" style={{ marginRight: '8px' }} />
                <label htmlFor="serviceUsage">Cảm ơn bạn đã sử dụng dịch vụ!</label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
