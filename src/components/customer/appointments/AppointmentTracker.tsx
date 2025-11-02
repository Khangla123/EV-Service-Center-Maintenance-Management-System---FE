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

// Utility function to generate short display code from UUID
const generateDisplayCode = (id: string, date?: Date): string => {
  if (!id) return 'N/A';
  
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
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'progress'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
      [AppointmentStatus.ASSIGNED]: 'Đã phân công',
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
      [AppointmentStatus.ASSIGNED]: 'warning',
      [AppointmentStatus.IN_PROGRESS]: 'primary',
      [AppointmentStatus.COMPLETED]: 'success',
      [AppointmentStatus.CANCELLED]: 'error',
      [AppointmentStatus.NO_SHOW]: 'error'
    };
    return colorMap[status] || 'default';
  };

  const getProgressPercentage = (appointment: ServiceAppointment) => {
    const { status, scheduledDate, estimatedCompletion, actualCompletion } = appointment;
    
    // Workflow: PENDING (0%) -> CONFIRMED (33%) -> IN_PROGRESS (66%) -> COMPLETED (100%)
    // PENDING: Đã đặt lịch, chờ staff xác nhận
    // CONFIRMED: Staff đã xác nhận, chờ đến ngày hẹn
    // IN_PROGRESS: Đang thực hiện dịch vụ
    // COMPLETED: Hoàn thành
    
    // Normalize status to uppercase for comparison
    const normalizedStatus = status?.toString().toUpperCase();
    
    if (normalizedStatus === 'COMPLETED') return 100;
    if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'NO_SHOW') return 0;
    
    // PENDING: Đang ở step 1 (Đặt lịch) - hiển thị active nhưng chưa complete
    if (normalizedStatus === 'PENDING') return 0;
    
    // CONFIRMED: Hoàn thành step 1, đang ở step 2 (Xác nhận)
    if (normalizedStatus === 'CONFIRMED') return 33;
    
    // IN_PROGRESS: Hoàn thành step 2, đang ở step 3 (Thực hiện)
    if (normalizedStatus === 'IN_PROGRESS') {
      // Nếu có thời gian dự kiến, tính progress động
      if (scheduledDate && estimatedCompletion) {
        const now = new Date().getTime();
        const start = new Date(scheduledDate).getTime();
        const end = new Date(estimatedCompletion).getTime();
        
        if (now >= end) return 90; // Gần hoàn thành
        if (now <= start) return 66; // Mới bắt đầu
        
        // Tính % dựa trên thời gian đã qua (66% -> 90%)
        const elapsed = now - start;
        const total = end - start;
        const progress = Math.floor((elapsed / total) * 24) + 66;
        
        return Math.min(90, Math.max(66, progress));
      }
      return 66;
    }
    
    return 0;
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

  // Filter and sort appointments
  const getFilteredAndSortedAppointments = () => {
    let filtered = [...appointments];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status?.toString().toUpperCase() === filterStatus.toUpperCase());
    }

    // Sort appointments
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.appointmentDate || 0).getTime();
        const dateB = new Date(b.appointmentDate || 0).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Sort by progress
        const progressA = getProgressPercentage(a);
        const progressB = getProgressPercentage(b);
        return sortOrder === 'asc' ? progressA - progressB : progressB - progressA;
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="appointment-tracker loading">
        <div className="loading-spinner">Đang tải...</div>
      </div>
    );
  }

  const filteredAppointments = getFilteredAndSortedAppointments();

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

      {/* Filter Section */}
      {!appointmentId && appointments.length > 0 && (
        <div className="filter-section">
          <div className="filter-controls">
            <div className="filter-group">
              <label>Trạng thái:</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">Tất cả</option>
                <option value="PENDING">Đặt lịch</option>
                <option value="CONFIRMED">Xác nhận</option>
                <option value="IN_PROGRESS">Thực hiện</option>
                <option value="COMPLETED">Hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Sắp xếp theo:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as 'date' | 'progress')}
                className="filter-select"
              >
                <option value="date">Ngày tháng</option>
                <option value="progress">Tiến trình</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Thứ tự:</label>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="filter-select"
              >
                <option value="desc">{sortBy === 'date' ? 'Mới nhất' : 'Cao nhất'}</option>
                <option value="asc">{sortBy === 'date' ? 'Cũ nhất' : 'Thấp nhất'}</option>
              </select>
            </div>

            <div className="filter-results">
              <span>Hiển thị {filteredAppointments.length} / {appointments.length} lịch hẹn</span>
            </div>
          </div>
        </div>
      )}

      {selectedAppointment ? (
        // Single appointment view
        <div className="appointment-detail">
          <AppointmentCard
            appointment={selectedAppointment}
            vehicle={getVehicleInfo(selectedAppointment.vehicleId)}
            service={getServiceInfo(selectedAppointment.servicePackageId)}
            center={getCenterInfo(selectedAppointment.serviceCenterId || 'center1')}
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
          ) : filteredAppointments.length === 0 ? (
            <div className="no-appointments">
              <p>Không tìm thấy lịch hẹn phù hợp với bộ lọc.</p>
              <MDButton variant="outlined" onClick={() => setFilterStatus('all')}>
                Xóa bộ lọc
              </MDButton>
            </div>
          ) : (
            <div className="appointments-grid">
              {filteredAppointments.map(appointment => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                  vehicle={getVehicleInfo(appointment.vehicleId)}
                  service={getServiceInfo(appointment.servicePackageId)}
                  center={getCenterInfo(appointment.serviceCenterId || 'center1')}
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

    // Debug log
    console.log('Appointment:', {
      id: appointment.id.substring(0, 8),
      status: appointment.status,
      progress,
      isPending: appointment.status === AppointmentStatus.PENDING,
      isConfirmed: appointment.status === AppointmentStatus.CONFIRMED,
      isInProgress: appointment.status === AppointmentStatus.IN_PROGRESS,
      isCompleted: appointment.status === AppointmentStatus.COMPLETED
    });

    return (
      <div className={`appointment-card ${detailed ? 'detailed' : ''}`}>
        <div className="card-header">
          <div className="appointment-id" title={`UUID đầy đủ: ${appointment.id}`}>
            <span>Mã lịch dịch vụ: {generateDisplayCode(appointment.id, appointment.appointmentDate)}</span>
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
            {/* Step 1: Đặt lịch - active khi PENDING (0-32%), completed khi >= CONFIRMED (33%) */}
            <div className={`step ${appointment.status?.toString().toUpperCase() === 'PENDING' ? 'active' : ''} ${progress >= 33 ? 'completed' : ''}`}>
              <span>Đặt lịch</span>
            </div>
            {/* Step 2: Xác nhận - active khi CONFIRMED (33-65%), completed khi >= IN_PROGRESS (66%) */}
            <div className={`step ${appointment.status?.toString().toUpperCase() === 'CONFIRMED' ? 'active' : ''} ${progress >= 66 ? 'completed' : ''}`}>
              <span>Xác nhận</span>
            </div>
            {/* Step 3: Thực hiện - active khi IN_PROGRESS (66-99%), completed khi COMPLETED (100%) */}
            <div className={`step ${appointment.status?.toString().toUpperCase() === 'IN_PROGRESS' ? 'active' : ''} ${progress >= 100 ? 'completed' : ''}`}>
              <span>Thực hiện</span>
            </div>
            {/* Step 4: Hoàn thành - completed khi COMPLETED */}
            <div className={`step ${appointment.status?.toString().toUpperCase() === 'COMPLETED' ? 'completed active' : ''}`}>
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
            <strong>Địa điểm:</strong> {center?.name || 'Chưa xác định'}
          </div>
          <div className="info-row">
            <strong>Thời gian:</strong> {formatDateTime(appointment.appointmentDate)}
          </div>
          {appointment.status === AppointmentStatus.IN_PROGRESS && appointment.estimatedCompletion && (
            <div className="info-row highlight">
              <strong>Dự kiến hoàn thành:</strong> {formatDateTime(appointment.estimatedCompletion)}
            </div>
          )}
          {detailed && (
            <>
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