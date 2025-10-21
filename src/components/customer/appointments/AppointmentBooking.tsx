import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceCenter, ServiceType, Vehicle, AppointmentFormData, Priority } from '../../../types';
import { MDButton } from '../../ui';
import './AppointmentBooking.css';
import serviceCenterService from '../../../services/serviceCenterService';
import servicePackageService from '../../../services/servicePackageService';
import vehicleService from '../../../services/vehicleService';

interface AppointmentBookingProps {
  onBookingComplete?: (appointmentId: string) => void;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({
  onBookingComplete
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAuth();

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

  const loadServiceCenters = async () => {
    try {
      const response = await serviceCenterService.getAllServiceCenters();
      setServiceCenters(response.serviceCenters as any);
    } catch (error) {
      console.error('Failed to load service centers:', error);
      setServiceCenters([]);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const packages = await servicePackageService.getAllServicePackages();
      setServiceTypes(packages as any);
    } catch (error) {
      console.error('Failed to load service types:', error);
      setServiceTypes([]);
    }
  };

  const loadVehicles = async () => {
    try {
      const vehiclesList = await vehicleService.getMyVehicles();
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
      setVehicles([]);
    }
  };

  const generateTimeSlots = (date: string, center: ServiceCenter) => {
    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    // Check if operatingHours exists and is an array
    if (!center.operatingHours || !Array.isArray(center.operatingHours)) {
      // Default time slots if no operating hours defined
      const slots: string[] = [];
      for (let hour = 8; hour < 18; hour++) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
      return slots;
    }
    
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
      // Chuẩn bị dữ liệu gửi lên API
      if (!selectedCenter || !selectedVehicle || selectedServices.length === 0) {
        alert('Vui lòng chọn đầy đủ thông tin!');
        setLoading(false);
        return;
      }
      const appointmentData = {
        customerId: state?.user?.id,
        vehicleId: selectedVehicle.id,
        serviceCenterId: selectedCenter.id,
        servicePackageId: selectedServices[0].id, // Nếu nhiều dịch vụ, cần sửa lại backend hoặc FE
        appointmentDate: `${formData.scheduledDate}T${formData.scheduledTime}:00`,
        notes: formData.notes
      };
      // Gọi API tạo lịch hẹn
      const appointmentService = (await import('../../../services/appointmentService')).default;
      const result = await appointmentService.createAppointment(appointmentData);
      const appointmentId = result.id;
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
                    <span>Dịch vụ: {center.services?.join(', ') || 'Đang cập nhật'}</span>
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