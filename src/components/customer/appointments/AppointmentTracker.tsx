import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceAppointment, AppointmentStatus, Vehicle, ServiceType, ServiceCenter } from '../../../types';
import { MDButton } from '../../ui';
import './AppointmentTracker.css';

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

  useEffect(() => {
    loadAppointments();
    loadVehicles();
    loadServices();
    loadCenters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (appointmentId && appointments.length > 0) {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (appointment) {
        setSelectedAppointment(appointment);
      }
    }
  }, [appointmentId, appointments]);

  const loadAppointments = async () => {
    if (!user?.id) return;

    try {
      // Mock appointments data
      const mockAppointments: ServiceAppointment[] = [
        {
          id: 'app1',
          customerId: user.id,
          vehicleId: 'vehicle1',
          serviceTypeId: 'service1',
          technicianId: 'tech1',
          scheduledDate: new Date('2024-10-01T09:00:00'),
          status: AppointmentStatus.CONFIRMED,
          priority: 'medium' as any,
          notes: 'Kiểm tra pin và thay dầu',
          estimatedCompletion: new Date('2024-10-01T11:00:00'),
          createdAt: new Date('2024-09-25'),
          updatedAt: new Date('2024-09-25')
        },
        {
          id: 'app2',
          customerId: user.id,
          vehicleId: 'vehicle2',
          serviceTypeId: 'service2',
          scheduledDate: new Date('2024-09-28T14:00:00'),
          status: AppointmentStatus.CONFIRMED,
          priority: 'high' as any,
          notes: 'Bảo dưỡng định kỳ 15000km',
          estimatedCompletion: new Date('2024-09-28T16:30:00'),
          createdAt: new Date('2024-09-20'),
          updatedAt: new Date('2024-09-28')
        },
        {
          id: 'app3',
          customerId: user.id,
          vehicleId: 'vehicle1',
          serviceTypeId: 'service3',
          scheduledDate: new Date('2024-09-15T10:00:00'),
          status: AppointmentStatus.CONFIRMED,
          priority: 'low' as any,
          notes: 'Cập nhật phần mềm',
          estimatedCompletion: new Date('2024-09-15T10:30:00'),
          createdAt: new Date('2024-09-10'),
          updatedAt: new Date('2024-09-15')
        }
      ];

      setAppointments(mockAppointments);
      setLoading(false);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
    }
  };

  const loadVehicles = () => {
    // Mock vehicles
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

  const loadServices = () => {
    // Mock services
    const mockServices: ServiceType[] = [
      {
        id: 'service1',
        name: 'Bảo dưỡng định kỳ',
        description: 'Kiểm tra và bảo dưỡng toàn diện xe điện',
        basePrice: 500000,
        estimatedDuration: 120,
        category: 'regular_maintenance' as any,
        isActive: true
      },
      {
        id: 'service2',
        name: 'Kiểm tra pin',
        description: 'Kiểm tra tình trạng và hiệu suất pin xe điện',
        basePrice: 300000,
        estimatedDuration: 60,
        category: 'battery_service' as any,
        isActive: true
      },
      {
        id: 'service3',
        name: 'Cập nhật phần mềm',
        description: 'Cập nhật firmware và phần mềm hệ thống',
        basePrice: 100000,
        estimatedDuration: 30,
        category: 'software_update' as any,
        isActive: true
      }
    ];
    setServices(mockServices);
  };

  const loadCenters = () => {
    // Mock centers
    const mockCenters: ServiceCenter[] = [
      {
        id: 'center1',
        name: 'VinFast Hà Nội',
        address: 'Số 123, đường Láng, phường Đống Đa, thành phố Hà Nội',
        phone: '0243-123-4567',
        email: 'hanoi@vinfast.vn',
        operatingHours: [],
        services: ['maintenance', 'repair'],
        isActive: true,
        rating: 4.8,
        totalReviews: 245
      }
    ];
    setCenters(mockCenters);
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

  const getProgressPercentage = (status: AppointmentStatus) => {
    const progressMap = {
      [AppointmentStatus.PENDING]: 25,
      [AppointmentStatus.CONFIRMED]: 50,
      [AppointmentStatus.IN_PROGRESS]: 75,
      [AppointmentStatus.COMPLETED]: 100,
      [AppointmentStatus.CANCELLED]: 0,
      [AppointmentStatus.NO_SHOW]: 0
    };
    return progressMap[status] || 0;
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
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
    const progress = getProgressPercentage(appointment.status);
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