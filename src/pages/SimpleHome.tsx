import React from 'react';

const SimpleHome: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <h1 style={{ color: '#0052CC', fontSize: '2.5rem', marginBottom: '20px' }}>
        🚗 EV Service Center
      </h1>
      <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '20px' }}>
        Hệ thống quản lý bảo dưỡng xe điện
      </h2>
      <p style={{ color: '#666', fontSize: '1.1rem', textAlign: 'center', maxWidth: '600px' }}>
        Chào mừng bạn đến với hệ thống quản lý bảo dưỡng xe điện VinFast. 
        Đây là trang chủ đơn giản để kiểm tra ứng dụng đã hoạt động chưa.
      </p>
      <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
        <button style={{
          backgroundColor: '#0052CC',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Đặt lịch bảo dưỡng
        </button>
        <button style={{
          backgroundColor: '#00C853',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          Xem lịch sử
        </button>
      </div>
    </div>
  );
};

export default SimpleHome;