import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Car, Check, X, Edit, Filter, Plus, UserPlus } from 'lucide-react';
import { MDButton } from '../../ui';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import staffService, { Staff } from '../../../services/staffService';
import serviceOrderService from '../../../services/serviceOrderService';
import customerService, { Customer } from '../../../services/customerService';
import vehicleService from '../../../services/vehicleService';
import serviceCenterService, { ServiceCenter } from '../../../services/serviceCenterService';
import servicePackageService, { ServicePackage } from '../../../services/servicePackageService';
import { Vehicle } from '../../../types';
import './AppointmentManagement.css';

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

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'all' | 'week' | 'month'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [error, setError] = useState<string | null>(null);
  const [technicians, setTechnicians] = useState<Staff[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [serviceCenters, setServiceCenters] = useState<ServiceCenter[]>([]);
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);

  const [phoneSearch, setPhoneSearch] = useState<string>('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [newAppointment, setNewAppointment] = useState({
    customerId: '',
    vehicleId: '',
    serviceCenterId: '',
    servicePackageId: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: ''
  });

  useEffect(() => {
    console.log('🚀 AppointmentManagement Component Mounted - NEW CODE LOADED!');
    console.log('📅 Initial dateFilter:', dateFilter);
    loadAppointments();
    loadTechnicians();
  }, []);

  const loadTechnicians = async () => {
    try {
      // Thử dùng API getAvailableStaff trước
      let allStaff: Staff[] = [];
      try {
        allStaff = await staffService.getAvailableStaff();
        console.log('Available staff loaded:', allStaff);
      } catch (availErr) {
        // Nếu không có quyền, thử getAllStaff
        console.log('Trying getAllStaff instead...');
        allStaff = await staffService.getAllStaff();
        console.log('All staff loaded:', allStaff);
      }
      
      // Lọc staff có thể làm kỹ thuật viên
      console.log('[STAFF PAGE] Total staff from API:', allStaff.length);
      
      let techs = allStaff.filter(staff => {
        const hasRole = staff.role && staff.role.toLowerCase().includes('tech');
        const hasSpecialization = staff.specialization && staff.specialization.trim() !== '';
        const isActive = staff.isActive !== false;
        const isAvailable = staff.isAvailable !== false;
        
        return isActive && isAvailable && (hasRole || hasSpecialization);
      });
      
      console.log('[STAFF PAGE] Filtered technicians:', techs);
      console.log('[STAFF PAGE] Technician count:', techs.length);
      
      // Log để debug: kiểm tra xem có userId không
      if (techs.length > 0) {
        console.log('[STAFF PAGE] Sample technician data:', {
          id: techs[0].id,
          userId: techs[0].userId,
          fullName: techs[0].fullName,
          hasUserId: !!techs[0].userId
        });
      }
      
      // Nếu không có technician nào, hiển thị tất cả staff available
      if (techs.length === 0 && allStaff.length > 0) {
        console.warn('[STAFF PAGE] No technicians found, showing all available staff');
        techs = allStaff.filter(s => s.isAvailable !== false && s.isActive !== false);
      }
      
      setTechnicians(techs);
    } catch (err) {
      console.error('Error loading technicians:', err);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📡 [loadAppointments] Fetching appointments...');
      const response = await appointmentService.getAllAppointments();
      console.log('📡 [loadAppointments] Response:', response);
      console.log('📡 [loadAppointments] Appointments count:', response.appointments?.length);
      console.log('📡 [loadAppointments] Status breakdown:', 
        response.appointments?.reduce((acc: any, apt: any) => {
          acc[apt.status] = (acc[apt.status] || 0) + 1;
          return acc;
        }, {})
      );
      setAppointments(response.appointments || []);
    } catch (err) {
      setError('Không thể tải danh sách lịch hẹn');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (!apt.appointmentDate) return false;
    
    // Parse appointment date - backend trả về ISO string format: "2025-10-30T15:00:00"
    const aptDate = new Date(apt.appointmentDate);
    const now = new Date();
    
    // Validate date
    if (isNaN(aptDate.getTime())) return false;
    
    // DEBUG: Log để kiểm tra
    if (dateFilter === 'today') {
      console.log('🔍 Filter TODAY - Checking apt:', {
        aptDateString: apt.appointmentDate,
        aptDate: aptDate.toISOString(),
        aptDay: aptDate.getDate(),
        aptMonth: aptDate.getMonth() + 1,
        aptYear: aptDate.getFullYear(),
        nowDate: now.toISOString(),
        nowDay: now.getDate(),
        nowMonth: now.getMonth() + 1,
        nowYear: now.getFullYear()
      });
    }
    
    // Date filter - So sánh ngày, tháng, năm
    if (dateFilter === 'today') {
      const isToday = 
        aptDate.getDate() === now.getDate() &&
        aptDate.getMonth() === now.getMonth() &&
        aptDate.getFullYear() === now.getFullYear();
      
      console.log(`✅ Is today? ${isToday} for ${apt.id.substring(0, 8)}`);
      if (!isToday) return false;
    } else if (dateFilter === 'week') {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Chủ nhật đầu tuần
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      if (aptDate < weekStart || aptDate > weekEnd) return false;
    } else if (dateFilter === 'month') {
      if (
        aptDate.getMonth() !== now.getMonth() || 
        aptDate.getFullYear() !== now.getFullYear()
      ) return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    
    // Time filter - Dựa trên giờ thực của appointment
    if (timeFilter !== 'all') {
      const hour = aptDate.getHours();
      if (timeFilter === 'morning' && (hour < 6 || hour >= 12)) return false;
      if (timeFilter === 'afternoon' && (hour < 12 || hour >= 18)) return false;
      if (timeFilter === 'evening' && (hour < 18 || hour >= 24)) return false;
    }
    
    return true;
  }).sort((a, b) => {
    // Sắp xếp theo giờ (sớm nhất lên đầu)
    const dateA = new Date(a.appointmentDate).getTime();
    const dateB = new Date(b.appointmentDate).getTime();
    return dateA - dateB;
  });

  const getStatusColor = (status: Appointment['status']) => {
    const colors: Record<Appointment['status'], string> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      ASSIGNED: 'warning',
      IN_PROGRESS: 'primary',
      COMPLETED: 'success',
      CANCELLED: 'error'
    };
    return colors[status];
  };

  const getStatusLabel = (status: Appointment['status']) => {
    const labels: Record<Appointment['status'], string> = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      ASSIGNED: 'Đã phân công',
      IN_PROGRESS: 'Đang xử lý',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy'
    };
    return labels[status];
  };

  const confirmAppointment = async (id: string) => {
    try {
      await appointmentService.updateAppointment(id, { status: 'CONFIRMED' });
      await loadAppointments();
    } catch (err) {
      console.error('Error confirming appointment:', err);
    }
  };

  const cancelAppointment = async (id: string) => {
    try {
      await appointmentService.cancelAppointment(id);
      await loadAppointments();
    } catch (err) {
      console.error('Error cancelling appointment:', err);
    }
  };

  const openAssignModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedTechnicianId(appointment.technicianId || '');
    setShowAssignModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleAssignTechnician = async () => {
    if (!selectedAppointment || !selectedTechnicianId) {
      alert('Vui lòng chọn kỹ thuật viên!');
      return;
    }
    
    try {
      console.log('🔍 DEBUG FIND TECHNICIAN:');
      console.log('   selectedTechnicianId:', selectedTechnicianId);
      console.log('   selectedTechnicianId type:', typeof selectedTechnicianId);
      console.log('   technicians array length:', technicians.length);
      console.log('   technicians array:', technicians);
      console.log('   technicians IDs:', technicians.map(t => ({ id: t.id, type: typeof t.id })));
      
      const selectedTech = technicians.find(t => t.id === selectedTechnicianId);
      
      // Backend cần userId chứ không phải staff.id
      const technicianUserId = selectedTech?.userId || selectedTech?.id;
      
      if (!technicianUserId) {
        alert('Không tìm thấy User ID của kỹ thuật viên');
        return;
      }
      
      console.log('📋 Phân công kỹ thuật viên:', {
        appointmentId: selectedAppointment.id,
        staffId: selectedTechnicianId,
        userId: technicianUserId,
        technicianName: selectedTech?.fullName,
        currentStatus: selectedAppointment.status,
        note: 'Backend expects userId (from users table), not staffId'
      });
      
      if (!selectedTech?.userId) {
        alert('⚠️ Kỹ thuật viên này thiếu thông tin userId. Vui lòng kiểm tra lại dữ liệu!');
        console.error('Technician missing userId:', selectedTech);
        return;
      }
      
      // TẠO SERVICE ORDER VÀ PHÂN CÔNG TECHNICIAN (FLOW CHUẨN)
      // Backend endpoint: POST /service-orders/from-appointment/{appointmentId}/assign?technicianId=xxx
      // IMPORTANT: technicianId MUST be userId (from users table), NOT staffId
      // Flow: Appointment CONFIRMED → Phân công thợ → Tạo Service Order → Update appointment status = ASSIGNED
      console.log('🔧 Creating service order and assigning technician...');
      console.log('   → Sending userId to backend:', selectedTech.userId);
      await serviceOrderService.createServiceOrderFromAppointment(
        selectedAppointment.id,
        technicianUserId  // Dùng userId thay vì staff.id
      );
      
      console.log('✅ Service order created and technician assigned successfully');
      
      // Đóng modal trước khi reload
      setShowAssignModal(false);
      setSelectedAppointment(null);
      setSelectedTechnicianId('');
      
      // Reload danh sách appointments để cập nhật trạng thái
      console.log('🔄 Reloading appointments...');
      await loadAppointments();
      
      alert(`✅ Đã phân công kỹ thuật viên: ${selectedTech?.fullName}\n📋 Đã tạo phiếu dịch vụ thành công!`);
    } catch (err: any) {
      console.error('❌ Error assigning technician:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        fullError: err
      });
      
      // Phân tích lỗi để hiển thị thông báo phù hợp
      let errorMsg = 'Không thể phân công kỹ thuật viên. Vui lòng thử lại.';
      
      if (err?.response?.data) {
        const errorData = err.response.data;
        
        // Nếu có message từ backend
        if (errorData.message) {
          errorMsg = errorData.message;
        }
        
        // Nếu là lỗi SQL constraint
        if (errorData.message && errorData.message.includes('constraint')) {
          errorMsg = '❌ Lỗi cơ sở dữ liệu: Backend thiếu dữ liệu bắt buộc khi tạo service order.\n\n' +
                     'Vui lòng kiểm tra:\n' +
                     '- Appointment phải có đầy đủ thông tin (customer, vehicle, service package)\n' +
                     '- Technician phải có userId hợp lệ\n\n' +
                     'Chi tiết lỗi: ' + (errorData.message || 'Unknown error');
        }
        
        // Nếu là lỗi 400 Bad Request
        if (err.response.status === 400) {
          errorMsg = '❌ Dữ liệu không hợp lệ:\n' + (errorData.message || errorData.error || 'Vui lòng kiểm tra lại thông tin');
        }
        
        // Nếu là lỗi 404 Not Found
        if (err.response.status === 404) {
          errorMsg = '❌ Không tìm thấy dữ liệu:\n' + 
                     'Appointment hoặc Technician không tồn tại trong hệ thống.\n' +
                     (errorData.message || '');
        }
      }
      
      alert(`Lỗi: ${errorMsg}`);
    }
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await appointmentService.updateAppointment(selectedAppointment.id, {
        appointmentDate: selectedAppointment.appointmentDate instanceof Date 
          ? selectedAppointment.appointmentDate.toISOString() 
          : selectedAppointment.appointmentDate,
        status: selectedAppointment.status,
        notes: selectedAppointment.notes
      });
      await loadAppointments();
      setShowEditModal(false);
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Không thể cập nhật lịch hẹn. Vui lòng thử lại.');
    }
  };

  const loadFormData = async () => {
    try {
      console.log('Loading form data...');
      const customersData = await customerService.getAllCustomers();
      console.log('Customers response:', customersData);
      console.log('Customers array:', customersData.content);
      
      // Log first customer to see structure
      if (customersData.content && customersData.content.length > 0) {
        console.log('First customer structure:', customersData.content[0]);
        console.log('First customer keys:', Object.keys(customersData.content[0]));
      }
      
      setCustomers(customersData.content || []);

      const centersData = await serviceCenterService.getAllServiceCenters();
      console.log('Service centers loaded:', centersData.serviceCenters?.length);
      setServiceCenters(centersData.serviceCenters || []);

      const packagesData = await servicePackageService.getAllServicePackages();
      console.log('Service packages loaded:', packagesData?.length);
      setServicePackages(packagesData || []);
      
      console.log('Form data loaded successfully. Total customers:', customersData.content?.length);
    } catch (err) {
      console.error('Error loading form data:', err);
    }
  };

  const openCreateModal = async () => {
    setNewAppointment({
      customerId: '',
      vehicleId: '',
      serviceCenterId: '',
      servicePackageId: '',
      appointmentDate: '',
      appointmentTime: '',
      notes: ''
    });
    setCustomerVehicles([]);
    setPhoneSearch('');
    setSelectedCustomer(null);
    setFilteredCustomers([]);
    setShowCustomerDropdown(false);
    await loadFormData();
    setShowCreateModal(true);
  };

  const getCustomerName = (customer: Customer): string => {
    // Try fullName first (actual field from API)
    const fullName = (customer as any).fullName;
    if (fullName) {
      return fullName;
    }
    
    // Try firstName + lastName as fallback
    const firstName = (customer as any).firstName || (customer as any).first_name || '';
    const lastName = (customer as any).lastName || (customer as any).last_name || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    // Fallback to email or phone
    return customer.email || customer.phone || 'Khách hàng';
  };

  const handlePhoneSearch = (phone: string) => {
    setPhoneSearch(phone);
    console.log('Searching phone:', phone, 'Total customers:', customers.length);
    if (phone.trim().length >= 3) {
      const filtered = customers.filter(customer => {
        return customer.phone?.includes(phone.trim());
      });
      console.log(`Search results for "${phone}":`, filtered);
      if (filtered.length > 0) {
        console.log('First customer structure:', filtered[0]);
        console.log('First customer keys:', Object.keys(filtered[0]));
        console.log('Customer name would be:', getCustomerName(filtered[0]));
      }
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  };

  const handleSelectCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setPhoneSearch(customer.phone || '');
    setShowCustomerDropdown(false);
    await handleCustomerChange(customer.id);
  };

  const handleCustomerChange = async (customerId: string) => {
    setNewAppointment({ ...newAppointment, customerId, vehicleId: '' });
    if (customerId) {
      try {
        const vehiclesData = await vehicleService.getVehiclesByCustomerId(customerId);
        setCustomerVehicles(vehiclesData || []);
      } catch (err) {
        console.error('Error loading customer vehicles:', err);
        setCustomerVehicles([]);
      }
    } else {
      setCustomerVehicles([]);
    }
  };

  const handleCreateAppointment = async () => {
    try {
      if (!newAppointment.customerId || !newAppointment.vehicleId || 
          !newAppointment.serviceCenterId || !newAppointment.servicePackageId ||
          !newAppointment.appointmentDate || !newAppointment.appointmentTime) {
        alert('Vui lòng điền đầy đủ thông tin!');
        return;
      }

      const appointmentDateTime = new Date(`${newAppointment.appointmentDate}T${newAppointment.appointmentTime}:00`);

      await appointmentService.createAppointment({
        customerId: newAppointment.customerId,
        vehicleId: newAppointment.vehicleId,
        serviceCenterId: newAppointment.serviceCenterId,
        servicePackageId: newAppointment.servicePackageId,
        appointmentDate: appointmentDateTime.toISOString(),
        notes: newAppointment.notes
      });

      alert('Tạo lịch hẹn thành công!');
      setShowCreateModal(false);
      await loadAppointments();
    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Không thể tạo lịch hẹn. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="appointment-management loading">
        <div className="loading-spinner">Đang tải danh sách lịch hẹn...</div>
      </div>
    );
  }

  return (
    <div className="appointment-management">
      {/* Header Controls */}
      <div className="controls-bar">
        <div className="filters-container">
          {/* Date Filter */}
          <div className="filter-group">
            <label>Thời gian:</label>
            <div className="filter-tabs">
              <button
                className={`filter-tab ${dateFilter === 'today' ? 'active' : ''}`}
                onClick={() => setDateFilter('today')}
              >
                Hôm nay
              </button>
              <button
                className={`filter-tab ${dateFilter === 'week' ? 'active' : ''}`}
                onClick={() => setDateFilter('week')}
              >
                Tuần này
              </button>
              <button
                className={`filter-tab ${dateFilter === 'month' ? 'active' : ''}`}
                onClick={() => setDateFilter('month')}
              >
                Tháng này
              </button>
              <button
                className={`filter-tab ${dateFilter === 'all' ? 'active' : ''}`}
                onClick={() => setDateFilter('all')}
              >
                Toàn bộ
              </button>
            </div>
          </div>

          {/* Time Filter */}
          <div className="filter-group">
            <label>Giờ:</label>
            <select 
              className="filter-select"
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value as any)}
            >
              <option value="all">Cả ngày</option>
              <option value="morning">Sáng (6h-12h)</option>
              <option value="afternoon">Chiều (12h-18h)</option>
              <option value="evening">Tối (18h-24h)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select 
              className="filter-select"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tất cả</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="IN_PROGRESS">Đang thực hiện</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
        </div>

        <div className="action-buttons">
          <MDButton variant="filled" startIcon={<Plus />} onClick={openCreateModal}>
            Tạo lịch hẹn mới
          </MDButton>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="appointments-grid">
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className={`appointment-card ${appointment.status}`}>
            <div className="card-header">
              <div className="appointment-id" title={`UUID: ${appointment.id}`}>
                #{generateDisplayCode(appointment.id, appointment.appointmentDate)}
              </div>
              <span className={`status-badge ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
              </span>
            </div>

            <div className="card-body">
              <div className="customer-section">
                <div className="section-icon">
                  <User size={18} />
                </div>
                <div className="section-content">
                  <div className="customer-name">{appointment.customerName}</div>
                </div>
              </div>

              <div className="vehicle-section">
                <div className="section-icon">
                  <Car size={18} />
                </div>
                <div className="section-content">
                  <div className="vehicle-model">Trung tâm: {appointment.serviceCenterName}</div>
                </div>
              </div>

              <div className="schedule-section">
                <div className="schedule-item">
                  <CalendarIcon size={16} />
                  <span>{new Intl.DateTimeFormat('vi-VN').format(new Date(appointment.appointmentDate))}</span>
                </div>
                <div className="schedule-item">
                  <Clock size={16} />
                  <span>{new Date(appointment.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="service-type">
                <strong>Gói dịch vụ:</strong> {appointment.servicePackageName}
              </div>

              {appointment.technicianName && (
                <div className="technician-info">
                  <UserPlus size={16} />
                  <span><strong>KTV:</strong> {appointment.technicianName}</span>
                </div>
              )}

              {appointment.notes && (
                <div className="appointment-notes">
                  <strong>Ghi chú:</strong> {appointment.notes}
                </div>
              )}
            </div>

            <div className="card-footer">
              {appointment.status === 'PENDING' && (
                <>
                  <MDButton
                    variant="filled"
                    size="small"
                    startIcon={<Check />}
                    onClick={() => confirmAppointment(appointment.id)}
                  >
                    Xác nhận
                  </MDButton>
                  <MDButton
                    variant="outlined"
                    size="small"
                    startIcon={<X />}
                    onClick={() => cancelAppointment(appointment.id)}
                  >
                    Từ chối
                  </MDButton>
                </>
              )}
              {(appointment.status === 'CONFIRMED' || appointment.status === 'IN_PROGRESS') && (
                <>
                  <MDButton 
                    variant="outlined" 
                    size="small" 
                    startIcon={<Edit />}
                    onClick={() => openEditModal(appointment)}
                  >
                    Chỉnh sửa
                  </MDButton>
                  <MDButton 
                    variant="outlined" 
                    size="small" 
                    startIcon={<UserPlus />}
                    onClick={() => openAssignModal(appointment)}
                  >
                    Phân công KTV
                  </MDButton>
                </>
              )}
              {appointment.status === 'COMPLETED' && (
                <>
                  <MDButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => {
                      // Chuyển đến trang Invoice Management để xem hóa đơn
                      window.location.href = '/staff/invoices';
                    }}
                  >
                    Xem hóa đơn
                  </MDButton>
                  <MDButton 
                    variant="outlined" 
                    size="small"
                    onClick={() => openEditModal(appointment)}
                  >
                    Chi tiết
                  </MDButton>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && !loading && (
        <div className="no-appointments">
          <CalendarIcon size={64} color="#cbd5e0" />
          <h3>Không có lịch hẹn</h3>
          <p>
            {dateFilter === 'today' && 'Không có lịch hẹn nào cho hôm nay'}
            {dateFilter === 'week' && 'Không có lịch hẹn nào trong tuần này'}
            {dateFilter === 'month' && 'Không có lịch hẹn nào trong tháng này'}
            {dateFilter === 'all' && 'Không có lịch hẹn nào trong hệ thống'}
          </p>
          {statusFilter !== 'all' && (
            <p className="filter-hint">
              Bộ lọc trạng thái: <strong>{
                statusFilter === 'PENDING' ? 'Chờ xác nhận' :
                statusFilter === 'CONFIRMED' ? 'Đã xác nhận' :
                statusFilter === 'IN_PROGRESS' ? 'Đang thực hiện' :
                statusFilter === 'COMPLETED' ? 'Hoàn thành' : ''
              }</strong>
            </p>
          )}
          {timeFilter !== 'all' && (
            <p className="filter-hint">
              Bộ lọc giờ: <strong>{
                timeFilter === 'morning' ? 'Sáng (6h-12h)' :
                timeFilter === 'afternoon' ? 'Chiều (12h-18h)' :
                timeFilter === 'evening' ? 'Tối (18h-24h)' : ''
              }</strong>
            </p>
          )}
        </div>
      )}

      {/* Assign Technician Modal */}
      {showAssignModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Phân công Kỹ thuật viên</h3>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="appointment-info">
                <p><strong>Mã lịch hẹn:</strong> #{generateDisplayCode(selectedAppointment.id, selectedAppointment.appointmentDate)}</p>
                <p><strong>Khách hàng:</strong> {selectedAppointment.customerName}</p>
                <p><strong>Dịch vụ:</strong> {selectedAppointment.servicePackageName}</p>
              </div>
              <div className="form-group">
                <label>Chọn kỹ thuật viên:</label>
                <select
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Chọn KTV --</option>
                  {technicians.length === 0 && (
                    <option disabled>Không có kỹ thuật viên khả dụng</option>
                  )}
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName} {tech.specialization ? `(${tech.specialization})` : ''}
                    </option>
                  ))}
                </select>
                {technicians.length === 0 && (
                  <small className="text-muted">
                    Vui lòng tạo staff với vai trò Technician hoặc có chuyên môn trong hệ thống
                  </small>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <MDButton variant="outlined" onClick={() => setShowAssignModal(false)}>
                Hủy
              </MDButton>
              <MDButton 
                variant="filled" 
                onClick={handleAssignTechnician}
                disabled={!selectedTechnicianId}
              >
                Phân công
              </MDButton>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chỉnh sửa lịch hẹn</h3>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form onSubmit={handleUpdateAppointment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Ngày hẹn:</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={selectedAppointment.appointmentDate instanceof Date
                      ? selectedAppointment.appointmentDate.toISOString().slice(0, 16)
                      : new Date(selectedAppointment.appointmentDate).toISOString().slice(0, 16)}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      appointmentDate: new Date(e.target.value)
                    })}
                  />
                </div>
                <div className="form-group">
                  <label>Trạng thái:</label>
                  <select
                    className="form-control"
                    value={selectedAppointment.status}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      status: e.target.value as Appointment['status']
                    })}
                  >
                    <option value="PENDING">Chờ xác nhận</option>
                    <option value="CONFIRMED">Đã xác nhận</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ghi chú:</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={selectedAppointment.notes || ''}
                    onChange={(e) => setSelectedAppointment({
                      ...selectedAppointment,
                      notes: e.target.value
                    })}
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <MDButton variant="outlined" type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </MDButton>
                <MDButton variant="filled" type="submit">
                  Lưu thay đổi
                </MDButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Appointment Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Tạo lịch hẹn mới</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Số điện thoại khách hàng: <span className="required">*</span></label>
                  <div className="customer-search-wrapper" style={{ position: 'relative' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={phoneSearch}
                      onChange={(e) => handlePhoneSearch(e.target.value)}
                      onFocus={() => {
                        if (filteredCustomers.length > 0) {
                          setShowCustomerDropdown(true);
                        }
                      }}
                      placeholder="Nhập số điện thoại (tối thiểu 3 số)"
                      required
                    />
                    {selectedCustomer && (
                      <div className="selected-customer-info" style={{ 
                        marginTop: '5px', 
                        padding: '8px 12px', 
                        backgroundColor: '#f0f9ff', 
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#0369a1',
                        border: '1px solid #bae6fd'
                      }}>
                        ✓ Đã chọn: {getCustomerName(selectedCustomer)}
                      </div>
                    )}
                    {showCustomerDropdown && filteredCustomers.length > 0 && (
                      <div className="customer-dropdown" style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        border: '2px solid #0ea5e9',
                        borderRadius: '4px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 10000,
                        marginTop: '4px'
                      }}>
                        {filteredCustomers.map(customer => (
                          <div
                            key={customer.id}
                            className="customer-option"
                            onClick={() => handleSelectCustomer(customer)}
                            style={{
                              padding: '12px 14px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #e5e7eb',
                              transition: 'background-color 0.2s',
                              backgroundColor: 'white'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                          >
                            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>
                              {getCustomerName(customer)}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                              📱 {customer.phone}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <small className="form-helper-text">
                    {phoneSearch.length > 0 && phoneSearch.length < 3 
                      ? 'Nhập thêm để tìm kiếm' 
                      : phoneSearch.length >= 3
                      ? filteredCustomers.length > 0
                        ? `Tìm thấy ${filteredCustomers.length} khách hàng: ${filteredCustomers.map(c => getCustomerName(c)).join(', ')}`
                        : `Không tìm thấy khách hàng với SĐT "${phoneSearch}"`
                      : 'Nhập SĐT để tìm khách hàng, chọn để tải danh sách xe'}
                  </small>
                </div>

                <div className="form-group">
                  <label>Xe: <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={newAppointment.vehicleId}
                    onChange={(e) => setNewAppointment({ ...newAppointment, vehicleId: e.target.value })}
                    disabled={!newAppointment.customerId}
                    required
                  >
                    <option value="">Chọn xe</option>
                    {customerVehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                  <small className="form-helper-text">Chọn khách hàng trước để xem danh sách xe</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Trung tâm dịch vụ: <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={newAppointment.serviceCenterId}
                    onChange={(e) => setNewAppointment({ ...newAppointment, serviceCenterId: e.target.value })}
                    required
                  >
                    <option value="">Chọn trung tâm</option>
                    {serviceCenters.map(center => (
                      <option key={center.id} value={center.id}>
                        {center.name} - {center.address}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Gói dịch vụ: <span className="required">*</span></label>
                  <select
                    className="form-control"
                    value={newAppointment.servicePackageId}
                    onChange={(e) => setNewAppointment({ ...newAppointment, servicePackageId: e.target.value })}
                    required
                  >
                    <option value="">Chọn gói dịch vụ</option>
                    {servicePackages.map(pkg => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} - {pkg.price?.toLocaleString()}đ
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày hẹn: <span className="required">*</span></label>
                  <input
                    type="date"
                    className="form-control"
                    value={newAppointment.appointmentDate}
                    onChange={(e) => setNewAppointment({ ...newAppointment, appointmentDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giờ hẹn: <span className="required">*</span></label>
                  <input
                    type="time"
                    className="form-control"
                    value={newAppointment.appointmentTime}
                    onChange={(e) => setNewAppointment({ ...newAppointment, appointmentTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Ghi chú:</label>
                <textarea
                  className="form-control"
                  rows={4}
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                  placeholder="Nhập ghi chú thêm về yêu cầu dịch vụ, tình trạng xe..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="secondary-btn" onClick={() => setShowCreateModal(false)}>
                ✕ Hủy
              </button>
              <button type="button" className="primary-btn" onClick={handleCreateAppointment}>
                ✓ Tạo lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
