import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Car, Clock, MapPin, Phone, Mail } from 'lucide-react';
import MDButton from '../components/ui/MDButton';
import './AppointmentSuccessPage-new.css';

interface BookingData {
  vehicleId: string;
  serviceTypes: string[];
  preferredDate: string;
  preferredTime: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  notes: string;
  serviceCenter: string;
}

interface LocationState {
  bookingData: BookingData;
  bookingId: string;
}

const AppointmentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;
  
  const bookingData = state?.bookingData;
  const bookingId = state?.bookingId || 'UNKNOWN';

  // Mock data for display (would come from API)
  const mockServices = [
    { id: 'maintenance-basic', name: 'Bảo dưỡng cơ bản', price: 1500000 },
    { id: 'battery-check', name: 'Kiểm tra pin', price: 500000 },
    { id: 'software-update', name: 'Cập nhật phần mềm', price: 800000 }
  ];

  const mockVehicles = [
    { id: 'vehicle1', make: 'VinFast', model: 'VF8', licensePlate: '30A-12345' },
    { id: 'vehicle2', make: 'VinFast', model: 'VF9', licensePlate: '30B-67890' }
  ];

  const mockServiceCenters = [
    { id: 'hcm-1', name: 'VinFast Thủ Đức', address: '123 Đường Võ Văn Ngân, Thủ Đức, TP.HCM', phone: '(028) 1234 5678' },
    { id: 'hcm-2', name: 'VinFast Quận 1', address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM', phone: '(028) 8765 4321' },
    { id: 'hn-1', name: 'VinFast Cầu Giấy', address: '789 Đường Xuân Thủy, Cầu Giấy, Hà Nội', phone: '(024) 1234 5678' }
  ];

  const getSelectedVehicle = () => {
    return mockVehicles.find(v => v.id === bookingData?.vehicleId);
  };

  const getSelectedServices = () => {
    return mockServices.filter(service => bookingData?.serviceTypes.includes(service.id));
  };

  const getSelectedServiceCenter = () => {
    return mockServiceCenters.find(sc => sc.id === bookingData?.serviceCenter);
  };

  const getTotalPrice = () => {
    return getSelectedServices().reduce((total, service) => total + service.price, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewAppointments = () => {
    navigate('/customer/appointments');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (!bookingData) {
    return (
      <div className="appointment-success-page">
        <div className="success-container">
          <div className="success-icon">
            <CheckCircle size={80} color="#10B981" />
          </div>
          <h1 className="success-title">Không tìm thấy thông tin đặt lịch</h1>
          <p className="success-message">
            Vui lòng thử lại hoặc liên hệ với chúng tôi để được hỗ trợ.
          </p>
          <div className="action-buttons">
            <MDButton 
              variant="filled" 
              onClick={handleGoHome}
              className="primary-btn"
            >
              Về trang chủ
            </MDButton>
          </div>
        </div>
      </div>
    );
  }

  const selectedVehicle = getSelectedVehicle();
  const selectedServices = getSelectedServices();
  const selectedServiceCenter = getSelectedServiceCenter();

  return (
    <div className="appointment-success-page">
      <div className="success-container">
        <div className="success-icon">
          <CheckCircle size={80} color="#10B981" />
        </div>
        
        <h1 className="success-title">Đặt lịch thành công!</h1>
        
        <p className="success-message">
          Cảm ơn bạn đã tin tưởng dịch vụ của VinFast. Lịch hẹn của bạn đã được xác nhận.
        </p>

        <div className="appointment-info">
          <h2>Thông tin chi tiết đặt lịch</h2>
          
          <div className="info-section">
            <div className="section-header">
              <Calendar size={20} />
              <span>Mã đặt lịch</span>
            </div>
            <div className="info-item">
              <strong>{bookingId}</strong>
              <span className="status pending">Chờ xác nhận</span>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <Car size={20} />
              <span>Phương tiện</span>
            </div>
            <div className="info-item">
              {selectedVehicle ? (
                <div>
                  <strong>{selectedVehicle.make} {selectedVehicle.model}</strong>
                  <span>Biển số: {selectedVehicle.licensePlate}</span>
                </div>
              ) : (
                <span>Không xác định</span>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <Clock size={20} />
              <span>Thời gian</span>
            </div>
            <div className="info-item">
              <strong>{bookingData.preferredTime}</strong>
              <span>{formatDate(bookingData.preferredDate)}</span>
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <MapPin size={20} />
              <span>Địa điểm</span>
            </div>
            <div className="info-item">
              {selectedServiceCenter ? (
                <div>
                  <strong>{selectedServiceCenter.name}</strong>
                  <span>{selectedServiceCenter.address}</span>
                  <span>SĐT: {selectedServiceCenter.phone}</span>
                </div>
              ) : (
                <span>Không xác định</span>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <span>Dịch vụ đã chọn</span>
            </div>
            <div className="services-list">
              {selectedServices.length > 0 ? (
                <>
                  {selectedServices.map((service, index) => (
                    <div key={index} className="service-item">
                      <span>{service.name}</span>
                      <span className="service-price">{formatPrice(service.price)}</span>
                    </div>
                  ))}
                  <div className="total-price">
                    <strong>Tổng cộng: {formatPrice(getTotalPrice())}</strong>
                  </div>
                </>
              ) : (
                <span>Không có dịch vụ nào được chọn</span>
              )}
            </div>
          </div>

          <div className="info-section">
            <div className="section-header">
              <Phone size={20} />
              <span>Thông tin liên hệ</span>
            </div>
            <div className="info-item">
              <div><strong>Tên:</strong> {bookingData.contactName}</div>
              <div><Phone size={16} style={{display: 'inline-block', marginRight: '8px'}} />{bookingData.contactPhone}</div>
              <div><Mail size={16} style={{display: 'inline-block', marginRight: '8px'}} />{bookingData.contactEmail}</div>
              {bookingData.notes && (
                <div>
                  <strong>Ghi chú:</strong> {bookingData.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="next-steps">
          <h3>Các bước tiếp theo:</h3>
          <ol>
            <li>Chúng tôi sẽ gọi xác nhận lịch hẹn trong vòng 24 giờ</li>
            <li>Bạn sẽ nhận được email xác nhận chi tiết</li>
            <li>Vui lòng mang theo giấy tờ xe và CCCD khi đến</li>
            <li>Đến trước 15 phút để làm thủ tục</li>
            <li>Liên hệ hotline 1900-23-23-89 nếu cần thay đổi lịch hẹn</li>
          </ol>
        </div>

        <div className="contact-info">
          <h3>Cần hỗ trợ?</h3>
          <p>
            Liên hệ hotline: <strong>1900-23-23-89</strong><br />
            Email: <strong>support@vinfast.vn</strong><br />
            Thời gian hỗ trợ: 8:00 - 17:00 (Thứ 2 - Chủ nhật)
          </p>
        </div>

        <div className="action-buttons">
          <MDButton
            variant="outlined"
            onClick={() => navigate('/booking')}
            className="secondary-btn"
          >
            Đặt lịch khác
          </MDButton>
          <MDButton
            variant="filled"
            onClick={handleGoHome}
            className="primary-btn"
          >
            Về trang chủ
          </MDButton>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccessPage;