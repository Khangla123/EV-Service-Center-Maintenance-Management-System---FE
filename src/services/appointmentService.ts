/**
 * Appointment Service Module
 * Quản lý các API liên quan đến appointment (lịch hẹn dịch vụ)
 * @module services/appointmentService
 */

import api from './api';

/**
 * Appointment Interface
 * Định nghĩa cấu trúc dữ liệu của một lịch hẹn
 * @interface Appointment
 */
export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  vehicleId: string;
  vehicleLicensePlate: string;
  vehicleModel: string;
  serviceCenterId: string;
  serviceCenterName: string;
  servicePackageId: string;
  servicePackageName: string;
  selectedPackages?: string; // JSON array of selected package IDs
  selectedPackageNames?: string; // Comma-separated package names
  technicianId?: string;
  technicianName?: string;
  appointmentDate: Date;
  status: 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create Appointment Request
 * Payload để tạo lịch hẹn mới
 * @interface CreateAppointmentRequest
 */
export interface CreateAppointmentRequest {
  customerId?: string; // UUID của customer
  vehicleId: string; // UUID của vehicle
  serviceCenterId: string; // UUID của service center
  servicePackageId: string; // UUID của service package
  appointmentDate: string; // ISO string format
  notes?: string;
}

/**
 * Update Appointment Request
 * Payload để cập nhật thông tin lịch hẹn
 * @interface UpdateAppointmentRequest
 */
export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  serviceCenterId?: string;
  serviceType?: string;
  status?: string;
  notes?: string;
  technicianId?: string;
}

/**
 * Available Slot
 * Thông tin khung giờ trống có thể đặt lịch
 * @interface AvailableSlot
 */
export interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

/**
 * AppointmentService Class
 * Service layer để xử lý các API calls liên quan đến appointments
 * @class AppointmentService
 */
class AppointmentService {
  /**
   * getAllAppointments - Lấy danh sách lịch hẹn với filters
   * @param {Object} params - Query parameters để filter
   * @param {number} params.page - Số trang
   * @param {number} params.size - Kích thước trang
   * @param {string} params.customerId - Filter theo customer ID
   * @param {string} params.vehicleId - Filter theo vehicle ID
   * @param {string} params.serviceCenterId - Filter theo service center ID
   * @param {string} params.status - Filter theo trạng thái
   * @param {string} params.fromDate - Ngày bắt đầu (ISO format)
   * @param {string} params.toDate - Ngày kết thúc (ISO format)
   * @returns {Promise} Danh sách appointments với pagination info
   * @example
   * const result = await appointmentService.getAllAppointments({
   *   status: 'PENDING',
   *   page: 1,
   *   size: 10
   * });
   */
  async getAllAppointments(params?: {
    page?: number;
    size?: number;
    customerId?: string;
    vehicleId?: string;
    serviceCenterId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ appointments: Appointment[]; total: number; page: number; size: number }> {
    const response = await api.get('/appointments', { params });
    // Backend trả về format: {message: string, result: Appointment[]}
    const appointments = response.data.result || response.data;
    return { appointments, total: appointments.length, page: 1, size: appointments.length };
  }

  /**
   * createAppointment - Tạo lịch hẹn mới
   * @param {CreateAppointmentRequest} data - Thông tin lịch hẹn cần tạo
   * @returns {Promise<Appointment>} Appointment vừa được tạo
   * @example
   * const appointment = await appointmentService.createAppointment({
   *   vehicleId: 'vehicle-uuid',
   *   serviceCenterId: 'center-uuid',
   *   servicePackageId: 'package-uuid',
   *   appointmentDate: '2025-12-01T10:00:00Z'
   * });
   */
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    // Backend trả về format: {message: string, result: Appointment}
    return response.data.result || response.data;
  }

  /**
   * getAppointmentById - Lấy chi tiết lịch hẹn theo ID
   * @param {string} appointmentId - UUID của appointment
   * @returns {Promise<Appointment>} Chi tiết appointment
   * @example
   * const appointment = await appointmentService.getAppointmentById('appointment-uuid');
   */
  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${appointmentId}`);
    // Backend trả về format: {message: string, result: Appointment}
    return response.data.result || response.data;
  }

  /**
   * updateAppointment - Cập nhật thông tin lịch hẹn
   * @param {string} appointmentId - UUID của appointment
   * @param {UpdateAppointmentRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Appointment>} Appointment sau khi update
   * @example
   * const updated = await appointmentService.updateAppointment('appointment-uuid', {
   *   status: 'CONFIRMED',
   *   technicianId: 'tech-uuid'
   * });
   */
  async updateAppointment(
    appointmentId: string,
    data: UpdateAppointmentRequest
  ): Promise<Appointment> {
    const response = await api.put(`/appointments/${appointmentId}`, data);
    return response.data;
  }

  /**
   * cancelAppointment - Hủy lịch hẹn
   * @param {string} appointmentId - UUID của appointment cần hủy
   * @returns {Promise} Message xác nhận
   * @example
   * await appointmentService.cancelAppointment('appointment-uuid');
   */
  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  }

  /**
   * startAppointment - Technician bắt đầu công việc (ASSIGNED -> IN_PROGRESS)
   * @param {string} appointmentId - UUID của appointment
   * @returns {Promise<Appointment>} Appointment với status đã cập nhật
   * @example
   * const started = await appointmentService.startAppointment('appointment-uuid');
   */
  async startAppointment(appointmentId: string): Promise<Appointment> {
    const response = await api.put(`/appointments/${appointmentId}/start`);
    return response.data.result;
  }

  /**
   * getMyAppointments - Lấy danh sách lịch hẹn của customer hiện tại
   * Tự động lấy customerId từ localStorage nếu không được truyền vào
   * @param {Object} params - Query parameters
   * @returns {Promise} Danh sách appointments của customer
   * @example
   * const myAppointments = await appointmentService.getMyAppointments({
   *   status: 'CONFIRMED'
   * });
   */
  async getMyAppointments(params?: {
    customerId?: string;
    page?: number;
    size?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ appointments: Appointment[]; total: number; page: number; size: number }> {
    // Lấy customerId từ localStorage nếu không được truyền vào
    let customerId = params?.customerId;
    
    if (!customerId) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          const userId = user.id;
          console.log('📌 getMyAppointments - userId from localStorage:', userId);
          
          // Gọi API /customers/me để lấy customer profile (bao gồm customerId)
          try {
            const customerResponse = await api.get('/customers/me');
            const customerData = customerResponse.data.result || customerResponse.data;
            customerId = customerData.id;
            console.log('✅ Got customerId from /customers/me:', customerId);
          } catch (error) {
            console.error('❌ Error getting customer profile:', error);
            // Fallback: thử dùng userId làm customerId
            customerId = userId;
            console.log('⚠️ Fallback to userId as customerId:', customerId);
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
    
    // Nếu vẫn không có customerId, trả về danh sách rỗng
    if (!customerId) {
      console.warn('⚠️ No customerId available for getMyAppointments');
      return { appointments: [], total: 0, page: 1, size: 0 };
    }
    
    console.log('🔍 Calling /appointments/me with customerId:', customerId);
    const response = await api.get('/appointments/me', { 
      params: { ...params, customerId } 
    });
    console.log('✅ Response from /appointments/me:', response.data);
    // Backend trả về format: {message: string, result: Appointment[]}
    const appointments = response.data.result || response.data;
    return { appointments, total: appointments.length, page: 1, size: appointments.length };
  }

  /**
   * getAvailableSlots - Lấy danh sách khung giờ trống để đặt lịch
   * @param {Object} params - Thông tin để tìm slots
   * @param {string} params.serviceCenterId - UUID của service center
   * @param {string} params.date - Ngày cần check (YYYY-MM-DD)
   * @param {string} params.serviceType - Loại dịch vụ (optional)
   * @returns {Promise<AvailableSlot[]>} Danh sách khung giờ trống
   * @example
   * const slots = await appointmentService.getAvailableSlots({
   *   serviceCenterId: 'center-uuid',
   *   date: '2025-12-01'
   * });
   */
  async getAvailableSlots(params: {
    serviceCenterId: string;
    date: string; // Format: YYYY-MM-DD
    serviceType?: string;
  }): Promise<AvailableSlot[]> {
    const response = await api.get('/appointments/available', { params });
    return response.data;
  }

  /**
   * getMyTasks - Lấy danh sách công việc được phân công cho technician
   * @param {string} technicianId - UUID của technician
   * @returns {Promise<Appointment[]>} Danh sách appointments được phân công
   * @example
   * const tasks = await appointmentService.getMyTasks('tech-uuid');
   */
  async getMyTasks(technicianId: string): Promise<Appointment[]> {
    const response = await api.get('/appointments/my-tasks', {
      params: { technicianId }
    });
    return response.data.result || response.data;
  }

  /**
   * getAppointmentsByStatus - Lấy appointments theo trạng thái (cho Staff)
   * @param {string} status - Trạng thái appointment cần lấy
   * @returns {Promise<Appointment[]>} Danh sách appointments theo status
   * @example
   * const pending = await appointmentService.getAppointmentsByStatus('PENDING');
   */
  async getAppointmentsByStatus(status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<Appointment[]> {
    const response = await api.get('/appointments/by-status', {
      params: { status }
    });
    return response.data.result || response.data;
  }
}

export type AppointmentResponse = Appointment;
export default new AppointmentService();
