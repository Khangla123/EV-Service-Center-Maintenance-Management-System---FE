import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceCenter, ServiceType, Vehicle, AppointmentFormData, Priority, ServiceCategory } from '../../../types';
import { MDButton } from '../../ui';
import './AppointmentBooking.css';

interface AppointmentBookingProps {
  onBookingComplete?: (appointmentId: string) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  onBookingComplete
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();
  const { user } = state;

  // Get pre-selected vehicle ID from navigation state
  const preSelectedVehicleId = location.state?.selectedVehicleId;

  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    vehicleId: '',
    serviceTypeId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: Priority.MEDIUM,
    notes: ''
  });

  // Load initial data
  useEffect(() => {
    loadServiceCenters();
    loadServiceTypes();
    loadVehicles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle pre-selected vehicle
  useEffect(() => {
    if (preSelectedVehicleId && vehicles.length > 0) {
      const preSelectedVehicle = vehicles.find(v => v.id === preSelectedVehicleId);
      if (preSelectedVehicle) {
        setSelectedVehicle(preSelectedVehicle);
        setFormData(prev => ({ ...prev, vehicleId: preSelectedVehicle.id }));
      }
    }
  }, [preSelectedVehicleId, vehicles]);

  const loadServiceCenters = () => {
    // Mock service centers
    const mockCenters: ServiceCenter[] = [
      {
        id: 'center1',
        name: 'VinFast Bãi Cháy',
        address: 'Số 950, đường Hạ Long, phường Bãi Cháy, tỉnh Quảng Ninh',
        phone: '0203-123-4567',
        email: 'quangninh@vinfast.vn',
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00', isOpen: true },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '16:00', isOpen: true }
        ],
        services: ['maintenance', 'repair', 'inspection', 'battery'],
        isActive: true,
        rating: 4.8,
        totalReviews: 178,
        coordinates: { lat: 20.9568, lng: 107.0433 }
      },
      {
        id: 'center2',
        name: 'VinFast Trường Chinh',
        address: 'Số 162, phố Trường Chinh, phường Kim Liên, thành phố Hà Nội',
        phone: '0243-123-4567',
        email: 'hanoi@vinfast.vn',
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00', isOpen: true },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '16:00', isOpen: true }
        ],
        services: ['maintenance', 'repair', 'inspection'],
        isActive: true,
        rating: 4.8,
        totalReviews: 245,
        coordinates: { lat: 21.0285, lng: 105.8542 }
      },
      {
        id: 'center3',
        name: 'VinFast Hải Thành',
        address: 'Số 591, đường Hùng Vương, phường Quy Nhơn Bắc, tỉnh Gia Lai',
        phone: '0257-123-4567',
        email: 'gialai@vinfast.vn',
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00', isOpen: true },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '16:00', isOpen: true }
        ],
        services: ['maintenance', 'repair', 'inspection'],
        isActive: true,
        rating: 4.7,
        totalReviews: 156,
        coordinates: { lat: 13.7830, lng: 109.2198 }
      },
      {
        id: 'center4',
        name: 'VinFast Sông Cầu',
        address: 'Số 92, đường Phạm Văn Đồng, phường Sông Cầu, tỉnh Đắk Lắk',
        phone: '0262-123-4567',
        email: 'daklak@vinfast.vn',
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00', isOpen: true },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '16:00', isOpen: true }
        ],
        services: ['maintenance', 'repair', 'inspection'],
        isActive: true,
        rating: 4.6,
        totalReviews: 142,
        coordinates: { lat: 12.6676, lng: 108.0432 }
      },
      {
        id: 'center5',
        name: 'VinFast Phú Mỹ Hưng',
        address: 'Số 1489, đường Nguyễn Văn Linh, phường Tân Hưng, thành phố Hồ Chí Minh',
        phone: '028-987-6543',
        email: 'hcmc@vinfast.vn',
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00', isOpen: true },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '16:00', isOpen: true }
        ],
        services: ['maintenance', 'repair', 'inspection', 'battery'],
        isActive: true,
        rating: 4.9,
        totalReviews: 189,
        coordinates: { lat: 10.7769, lng: 106.7009 }
      },
      {
        id: 'center6',
        name: 'VinFast Võ Thị Sáu',
        address: 'Số 468, đường Võ Thị Sáu, phường Bạc Liêu, tỉnh Cà Mau',
        phone: '0290-123-4567',
        email: 'camau@vinfast.vn',
        operatingHours: [
          { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 2, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 3, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 4, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 5, openTime: '08:00', closeTime: '18:00', isOpen: true },
          { dayOfWeek: 6, openTime: '08:00', closeTime: '17:00', isOpen: true },
          { dayOfWeek: 0, openTime: '09:00', closeTime: '16:00', isOpen: true }
        ],
        services: ['maintenance', 'repair', 'inspection'],
        isActive: true,
        rating: 4.5,
        totalReviews: 128,
        coordinates: { lat: 9.1768, lng: 105.1524 }
      }
    ];
    setServiceCenters(mockCenters);
  };

  const loadServiceTypes = () => {
    // Mock service types
    const mockServices: ServiceType[] = [
      {
        id: 'service1',
        name: 'Bảo dưỡng định kỳ',
        description: 'Kiểm tra và bảo dưỡng toàn diện xe điện',
        basePrice: 500000,
        estimatedDuration: 120,
        category: ServiceCategory.REGULAR_MAINTENANCE,
        isActive: true
      },
      {
        id: 'service2',
        name: 'Kiểm tra pin',
        description: 'Kiểm tra tình trạng và hiệu suất pin xe điện',
        basePrice: 300000,
        estimatedDuration: 60,
        category: ServiceCategory.BATTERY_SERVICE,
        isActive: true
      },
      {
        id: 'service3',
        name: 'Sửa chữa tổng quát',
        description: 'Sửa chữa các lỗi phát sinh trên xe',
        basePrice: 200000,
        estimatedDuration: 180,
        category: ServiceCategory.REPAIR,
        isActive: true
      },
      {
        id: 'service4',
        name: 'Cập nhật phần mềm',
        description: 'Cập nhật firmware và phần mềm hệ thống',
        basePrice: 100000,
        estimatedDuration: 30,
        category: ServiceCategory.SOFTWARE_UPDATE,
        isActive: true
      },
      {
        id: 'service5',
        name: 'Kiểm tra an toàn',
        description: 'Kiểm tra toàn diện các hệ thống an toàn',
        basePrice: 400000,
        estimatedDuration: 90,
        category: ServiceCategory.INSPECTION,
        isActive: true
      }
    ];
    setServiceTypes(mockServices);
  };

  const loadVehicles = () => {
    // Mock vehicles for current user
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle1',
        customerId: user?.id || '',
        make: 'VinFast',
        model: 'VF8',
        year: 2023,
        vin: 'VF8ABC123456789',
        licensePlate: '30A-123.45',
        color: 'Đen',
        batteryCapacity: 87.7,
        mileage: 14800,
        purchaseDate: new Date('2023-05-15'),
        warrantyExpiration: new Date('2026-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vehicle2',
        customerId: user?.id || '',
        make: 'VinFast',
        model: 'VF9',
        year: 2023,
        vin: 'VF9XYZ987654321',
        licensePlate: '30B-678.90',
        color: 'Trắng',
        batteryCapacity: 123,
        mileage: 8500,
        purchaseDate: new Date('2023-08-10'),
        warrantyExpiration: new Date('2026-08-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setVehicles(mockVehicles);
  };

  const generateTimeSlots = (date: string, center: ServiceCenter) => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    const operatingHours = center.operatingHours.find(h => h.dayOfWeek === dayOfWeek);
    
    if (!operatingHours || !operatingHours.isOpen) {
      return [];
    }

    const slots: string[] = [];
    const [openHour] = operatingHours.openTime.split(':').map(Number);
    const [closeHour] = operatingHours.closeTime.split(':').map(Number);

    for (let hour = openHour; hour < closeHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < closeHour - 1) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }

    return slots;
  };

  const handleCenterSelect = (center: ServiceCenter) => {
    setSelectedCenter(center);
    setStep(2);
  };

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedServices(prev => {
      if (prev.some(s => s.id === service.id)) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormData(prev => ({ ...prev, vehicleId: vehicle.id }));
  };

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, scheduledDate: date, scheduledTime: '' }));
    if (selectedCenter) {
      const slots = generateTimeSlots(date, selectedCenter);
      setAvailableTimeSlots(slots);
    }
  };

  const handleSubmit = async () => {
    if (!selectedVehicle || selectedServices.length === 0 || !formData.scheduledDate || !formData.scheduledTime) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const appointmentId = 'appointment_' + Date.now();
      console.log('Booking appointment:', {
        center: selectedCenter,
        services: selectedServices,
        vehicle: selectedVehicle,
        formData
      });

      if (onBookingComplete) {
        onBookingComplete(appointmentId);
      } else {
        navigate('/appointments/success', { state: { appointmentId } });
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.basePrice, 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + service.estimatedDuration, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${mins}m`;
  };

  const canProceedToStep3 = selectedServices.length > 0;
  const canProceedToStep4 = selectedVehicle !== null;

  return (
    <div className="appointment-booking">
      <div className="booking-header">
        <h1>Đặt lịch dịch vụ</h1>
        <div className="step-indicator">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className={`step ${step >= num ? 'active' : ''}`}>
              <span className="step-number">{num}</span>
              <span className="step-label">
                {num === 1 && 'Chọn trung tâm'}
                {num === 2 && 'Chọn dịch vụ'}
                {num === 3 && 'Chọn xe'}
                {num === 4 && 'Thời gian & Xác nhận'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="booking-content">
        {/* Step 1: Select Service Center */}
        {step === 1 && (
          <div className="step-content">
            <h2>Chọn trung tâm dịch vụ</h2>
            <div className="centers-grid">
              {serviceCenters.map(center => (
                <div
                  key={center.id}
                  className={`center-card ${selectedCenter?.id === center.id ? 'selected' : ''}`}
                  onClick={() => handleCenterSelect(center)}
                >
                  <div className="center-header">
                    <h3>{center.name}</h3>
                    <div className="center-rating">
                      <span className="rating">⭐ {center.rating}</span>
                      <span className="reviews">({center.totalReviews})</span>
                    </div>
                  </div>
                  <div className="center-address">
                    <p>{center.address}</p>
                  </div>
                  <div className="center-contact">
                    <p>📞 {center.phone}</p>
                    <p>✉️ {center.email}</p>
                  </div>
                  <div className="center-services">
                    <span>Dịch vụ: {center.services.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Services */}
        {step === 2 && (
          <div className="step-content">
            <h2>Chọn dịch vụ</h2>
            <div className="selected-center-info">
              <h3>Trung tâm đã chọn: {selectedCenter?.name}</h3>
            </div>
            <div className="services-grid">
              {serviceTypes.map(service => (
                <div
                  key={service.id}
                  className={`service-card ${selectedServices.some(s => s.id === service.id) ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedServices.some(s => s.id === service.id)}
                      onChange={() => handleServiceSelect(service)}
                    />
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <span className="price">{formatCurrency(service.basePrice)}</span>
                    <span className="duration">{formatDuration(service.estimatedDuration)}</span>
                  </div>
                </div>
              ))}
            </div>
            {selectedServices.length > 0 && (
              <div className="selection-summary">
                <h3>Tóm tắt dịch vụ đã chọn:</h3>
                <ul>
                  {selectedServices.map(service => (
                    <li key={service.id}>
                      {service.name} - {formatCurrency(service.basePrice)}
                    </li>
                  ))}
                </ul>
                <div className="total">
                  <strong>
                    Tổng: {formatCurrency(getTotalPrice())} - {formatDuration(getTotalDuration())}
                  </strong>
                </div>
              </div>
            )}
            <div className="step-actions">
              <MDButton variant="outlined" onClick={() => setStep(1)}>
                Quay lại
              </MDButton>
              <MDButton
                variant="filled"
                onClick={() => setStep(3)}
                disabled={!canProceedToStep3}
              >
                Tiếp tục
              </MDButton>
            </div>
          </div>
        )}

        {/* Step 3: Select Vehicle */}
        {step === 3 && (
          <div className="step-content">
            <h2>Chọn xe</h2>
            <div className="vehicles-grid">
              {vehicles.map(vehicle => (
                <div
                  key={vehicle.id}
                  className={`vehicle-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                  onClick={() => handleVehicleSelect(vehicle)}
                >
                  <div className="vehicle-header">
                    <h3>{vehicle.make} {vehicle.model}</h3>
                    <span className="vehicle-year">{vehicle.year}</span>
                  </div>
                  <div className="vehicle-details">
                    <p><strong>Biển số:</strong> {vehicle.licensePlate}</p>
                    <p><strong>Màu sắc:</strong> {vehicle.color}</p>
                    <p><strong>Số km đã đi:</strong> {vehicle.mileage.toLocaleString()}</p>
                    <p><strong>Dung lượng pin:</strong> {vehicle.batteryCapacity} kWh</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="step-actions">
              <MDButton variant="outlined" onClick={() => setStep(2)}>
                Quay lại
              </MDButton>
              <MDButton
                variant="filled"
                onClick={() => setStep(4)}
                disabled={!canProceedToStep4}
              >
                Tiếp tục
              </MDButton>
            </div>
          </div>
        )}

        {/* Step 4: Date, Time & Confirmation */}
        {step === 4 && (
          <div className="step-content">
            <h2>Chọn thời gian & Xác nhận</h2>
            
            <div className="datetime-section">
              <div className="date-input">
                <label>Chọn ngày:</label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {availableTimeSlots.length > 0 && (
                <div className="time-slots">
                  <label>Chọn giờ:</label>
                  <div className="time-grid">
                    {availableTimeSlots.map(time => (
                      <button
                        key={time}
                        className={`time-slot ${formData.scheduledTime === time ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, scheduledTime: time }))}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="notes-section">
                <label>Ghi chú (tùy chọn):</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Mô tả chi tiết vấn đề hoặc yêu cầu đặc biệt..."
                  rows={4}
                />
              </div>
            </div>

            <div className="booking-summary">
              <h3>Tóm tắt đặt lịch</h3>
              <div className="summary-item">
                <strong>Trung tâm:</strong> {selectedCenter?.name}
              </div>
              <div className="summary-item">
                <strong>Xe:</strong> {selectedVehicle?.make} {selectedVehicle?.model} - {selectedVehicle?.licensePlate}
              </div>
              <div className="summary-item">
                <strong>Dịch vụ:</strong>
                <ul>
                  {selectedServices.map(service => (
                    <li key={service.id}>{service.name}</li>
                  ))}
                </ul>
              </div>
              <div className="summary-item">
                <strong>Thời gian:</strong> {formData.scheduledDate} lúc {formData.scheduledTime}
              </div>
              <div className="summary-item">
                <strong>Tổng chi phí dự kiến:</strong> {formatCurrency(getTotalPrice())}
              </div>
              <div className="summary-item">
                <strong>Thời gian dự kiến:</strong> {formatDuration(getTotalDuration())}
              </div>
            </div>

            <div className="step-actions">
              <MDButton variant="outlined" onClick={() => setStep(3)}>
                Quay lại
              </MDButton>
              <MDButton
                variant="filled"
                onClick={handleSubmit}
                disabled={loading || !formData.scheduledDate || !formData.scheduledTime}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt lịch'}
              </MDButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentBooking;