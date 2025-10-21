import api from './api';

export interface ServiceOrder {
  id: string;
  appointmentId?: string;
  customerId: string;
  vehicleId: string;
  serviceCenterId: string;
  technicianId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  serviceType: string;
  description?: string;
  diagnosis?: string;
  partsUsed?: string[];
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  startDate?: Date;
  completionDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Thông tin liên quan
  customer?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  vehicle?: {
    model: string;
    manufacturer: string;
    licensePlate: string;
  };
  technician?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface CreateServiceOrderRequest {
  appointmentId?: string;
  customerId: string;
  vehicleId: string;
  serviceCenterId: string;
  serviceType: string;
  description?: string;
  notes?: string;
}

export interface UpdateServiceOrderRequest {
  status?: string;
  description?: string;
  diagnosis?: string;
  partsUsed?: string[];
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  completionDate?: Date;
  notes?: string;
}

export interface AssignTechnicianRequest {
  technicianId: string;
}

export interface UpdateStatusRequest {
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

class ServiceOrderService {
  // Lấy danh sách đơn dịch vụ
  async getAllServiceOrders(params?: {
    page?: number;
    size?: number;
    customerId?: string;
    vehicleId?: string;
    serviceCenterId?: string;
    technicianId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<{ serviceOrders: ServiceOrder[]; total: number; page: number; size: number }> {
    const response = await api.get('/service-orders', { params });
    return response.data;
  }

  // Tạo đơn dịch vụ mới
  async createServiceOrder(data: CreateServiceOrderRequest): Promise<ServiceOrder> {
    const response = await api.post('/service-orders', data);
    return response.data;
  }

  // Lấy chi tiết đơn dịch vụ
  async getServiceOrderById(serviceOrderId: string): Promise<ServiceOrder> {
    const response = await api.get(`/service-orders/${serviceOrderId}`);
    return response.data;
  }

  // Cập nhật đơn dịch vụ
  async updateServiceOrder(
    serviceOrderId: string,
    data: UpdateServiceOrderRequest
  ): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${serviceOrderId}`, data);
    return response.data;
  }

  // Phân công thợ cho đơn dịch vụ
  async assignTechnician(
    serviceOrderId: string,
    data: AssignTechnicianRequest
  ): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${serviceOrderId}/assign`, data);
    return response.data;
  }

  // Cập nhật trạng thái đơn dịch vụ
  async updateStatus(
    serviceOrderId: string,
    data: UpdateStatusRequest
  ): Promise<ServiceOrder> {
    const response = await api.put(`/service-orders/${serviceOrderId}/status`, data);
    return response.data;
  }

  // Lấy danh sách công việc được giao cho tôi (technician)
  async getMyAssignments(params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<{ serviceOrders: ServiceOrder[]; total: number; page: number; size: number }> {
    const response = await api.get('/service-orders/my-assignments', { params });
    return response.data;
  }
}

export default new ServiceOrderService();
