import api from './api';

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

export interface CreateAppointmentRequest {
  customerId?: string; // UUID của customer
  vehicleId: string; // UUID của vehicle
  serviceCenterId: string; // UUID của service center
  servicePackageId: string; // UUID của service package
  appointmentDate: string; // ISO string format
  notes?: string;
}

export interface UpdateAppointmentRequest {
  appointmentDate?: string;
  appointmentTime?: string;
  serviceCenterId?: string;
  serviceType?: string;
  status?: string;
  notes?: string;
  technicianId?: string;
}

export interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

class AppointmentService {
  // Lấy danh sách lịch hẹn (có thể filter)
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

  // Đặt lịch hẹn mới
  async createAppointment(data: CreateAppointmentRequest): Promise<Appointment> {
    const response = await api.post('/appointments', data);
    // Backend trả về format: {message: string, result: Appointment}
    return response.data.result || response.data;
  }

  // Lấy chi tiết lịch hẹn
  async getAppointmentById(appointmentId: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${appointmentId}`);
    // Backend trả về format: {message: string, result: Appointment}
    return response.data.result || response.data;
  }

  // Cập nhật lịch hẹn
  async updateAppointment(
    appointmentId: string,
    data: UpdateAppointmentRequest
  ): Promise<Appointment> {
    const response = await api.put(`/appointments/${appointmentId}`, data);
    return response.data;
  }

  // Hủy lịch hẹn
  async cancelAppointment(appointmentId: string): Promise<{ message: string }> {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  }

  // Technician bắt đầu công việc (ASSIGNED -> IN_PROGRESS)
  async startAppointment(appointmentId: string): Promise<Appointment> {
    const response = await api.put(`/appointments/${appointmentId}/start`);
    return response.data.result;
  }

  // Lấy lịch hẹn của tôi (customer xem lịch hẹn của mình)
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

  // Lấy khung giờ trống
  async getAvailableSlots(params: {
    serviceCenterId: string;
    date: string; // Format: YYYY-MM-DD
    serviceType?: string;
  }): Promise<AvailableSlot[]> {
    const response = await api.get('/appointments/available', { params });
    return response.data;
  }

  // Lấy công việc được phân công cho technician
  async getMyTasks(technicianId: string): Promise<Appointment[]> {
    const response = await api.get('/appointments/my-tasks', {
      params: { technicianId }
    });
    return response.data.result || response.data;
  }

  // Lấy appointments theo status (cho Staff)
  async getAppointmentsByStatus(status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'): Promise<Appointment[]> {
    const response = await api.get('/appointments/by-status', {
      params: { status }
    });
    return response.data.result || response.data;
  }
}

export type AppointmentResponse = Appointment;
export default new AppointmentService();
