import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar, 
  Clock, 
  Car, 
  Wrench, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import MDButton from '../components/ui/MDButton';
import './AppointmentBookingPage.css';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingForm {
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

const AppointmentBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const user = state.user;

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BookingForm>({
    vehicleId: '',
    serviceTypes: [],
    preferredDate: '',
    preferredTime: '',
    contactName: user ? `${user.firstName} ${user.lastName}` : '',
    contactPhone: user?.phone || '',
    contactEmail: user?.email || '',
    notes: '',
    serviceCenter: ''
  });

  // Data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [serviceCenters, setServiceCenters] = useState([
    { id: 'hcm-1', name: 'VinFast Thủ Đức', address: '123 Đường Võ Văn Ngân, Thủ Đức, TP.HCM' },
    { id: 'hcm-2', name: 'VinFast Quận 1', address: '456 Đường Nguyễn Huệ, Quận 1, TP.HCM' },
    { id: 'hn-1', name: 'VinFast Cầu Giấy', address: '789 Đường Xuân Thủy, Cầu Giấy, Hà Nội' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Load mock data
  useEffect(() => {
    // Mock vehicles
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle1',
        make: 'VinFast',
        model: 'VF8',
        year: 2023,
        licensePlate: '30A-12345',
        vin: 'VF8ABC123456789'
      },
      {
        id: 'vehicle2',
        make: 'VinFast',
        model: 'VF9',
        year: 2024,
        licensePlate: '30B-67890',
        vin: 'VF9XYZ987654321'
      }
    ];

    // Mock service types
    const mockServiceTypes: ServiceType[] = [
      {
        id: 'maintenance-basic',
        name: 'Bảo dưỡng cơ bản',
        description: 'Kiểm tra và bảo dưỡng định kỳ cơ bản',
        duration: 120,
        price: 1500000,
        category: 'Bảo dưỡng'
      },
      {
        id: 'maintenance-premium',
        name: 'Bảo dưỡng toàn diện',
        description: 'Bảo dưỡng và kiểm tra toàn diện tất cả hệ thống',
        duration: 240,
        price: 3000000,
        category: 'Bảo dưỡng'
      },
      {
        id: 'battery-check',
        name: 'Kiểm tra pin',
        description: 'Kiểm tra và đánh giá tình trạng pin xe điện',
        duration: 60,
        price: 500000,
        category: 'Điện - Pin'
      },
      {
        id: 'software-update',
        name: 'Cập nhật phần mềm',
        description: 'Cập nhật hệ điều hành và phần mềm xe',
        duration: 90,
        price: 800000,
        category: 'Phần mềm'
      },
      {
        id: 'brake-service',
        name: 'Bảo dưỡng phanh',
        description: 'Kiểm tra và bảo dưỡng hệ thống phanh',
        duration: 180,
        price: 2000000,
        category: 'An toàn'
      },
      {
        id: 'tire-service',
        name: 'Bảo dưỡng lốp xe',
        description: 'Kiểm tra, cân bằng và thay lốp xe',
        duration: 120,
        price: 1200000,
        category: 'Lốp xe'
      }
    ];

    setVehicles(mockVehicles);
    setServiceTypes(mockServiceTypes);
  }, []);

  // Generate available time slots based on selected date
  useEffect(() => {
    if (formData.preferredDate) {
      const timeSlots: TimeSlot[] = [
        { time: '08:00', available: true },
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: false },
        { time: '16:00', available: true },
        { time: '17:00', available: true }
      ];
      setAvailableTimeSlots(timeSlots);
    }
  }, [formData.preferredDate]);

  const handleInputChange = (field: keyof BookingForm, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleServiceTypeToggle = (serviceId: string) => {
    const currentServices = formData.serviceTypes;
    if (currentServices.includes(serviceId)) {
      handleInputChange('serviceTypes', currentServices.filter(id => id !== serviceId));
    } else {
      handleInputChange('serviceTypes', [...currentServices, serviceId]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};

    switch (step) {
      case 1:
        if (!formData.vehicleId) {
          newErrors.vehicleId = 'Vui lòng chọn xe cần bảo dưỡng';
        }
        break;
      case 2:
        if (formData.serviceTypes.length === 0) {
          newErrors.serviceTypes = 'Vui lòng chọn ít nhất một dịch vụ';
        }
        break;
      case 3:
        if (!formData.preferredDate) {
          newErrors.preferredDate = 'Vui lòng chọn ngày';
        }
        if (!formData.preferredTime) {
          newErrors.preferredTime = 'Vui lòng chọn giờ';
        }
        if (!formData.serviceCenter) {
          newErrors.serviceCenter = 'Vui lòng chọn trung tâm dịch vụ';
        }
        break;
      case 4:
        if (!formData.contactName.trim()) {
          newErrors.contactName = 'Vui lòng nhập họ tên';
        }
        if (!formData.contactPhone.trim()) {
          newErrors.contactPhone = 'Vui lòng nhập số điện thoại';
        }
        if (!formData.contactEmail.trim()) {
          newErrors.contactEmail = 'Vui lòng nhập email';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to success page with booking data
      navigate('/appointment-success', { 
        state: { 
          bookingData: formData,
          bookingId: `BK${Date.now()}`
        }
      });
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedServices = () => {
    return serviceTypes.filter(service => formData.serviceTypes.includes(service.id));
  };

  const getTotalPrice = () => {
    return getSelectedServices().reduce((total, service) => total + service.price, 0);
  };

  const getTotalDuration = () => {
    return getSelectedServices().reduce((total, service) => total + service.duration, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getSelectedVehicle = () => {
    return vehicles.find(v => v.id === formData.vehicleId);
  };

  const getSelectedServiceCenter = () => {
    return serviceCenters.find(sc => sc.id === formData.serviceCenter);
  };

  const renderStepIndicator = () => (
    <div className="booking-steps">
      {[1, 2, 3, 4].map(step => (
        <div 
          key={step} 
          className={`step ${currentStep >= step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
        >
          <div className="step-number">
            {currentStep > step ? <CheckCircle size={20} /> : step}
          </div>
          <div className="step-label">
            {step === 1 && 'Chọn xe'}
            {step === 2 && 'Chọn dịch vụ'}
            {step === 3 && 'Chọn thời gian'}
            {step === 4 && 'Thông tin liên hệ'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="booking-step">
      <div className="step-header">
        <Car className="step-icon" />
        <h2>Chọn xe cần bảo dưỡng</h2>
        <p>Vui lòng chọn xe bạn muốn đặt lịch bảo dưỡng</p>
      </div>

      <div className="vehicle-grid">
        {vehicles.map(vehicle => (
          <div 
            key={vehicle.id}
            className={`vehicle-card ${formData.vehicleId === vehicle.id ? 'selected' : ''}`}
            onClick={() => handleInputChange('vehicleId', vehicle.id)}
          >
            <div className="vehicle-info">
              <h3>{vehicle.make} {vehicle.model}</h3>
              <p className="vehicle-year">Năm sản xuất: {vehicle.year}</p>
              <p className="vehicle-plate">Biển số: {vehicle.licensePlate}</p>
              <p className="vehicle-vin">VIN: {vehicle.vin}</p>
            </div>
            {formData.vehicleId === vehicle.id && (
              <CheckCircle className="selected-icon" />
            )}
          </div>
        ))}
      </div>

      {errors.vehicleId && (
        <div className="error-message">
          <AlertCircle size={16} />
          {errors.vehicleId}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => {
    const servicesByCategory = serviceTypes.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as {[key: string]: ServiceType[]});

    return (
      <div className="booking-step">
        <div className="step-header">
          <Wrench className="step-icon" />
          <h2>Chọn dịch vụ bảo dưỡng</h2>
          <p>Chọn các dịch vụ bạn muốn thực hiện</p>
        </div>

        <div className="services-container">
          {Object.entries(servicesByCategory).map(([category, services]) => (
            <div key={category} className="service-category">
              <h3 className="category-title">{category}</h3>
              <div className="service-grid">
                {services.map(service => (
                  <div 
                    key={service.id}
                    className={`service-card ${formData.serviceTypes.includes(service.id) ? 'selected' : ''}`}
                    onClick={() => handleServiceTypeToggle(service.id)}
                  >
                    <div className="service-info">
                      <h4>{service.name}</h4>
                      <p className="service-description">{service.description}</p>
                      <div className="service-details">
                        <span className="service-duration">
                          <Clock size={14} />
                          {Math.floor(service.duration / 60)}h {service.duration % 60}p
                        </span>
                        <span className="service-price">{formatPrice(service.price)}</span>
                      </div>
                    </div>
                    {formData.serviceTypes.includes(service.id) && (
                      <CheckCircle className="selected-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {formData.serviceTypes.length > 0 && (
          <div className="selection-summary">
            <h4>Dịch vụ đã chọn:</h4>
            <div className="selected-services">
              {getSelectedServices().map(service => (
                <div key={service.id} className="selected-service">
                  <span>{service.name}</span>
                  <span>{formatPrice(service.price)}</span>
                </div>
              ))}
            </div>
            <div className="total-summary">
              <div className="total-row">
                <span>Tổng thời gian:</span>
                <span>{Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}p</span>
              </div>
              <div className="total-row total-price">
                <span>Tổng chi phí:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>
          </div>
        )}

        {errors.serviceTypes && (
          <div className="error-message">
            <AlertCircle size={16} />
            {errors.serviceTypes}
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="booking-step">
      <div className="step-header">
        <Calendar className="step-icon" />
        <h2>Chọn thời gian và địa điểm</h2>
        <p>Chọn ngày giờ và trung tâm dịch vụ phù hợp với bạn</p>
      </div>

      <div className="datetime-container">
        <div className="date-section">
          <h4>Chọn ngày</h4>
          <input
            type="date"
            value={formData.preferredDate}
            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`date-input ${errors.preferredDate ? 'error' : ''}`}
          />
          {errors.preferredDate && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.preferredDate}
            </div>
          )}
        </div>

        <div className="time-section">
          <h4>Chọn giờ</h4>
          <div className="time-slots">
            {availableTimeSlots.map(slot => (
              <button
                key={slot.time}
                type="button"
                disabled={!slot.available}
                className={`time-slot ${formData.preferredTime === slot.time ? 'selected' : ''} ${!slot.available ? 'unavailable' : ''}`}
                onClick={() => handleInputChange('preferredTime', slot.time)}
              >
                {slot.time}
                {!slot.available && <span className="unavailable-text">Đã đặt</span>}
              </button>
            ))}
          </div>
          {errors.preferredTime && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.preferredTime}
            </div>
          )}
        </div>

        <div className="service-center-section">
          <h4>Chọn trung tâm dịch vụ</h4>
          <div className="service-centers">
            {serviceCenters.map(center => (
              <div 
                key={center.id}
                className={`service-center-card ${formData.serviceCenter === center.id ? 'selected' : ''}`}
                onClick={() => handleInputChange('serviceCenter', center.id)}
              >
                <div className="center-info">
                  <h5>{center.name}</h5>
                  <p>
                    <MapPin size={14} />
                    {center.address}
                  </p>
                </div>
                {formData.serviceCenter === center.id && (
                  <CheckCircle className="selected-icon" />
                )}
              </div>
            ))}
          </div>
          {errors.serviceCenter && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.serviceCenter}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="booking-step">
      <div className="step-header">
        <User className="step-icon" />
        <h2>Thông tin liên hệ</h2>
        <p>Xác nhận thông tin liên hệ để chúng tôi có thể liên lạc với bạn</p>
      </div>

      <div className="contact-form">
        <div className="form-group">
          <label htmlFor="contactName">
            <User size={16} />
            Họ và tên *
          </label>
          <input
            id="contactName"
            type="text"
            value={formData.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className={errors.contactName ? 'error' : ''}
            placeholder="Nhập họ và tên"
          />
          {errors.contactName && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.contactName}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">
            <Phone size={16} />
            Số điện thoại *
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            className={errors.contactPhone ? 'error' : ''}
            placeholder="Nhập số điện thoại"
          />
          {errors.contactPhone && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.contactPhone}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">
            <Mail size={16} />
            Email *
          </label>
          <input
            id="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className={errors.contactEmail ? 'error' : ''}
            placeholder="Nhập địa chỉ email"
          />
          {errors.contactEmail && (
            <div className="error-message">
              <AlertCircle size={16} />
              {errors.contactEmail}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="notes">
            Ghi chú (tùy chọn)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Ghi chú thêm về yêu cầu bảo dưỡng..."
            rows={4}
          />
        </div>
      </div>

      {/* Booking Summary */}
      <div className="booking-summary">
        <h4>Tóm tắt đặt lịch</h4>
        <div className="summary-content">
          <div className="summary-row">
            <span>Xe:</span>
            <span>{getSelectedVehicle()?.make} {getSelectedVehicle()?.model} - {getSelectedVehicle()?.licensePlate}</span>
          </div>
          <div className="summary-row">
            <span>Dịch vụ:</span>
            <span>{getSelectedServices().map(s => s.name).join(', ')}</span>
          </div>
          <div className="summary-row">
            <span>Thời gian:</span>
            <span>{formData.preferredDate} lúc {formData.preferredTime}</span>
          </div>
          <div className="summary-row">
            <span>Địa điểm:</span>
            <span>{getSelectedServiceCenter()?.name}</span>
          </div>
          <div className="summary-row">
            <span>Thời gian dự kiến:</span>
            <span>{Math.floor(getTotalDuration() / 60)}h {getTotalDuration() % 60}p</span>
          </div>
          <div className="summary-row total-price">
            <span>Tổng chi phí:</span>
            <span>{formatPrice(getTotalPrice())}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="appointment-booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Quay lại
          </button>
          <h1>Đặt lịch bảo dưỡng</h1>
        </div>

        {renderStepIndicator()}

        <div className="booking-content">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="booking-actions">
          {currentStep > 1 && (
            <MDButton 
              variant="outlined" 
              onClick={handlePrevious}
              className="prev-button"
            >
              <ArrowLeft size={16} />
              Quay lại
            </MDButton>
          )}
          
          <div className="spacer" />
          
          {currentStep < 4 ? (
            <MDButton 
              variant="filled" 
              onClick={handleNext}
              className="next-button"
            >
              Tiếp theo
              <ArrowRight size={16} />
            </MDButton>
          ) : (
            <MDButton 
              variant="filled" 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submit-button"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
            </MDButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentBookingPage;