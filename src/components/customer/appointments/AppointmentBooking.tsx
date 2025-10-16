import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceCenter, ServiceType, Vehicle, AppointmentFormData, Priority, ServiceCategory } from '../../../types';
import { MDButton } from '../../ui';
import './AppointmentBooking.css';
import vehicleService from '../../../services/vehicleService';
import appointmentService from '../../../services/appointmentService';
import customerService from '../../../services/customerService';
import serviceCenterService from '../../../services/serviceCenterService';
import servicePackageService from '../../../services/servicePackageService';

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
  const [customerId, setCustomerId] = useState<string | null>(null);
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
    loadCustomerProfile();
    loadServiceCenters();
    loadServiceTypes();
    loadVehicles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCustomerProfile = async () => {
    try {
      const customer = await customerService.getMyProfile();
      setCustomerId(customer.id);
    } catch (err) {
      console.error('Error loading customer profile:', err);
    }
  };

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

  // Generate time slots when entering step 4
  useEffect(() => {
    if (step === 4 && selectedCenter) {
      // Set today's date if not already set
      if (!formData.scheduledDate) {
        const today = new Date().toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, scheduledDate: today }));
        const slots = generateTimeSlots(today, selectedCenter);
        setAvailableTimeSlots(slots);
      } else {
        // Generate time slots for existing date
        const slots = generateTimeSlots(formData.scheduledDate, selectedCenter);
        setAvailableTimeSlots(slots);
      }
    }
  }, [step, selectedCenter]);

  const loadServiceCenters = async () => {
    try {
      const response = await serviceCenterService.getAllServiceCenters({ isActive: true });
      
      // Convert backend ServiceCenter to frontend ServiceCenter
      const centers: ServiceCenter[] = response.serviceCenters.map(center => {
        // Parse operatingHours - backend có thể trả về string hoặc object
        let parsedHours = null;
        if (center.operatingHours) {
          // Nếu đã là object (PostgreSQL JSONB tự parse)
          if (typeof center.operatingHours === 'object') {
            parsedHours = center.operatingHours;
          } 
          // Nếu là string, parse JSON
          else if (typeof center.operatingHours === 'string') {
            try {
              parsedHours = JSON.parse(center.operatingHours);
            } catch (e) {
              // Nếu parse lỗi, có thể là format đơn giản "08:00-18:00"
              // Tạo default schedule cho tất cả các ngày
              const timeRange = center.operatingHours;
              parsedHours = {
                monday: timeRange,
                tuesday: timeRange,
                wednesday: timeRange,
                thursday: timeRange,
                friday: timeRange,
                saturday: timeRange,
                sunday: 'Closed'
              };
            }
          }
        }
        
        const opHours = convertWorkingHoursToOperatingHours(parsedHours);
        return {
          id: center.id,
          name: center.name,
          address: center.address,
          phone: center.phone || '',
          email: center.email || '',
          operatingHours: opHours,
          services: center.services || [],
          isActive: center.isActive || true,
          rating: center.rating || 0,
          totalReviews: center.totalReviews || 0,
          coordinates: { lat: 0, lng: 0 } // Backend chưa có coordinates
        };
      });
      setServiceCenters(centers);
    } catch (err) {
      console.error('Error loading service centers:', err);
      setServiceCenters([]);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const packages = await servicePackageService.getAllServicePackages();
      // Convert backend ServicePackage to frontend ServiceType
      const types: ServiceType[] = packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.price,
        estimatedDuration: pkg.durationMinutes,
        category: ServiceCategory.REGULAR_MAINTENANCE, // Default category
        isActive: pkg.isActive
      }));
      setServiceTypes(types);
    } catch (err) {
      console.error('Error loading service types:', err);
      setServiceTypes([]);
    }
  };

  // Helper function to convert workingHours to operatingHours format
  const convertWorkingHoursToOperatingHours = (workingHours?: any) => {
    if (!workingHours) {
      return [];
    }
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.map((day, index) => {
      const hours = workingHours[day];
      
      if (hours && hours !== 'Closed') {
        const [openTime, closeTime] = hours.split('-').map((t: string) => t.trim());
        return {
          dayOfWeek: index,
          openTime: openTime || '08:00',
          closeTime: closeTime || '18:00',
          isOpen: true
        };
      }
      return {
        dayOfWeek: index,
        openTime: '08:00',
        closeTime: '18:00',
        isOpen: false
      };
    });
  };

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setVehicles([]);
    }
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
    if (!selectedVehicle || selectedServices.length === 0 || !formData.scheduledDate || !formData.scheduledTime || !customerId || !selectedCenter) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const scheduledDateTime = `${formData.scheduledDate}T${formData.scheduledTime}:00`;
      
      const createRequest = {
        customerId: customerId,
        vehicleId: selectedVehicle.id,
        serviceCenterId: selectedCenter.id,
        servicePackageId: selectedServices[0].id,
        appointmentDate: scheduledDateTime,
        notes: formData.notes || ''
      };

      const appointment = await appointmentService.createAppointment(createRequest);

      if (onBookingComplete) {
        onBookingComplete(appointment.id);
      } else {
        navigate('/appointments/success', { state: { appointmentId: appointment.id } });
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
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
            {serviceCenters.length === 0 ? (
              <div className="empty-state">
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  ⚠️ Chức năng đặt lịch đang được phát triển.<br/>
                  Vui lòng quay lại sau hoặc liên hệ hotline để được hỗ trợ.
                </p>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* Step 2: Select Services */}
        {step === 2 && (
          <div className="step-content">
            <h2>Chọn dịch vụ</h2>
            <div className="selected-center-info">
              <h3>Trung tâm đã chọn: {selectedCenter?.name}</h3>
            </div>
            {serviceTypes.length === 0 ? (
              <div className="empty-state">
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  ⚠️ Không có dịch vụ nào khả dụng.<br/>
                  Vui lòng liên hệ trung tâm để biết thêm chi tiết.
                </p>
              </div>
            ) : (
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
            )}
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
            {vehicles.length === 0 ? (
              <div className="empty-state">
                <p style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  ⚠️ Bạn chưa có xe nào trong hệ thống.<br/>
                  Vui lòng thêm xe trước khi đặt lịch dịch vụ.
                </p>
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <MDButton
                    variant="filled"
                    onClick={() => navigate('/customer/vehicles')}
                  >
                    Đi tới quản lý xe
                  </MDButton>
                </div>
              </div>
            ) : (
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
                      <p><strong>Màu sắc:</strong> {vehicle.color || 'N/A'}</p>
                      <p><strong>Số km đã đi:</strong> {vehicle.mileage ? vehicle.mileage.toLocaleString() : 'N/A'}</p>
                      <p><strong>Dung lượng pin:</strong> {vehicle.batteryCapacity || 'N/A'} kWh</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

              {formData.scheduledDate && (
                availableTimeSlots.length > 0 ? (
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
                ) : (
                  <div className="no-slots-message" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    ⚠️ Trung tâm không mở cửa vào ngày này. Vui lòng chọn ngày khác.
                  </div>
                )
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