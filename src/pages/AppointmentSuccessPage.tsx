import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MDButton } from '../components/ui';
import './AppointmentSuccessPage.css';

interface LocationState {
  appointmentId: string;
  appointmentDate?: string;
}

// Utility function to generate short display code from UUID
const generateDisplayCode = (id: string, date?: string): string => {
  if (!id || id === 'UNKNOWN') return 'N/A';
  
  // Take first 8 characters of UUID and convert to uppercase
  const shortId = id.substring(0, 8).toUpperCase();
  
  // If date is available, add date prefix
  if (date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `APT${month}${day}-${shortId}`;
  }
  
  return `APT-${shortId}`;
};

const AppointmentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const appointmentId = state?.appointmentId || 'UNKNOWN';
  const appointmentDate = state?.appointmentDate;
  const displayCode = generateDisplayCode(appointmentId, appointmentDate);

  const handleViewAppointments = () => {
    navigate('/customer/appointments');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="appointment-success-page">
      <div className="success-container">
        <div className="success-icon">
          <div className="checkmark">✓</div>
        </div>
        
        <h1 className="success-title">Đặt lịch thành công!</h1>
        
        <p className="success-message">
          Cảm ơn bạn đã đặt lịch dịch vụ với chúng tôi. 
          Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết cuộc hẹn.
        </p>

        <div className="appointment-info">
          <h2>Thông tin đặt lịch</h2>
          <div className="info-item highlight-code">
            <strong>Mã đặt lịch:</strong> 
            <span className="appointment-code" title={`UUID đầy đủ: ${appointmentId}`}>
              {displayCode}
            </span>
          </div>
          <div className="info-item">
            <strong>Trạng thái:</strong> <span className="status pending">Chờ xác nhận</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>Các bước tiếp theo:</h3>
          <ol>
            <li>Chúng tôi sẽ xác nhận lịch hẹn trong vòng 24 giờ</li>
            <li>Bạn sẽ nhận được thông báo qua email và SMS</li>
            <li>Vui lòng đến đúng giờ đã đặt</li>
            <li>Mang theo giấy tờ xe và CMND/CCCD</li>
          </ol>
        </div>

        <div className="contact-info">
          <h3>Cần hỗ trợ?</h3>
          <p>
            Liên hệ hotline: <strong>1900-xxxx</strong><br />
            Email: <strong>support@vinfast.vn</strong>
          </p>
        </div>

        <div className="action-buttons">
          <MDButton
            variant="filled"
            onClick={handleViewAppointments}
            className="primary-btn"
          >
            Xem lịch đã đặt
          </MDButton>
          <MDButton
            variant="outlined"
            onClick={handleGoHome}
            className="secondary-btn"
          >
            Về trang chủ
          </MDButton>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccessPage;