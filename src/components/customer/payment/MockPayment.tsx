import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const MockPayment: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const txnRef = searchParams.get('txnRef') || '';
  const amount = parseInt(searchParams.get('amount') || '0');
  const orderInfo = searchParams.get('orderInfo') || '';
  const invoiceId = searchParams.get('invoiceId') || '';

  const handlePayment = (success: boolean) => {
    setLoading(true);
    
    const params = new URLSearchParams({
      txnRef,
      responseCode: success ? '00' : '99',
      amount: amount.toString(),
      orderInfo,
      mock: 'true'
    });
    
    window.location.href = `/mock-payment/result?${params.toString()}`;
  };

  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef5 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 24px',
          textAlign: 'center',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%'
          }}></div>
          <div style={{ fontSize: '56px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>💳</div>
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: '700', 
            margin: '0 0 10px', 
            letterSpacing: '0.5px',
            position: 'relative',
            zIndex: 1
          }}>
            CỔNG THANH TOÁN
          </h1>
          <p style={{ 
            fontSize: '15px', 
            opacity: '0.95', 
            margin: 0,
            fontWeight: '500',
            position: 'relative',
            zIndex: 1
          }}>
            Thanh toán qua VNPay
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 24px' }}>
          {/* Info Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #f8f9fc 0%, #ffffff 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            border: '1px solid #e4e7eb',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ 
                fontSize: '13px', 
                color: '#8492a6', 
                marginBottom: '8px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Số tiền thanh toán
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '800', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {amount.toLocaleString()} đ
              </div>
            </div>
            <div style={{ 
              borderTop: '2px solid #f0f2f5', 
              paddingTop: '20px', 
              fontSize: '14px' 
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '12px',
                alignItems: 'center'
              }}>
                <span style={{ color: '#8492a6', fontWeight: '600' }}>🔖 Mã giao dịch</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: '#1f2d3d',
                  backgroundColor: '#f8f9fc',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontFamily: 'monospace'
                }}>
                  {txnRef.substring(0, 20)}...
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: '#8492a6', fontWeight: '600' }}>📝 Nội dung</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: '#1f2d3d',
                  backgroundColor: '#f8f9fc',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}>
                  {orderInfo.substring(0, 20)}...
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              onClick={() => handlePayment(true)}
              disabled={loading}
              style={{
                padding: '18px',
                fontSize: '17px',
                fontWeight: '700',
                backgroundColor: loading ? '#e0e0e0' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(16, 185, 129, 0.4)',
                transform: loading ? 'none' : 'translateY(0)',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }
              }}
            >
              {loading ? (
                <span>⏳ Đang xử lý thanh toán...</span>
              ) : (
                <span>💳 Xác nhận thanh toán</span>
              )}
            </button>
            
            <button 
              onClick={() => window.location.href = '/customer/payment'}
              disabled={loading}
              style={{
                padding: '14px',
                fontSize: '15px',
                fontWeight: '600',
                backgroundColor: 'transparent',
                color: loading ? '#ccc' : '#8492a6',
                border: '2px solid #e4e7eb',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.color = '#667eea';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#e4e7eb';
                  e.currentTarget.style.color = '#8492a6';
                }
              }}
            >
              ← Hủy giao dịch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockPayment;
