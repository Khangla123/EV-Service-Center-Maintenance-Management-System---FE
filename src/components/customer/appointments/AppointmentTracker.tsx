import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceAppointment, AppointmentStatus, Vehicle, ServiceType, ServiceCenter } from '../../../types';
import { MDButton } from '../../ui';
import './AppointmentTracker.css';
import appointmentService from '../../../services/appointmentService';
import vehicleService from '../../../services/vehicleService';
import servicePackageService from '../../../services/servicePackageService';
import serviceCenterService from '../../../services/serviceCenterService';

interface AppointmentTrackerProps {
  appointmentId?: string;
  onStatusChange?: (status: AppointmentStatus) => void;
}

const AppointmentTracker: React.FC<AppointmentTrackerProps> = ({
  appointmentId,
  onStatusChange
}) => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;

  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<ServiceAppointment | null>(null);
  const [customerId, setCustomerId] = useState<string>('');

  useEffect(() => {
    loadCustomerProfile();
    loadVehicles();
    loadServices();
    loadCenters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (customerId) {
      loadAppointments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  useEffect(() => {
    if (appointmentId && appointments.length > 0) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
      }
    }
  }, [appointmentId, appointments]);

  const loadCustomerProfile = async () => {
    try {
      const customerService = (await import('../../../services/customerService')).default;
      const profile = await customerService.getMyProfile();
      console.log('Customer profile loaded:', profile);
      setCustomerId(profile.id);
    } catch (error: any) {
      console.error('Failed to load customer profile:', error);
    }
  };

  const loadAppointments = async () => {
    if (!customerId) return;

    try {
      setLoading(true);
      console.log('Loading appointments for customer:', customerId);
      const response = await appointmentService.getMyAppointments({ customerId });
      console.log('Appointments loaded:', response);
      setAppointments(response.appointments as any);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const vehiclesList = await vehicleService.getMyVehicles();
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    }
  };

  const loadServices = async () => {
    try {
      const servicesList = await servicePackageService.getAllServicePackages();
      setServices(servicesList as any);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
    }
  };

  const loadCenters = async () => {
    try {
      const response = await serviceCenterService.getAllServiceCenters();
      setCenters(response.serviceCenters as any);
    } catch (error) {
      console.error('Error loading centers:', error);
      setCenters([]);
    }
  };

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getServiceInfo = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  const getCenterInfo = (centerId: string) => {
    return centers.find(c => c.id === centerId);
  };

  const getStatusText = (status: AppointmentStatus) => {
    const statusMap = {
      [AppointmentStatus.PENDING]: 'Chờ xác nhận',
      [AppointmentStatus.CONFIRMED]: 'Đã xác nhận',
      [AppointmentStatus.IN_PROGRESS]: 'Đang thực hiện',
      [AppointmentStatus.COMPLETED]: 'Hoàn thành',
      [AppointmentStatus.CANCELLED]: 'Đã hủy',
      [AppointmentStatus.NO_SHOW]: 'Không đến'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colorMap = {
      [AppointmentStatus.PENDING]: 'warning',
      [AppointmentStatus.CONFIRMED]: 'info',
      [AppointmentStatus.IN_PROGRESS]: 'primary',
      [AppointmentStatus.COMPLETED]: 'success',
      [AppointmentStatus.CANCELLED]: 'error',
      [AppointmentStatus.NO_SHOW]: 'error'
    };
    return colorMap[status] || 'default';
  };

  const getProgressPercentage = (appointment: ServiceAppointment) => {
    const { status, scheduledDate, estimatedCompletion, actualCompletion } = appointment;
    
    // Nếu đã hoàn thành hoặc hủy
    if (status === AppointmentStatus.COMPLETED) return 100;
    if (status === AppointmentStatus.CANCELLED || status === AppointmentStatus.NO_SHOW) return 0;
    
    // Nếu chưa bắt đầu
    if (status === AppointmentStatus.PENDING) return 25;
    if (status === AppointmentStatus.CONFIRMED) return 50;
    
    // Nếu đang thực hiện và có thời gian dự kiến
    if (status === AppointmentStatus.IN_PROGRESS && scheduledDate && estimatedCompletion) {
      const now = new Date().getTime();
      const start = new Date(scheduledDate).getTime();
      const end = new Date(estimatedCompletion).getTime();
      
      if (now >= end) return 95; // Gần hoàn thành
      if (now <= start) return 50; // Chưa đến giờ
      
      // Tính % dựa trên thời gian đã qua
      const elapsed = now - start;
      const total = end - start;
      const progress = Math.floor((elapsed / total) * 45) + 50; // 50% -> 95%
      
      return Math.min(95, Math.max(50, progress));
    }
    
    // Mặc định cho IN_PROGRESS không có thời gian
    return 75;
  };

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return 'Chưa xác định';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Không hợp lệ';
      
      return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch {
      return 'Không hợp lệ';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn hủy lịch dịch vụ này?')) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setAppointments(prev => 
          prev.map(app => 
            app.id === appointmentId 
              ? { ...app, status: AppointmentStatus.CANCELLED, updatedAt: new Date() }
              : app
          )
        );
        
        if (onStatusChange) {
          onStatusChange(AppointmentStatus.CANCELLED);
        }
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('Có lỗi xảy ra khi hủy lịch dịch vụ này');
      }
    }
  };

  const handleReschedule = (appointmentId: string) => {
    // Navigate to reschedule page or open modal
    console.log('Reschedule appointment:', appointmentId);
  };

  if (loading) {
    return (
      <div className="appointment-tracker loading">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="appointment-tracker">
      <div className="tracker-header">
        <h2>Theo dõi lịch dịch vụ</h2>
        {!appointmentId && (
          <MDButton variant="filled" onClick={() => navigate('/customer/booking')}>
            Đặt lịch dịch vụ
          </MDButton>
        )}
      </div>

      {selectedAppointment ? (
        // Single appointment view
        <div className="appointment-detail">
          <AppointmentCard
            appointment={selectedAppointment}
            vehicle={getVehicleInfo(selectedAppointment.vehicleId)}
            service={getServiceInfo(selectedAppointment.serviceTypeId)}
            center={getCenterInfo('center1')}
            onCancel={handleCancelAppointment}
            onReschedule={handleReschedule}
            detailed={true}
          />
        </div>
      ) : (
        // All appointments list
        <div className="appointments-list">
          {appointments.length === 0 ? (
            <div className="no-appointments">
              <p>Bạn chưa có lịch dịch vụ nào.</p>
              <MDButton variant="filled" onClick={() => navigate('/customer/booking')}>
                Đặt lịch ngay
              </MDButton>
            </div>
          ) : (
            <div className="appointments-grid">
              {appointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  vehicle={getVehicleInfo(appointment.vehicleId)}
                  service={getServiceInfo(appointment.serviceTypeId)}
                  center={getCenterInfo('center1')}
                  onCancel={handleCancelAppointment}
                  onReschedule={handleReschedule}
                  detailed={false}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Appointment Card Component
  function AppointmentCard({
    appointment,
    vehicle,
    service,
    center,
    onCancel,
    onReschedule,
    detailed = false
  }: {
    appointment: ServiceAppointment;
    vehicle?: Vehicle;
    service?: ServiceType;
    center?: ServiceCenter;
    onCancel: (id: string) => void;
    onReschedule: (id: string) => void;
    detailed?: boolean;
  }) {
    const progress = getProgressPercentage(appointment);
    const statusColor = getStatusColor(appointment.status);
    const canCancel = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status);
    const canReschedule = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED].includes(appointment.status);

    return (
      <div className={`appointment-card ${detailed ? 'detailed' : ''}`}>
        <div className="card-header">
          <div className="appointment-id">
            <span>Mã lịch dịch vụ: {appointment.id}</span>
          </div>
          <div className={`status-badge ${statusColor}`}>
            {getStatusText(appointment.status)}
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">Tiến độ thực hiện</span>
            {appointment.status === AppointmentStatus.IN_PROGRESS && (
              <span className="progress-percentage">{progress}%</span>
            )}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-steps">
            <div className={`step ${progress >= 25 ? 'completed' : ''}`}>
              <span>Đặt lịch</span>
            </div>
            <div className={`step ${progress >= 50 ? 'completed' : ''}`}>
              <span>Xác nhận</span>
            </div>
            <div className={`step ${progress >= 75 ? 'completed' : ''}`}>
              <span>Thực hiện</span>
            </div>
            <div className={`step ${progress >= 100 ? 'completed' : ''}`}>
              <span>Hoàn thành</span>
            </div>
          </div>
        </div>

        <div className="appointment-info">
          <div className="info-row">
            <strong>Xe:</strong> {vehicle?.make} {vehicle?.model} - {vehicle?.licensePlate}
          </div>
          <div className="info-row">
            <strong>Dịch vụ:</strong> {service?.name}
          </div>
          <div className="info-row">
            <strong>Thời gian:</strong> {formatDateTime(appointment.scheduledDate)}
          </div>
          {appointment.status === AppointmentStatus.IN_PROGRESS && appointment.estimatedCompletion && (
            <div className="info-row highlight">
              <strong>Dự kiến hoàn thành:</strong> {formatDateTime(appointment.estimatedCompletion)}
            </div>
          )}
          {detailed && (
            <>
              <div className="info-row">
                <strong>Trung tâm:</strong> {center?.name}
              </div>
              <div className="info-row">
                <strong>Địa chỉ:</strong> {center?.address}
              </div>
              <div className="info-row">
                <strong>Chi phí dự kiến:</strong> {service ? formatCurrency(service.basePrice) : 'Chưa xác định'}
              </div>
              {appointment.notes && (
                <div className="info-row">
                  <strong>Ghi chú:</strong> {appointment.notes}
                </div>
              )}
              {appointment.estimatedCompletion && (
                <div className="info-row">
                  <strong>Dự kiến hoàn thành:</strong> {formatDateTime(appointment.estimatedCompletion)}
                </div>
              )}
              {appointment.actualCompletion && (
                <div className="info-row">
                  <strong>Thời gian hoàn thành:</strong> {formatDateTime(appointment.actualCompletion)}
                </div>
              )}
            </>
          )}
        </div>

        {(canCancel || canReschedule) && (
          <div className="card-actions">
            {canReschedule && (
              <MDButton
                variant="outlined"
                onClick={() => onReschedule(appointment.id)}
                size="small"
              >
                Đổi lịch
              </MDButton>
            )}
            {canCancel && (
              <MDButton
                variant="text"
                onClick={() => onCancel(appointment.id)}
                size="small"
                className="cancel-btn"
              >
                Hủy lịch
              </MDButton>
            )}
          </div>
        )}
      </div>
    );
  }
};

export default AppointmentTracker;