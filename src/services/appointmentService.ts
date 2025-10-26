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
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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

  // Lấy lịch hẹn của tôi (customer xem lịch hẹn của mình)
  async getMyAppointments(params?: {
    customerId?: string;
    page?: number;
    size?: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ appointments: Appointment[]; total: number; page: number; size: number }> {
    const response = await api.get('/appointments/me', { params });
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
}

export default new AppointmentService();
