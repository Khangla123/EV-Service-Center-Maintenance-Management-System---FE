/**
 * AppointmentSuccessPage.tsx - Appointment Confirmation Page
 * 
 * Trang xác nhận đặt lịch thành công.
 * Hiển thị thông tin chi tiết về lịch hẹn vừa tạo.
 * 
 * Features:
 * - Hiển thị mã đặt lịch (shortened UUID)
 * - Thông tin chi tiết appointment
 * - Danh sách dịch vụ đã chọn với giá
 * - Tổng chi phí dự kiến
 * - Hướng dẫn các bước tiếp theo
 * - CTA buttons (Xem lịch, Về trang chủ)
 * - Load chi tiết từ API nếu cần
 * 
 * @module pages/AppointmentSuccessPage
 */

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MDButton } from '../components/ui';
import appointmentService, { Appointment } from '../services/appointmentService';
import './AppointmentSuccessPage.css';

/**
 * LocationState - Interface cho location state từ booking page
 * 
 * @interface LocationState
 */
interface LocationState {
  appointmentId: string;
  appointmentDate?: string;
  totalServices?: number;
  services?: Array<{ id: string; name: string; price: number }>;
  vehicle?: { make: string; model: string; licensePlate: string };
  serviceCenter?: { name: string; address: string };
  notes?: string;
}

/**
 * generateDisplayCode - Tạo mã hiển thị ngắn gọn từ UUID
 * 
 * Chuyển đổi UUID dài thành mã ngắn gọn, dễ đọc cho người dùng.
 * 
 * @param {string} id - UUID của appointment
 * @param {string} [date] - Ngày hẹn (optional)
 * @returns {string} Display code (format: APT-XXXXXXXX hoặc APTmmdd-XXXXXXXX)
 * 
 * @example
 * generateDisplayCode('123e4567-e89b-12d3-a456-426614174000', '2024-10-15')
 * // Returns: 'APT1015-123E4567'
 */
const generateDisplayCode = (id: string, date?: string): string => {
  if (!id || id === 'UNKNOWN') return 'N/A';
  
  // Lấy 8 ký tự đầu của UUID và chuyển thành uppercase
  const shortId = id.substring(0, 8).toUpperCase();
  
  // Nếu có date, thêm prefix với tháng/ngày
  if (date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `APT${month}${day}-${shortId}`;
  }
  
  return `APT-${shortId}`;
};

/**
 * AppointmentSuccessPage Component
 * 
 * Component hiển thị trang xác nhận đặt lịch thành công.
 * Nhận data từ location state hoặc load từ API.
 * 
 * @returns {JSX.Element} AppointmentSuccessPage component
 */
const AppointmentSuccessPage: React.FC = () => {
  // Hooks
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  // State
  const [appointmentDetails, setAppointmentDetails] = useState<Appointment | null>(null);  // Chi tiết từ API
  const [loading, setLoading] = useState(false);  // Loading state
  
  // Extract data từ location state
  const appointmentId = state?.appointmentId || 'UNKNOWN';
  const appointmentDate = state?.appointmentDate;
  const totalServices = state?.totalServices || 1;
  const services = state?.services || [];
  const vehicle = state?.vehicle;
  const serviceCenter = state?.serviceCenter;
  const notes = state?.notes;
  
  // Generate display code cho UI
  const displayCode = generateDisplayCode(appointmentId, appointmentDate);

  /**
   * Effect: Load appointment details từ API nếu không có trong state
   * 
   * Chỉ load khi:
   * - appointmentId hợp lệ (không phải 'UNKNOWN')
   * - Chưa có services trong state
   */
  useEffect(() => {
    const loadAppointmentDetails = async () => {
      if (appointmentId !== 'UNKNOWN' && !services.length) {
        try {
          setLoading(true);
          const details = await appointmentService.getAppointmentById(appointmentId);
          setAppointmentDetails(details);
        } catch (error) {
          console.error('Error loading appointment details:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadAppointmentDetails();
  }, [appointmentId, services.length]);

  /**
   * formatDateTime - Format datetime string sang định dạng Việt Nam
   * 
   * @param {string} [dateTimeStr] - ISO datetime string
   * @returns {string} Formatted datetime (dd/mm/yyyy hh:mm)
   */
  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return 'Chưa xác định';
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  /**
   * formatCurrency - Format số tiền sang VNĐ
   * 
   * @param {number} amount - Số tiền cần format
   * @returns {string} Formatted currency (VNĐ)
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  /**
   * getTotalPrice - Tính tổng giá của tất cả services
   * 
   * @returns {number} Tổng tiền
   */
  const getTotalPrice = () => {
    return services.reduce((sum, service) => sum + service.price, 0);
  };

  /**
   * handleViewAppointments - Navigate đến trang danh sách appointments
   */
  const handleViewAppointments = () => {
    navigate('/customer/appointments');
  };

  /**
   * handleGoHome - Navigate về trang chủ
   */
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
          Cảm ơn bạn đã đặt lịch dịch vụ với chúng tôi. Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết cuộc hẹn.
        </p>

        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải thông tin...</div>}

        <div className="appointment-info">
          <h2>Thông tin đặt lịch</h2>
          
          <div className="info-item highlight-code">
            <strong>Mã đặt lịch:</strong> 
            <span className="appointment-code" title={`UUID đầy đủ: ${appointmentId}`}>
              {displayCode}
            </span>
          </div>
          
          <div className="info-item">
            <strong>Ngày giờ hẹn:</strong> <span>{formatDateTime(appointmentDate)}</span>
          </div>
          
          {vehicle && (
            <div className="info-item">
              <strong>Xe:</strong> <span>{vehicle.make} {vehicle.model} - {vehicle.licensePlate}</span>
            </div>
          )}
          
          {serviceCenter && (
            <div className="info-item">
              <strong>Trung tâm dịch vụ:</strong> <span>{serviceCenter.name}</span>
            </div>
          )}
          
          <div className="info-item">
            <strong>Dịch vụ đã chọn:</strong>
            {services.length > 0 ? (
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', listStyle: 'disc' }}>
                {services.map((service, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', color: '#1f2937', fontSize: '15px' }}>
                    <strong>{service.name}</strong> - <span style={{ color: '#16a34a', fontWeight: '600' }}>{formatCurrency(service.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ marginTop: '8px', padding: '12px', backgroundColor: '#dbeafe', borderRadius: '8px', color: '#1e40af', fontWeight: '500' }}>
                📋 {totalServices} dịch vụ (Chi tiết sẽ được xác nhận qua email)
              </div>
            )}
          </div>
          
          {services.length > 0 && (
            <div className="info-item" style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
              <strong>Tổng chi phí dự kiến:</strong> <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(getTotalPrice())}</span>
            </div>
          )}
          
          {notes && (
            <div className="info-item">
              <strong>Ghi chú:</strong> <span>{notes}</span>
            </div>
          )}
          
          <div className="info-item">
            <strong>Trạng thái:</strong> <span className="status pending">Chờ xác nhận</span>
          </div>
        </div>

        <div className="next-steps">
          <h3>Các bước tiếp theo:</h3>
          <ol>
            <li>Chúng tôi sẽ xác nhận lịch hẹn trong vòng 24 giờ</li>
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