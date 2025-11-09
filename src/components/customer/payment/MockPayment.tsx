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

  console.log('🎯 MockPayment LOADED!', { txnRef, amount, orderInfo, invoiceId });

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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            CỔNG THANH TOÁN DEMO
          </h1>
          <p style={{ fontSize: '14px', opacity: '0.9', margin: 0 }}>
            Giả lập thanh toán VNPay
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '28px 24px' }}>
          {/* Info Card */}
          <div style={{ 
            backgroundColor: '#f8f9fc', 
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#8492a6', marginBottom: '4px' }}>Số tiền thanh toán</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#667eea' }}>
                {amount.toLocaleString()} đ
              </div>
            </div>
            <div style={{ borderTop: '1px solid #e4e7eb', paddingTop: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#8492a6' }}>Mã giao dịch</span>
                <span style={{ fontWeight: '500', color: '#1f2d3d' }}>{txnRef.substring(0, 20)}...</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8492a6' }}>Nội dung</span>
                <span style={{ fontWeight: '500', color: '#1f2d3d' }}>{orderInfo.substring(0, 20)}...</span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#856404',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '18px' }}>⚠️</span>
            <span><strong>DEMO:</strong> Không có tiền thật được giao dịch</span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => handlePayment(true)}
              disabled={loading}
              style={{
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: loading ? '#e0e0e0' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {loading ? '⏳ Đang xử lý...' : '✅ Thanh toán thành công'}
            </button>
            
            <button 
              onClick={() => handlePayment(false)}
              disabled={loading}
              style={{
                padding: '14px',
                fontSize: '16px',
                fontWeight: '600',
                backgroundColor: loading ? '#e0e0e0' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              {loading ? '⏳ Đang xử lý...' : '❌ Thanh toán thất bại'}
            </button>
            
            <button 
              onClick={() => window.location.href = '/customer/payment'}
              disabled={loading}
              style={{
                padding: '12px',
                fontSize: '15px',
                backgroundColor: 'transparent',
                color: '#8492a6',
                border: '1px solid #e4e7eb',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s'
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
