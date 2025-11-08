import api from './api';

export interface ServiceOrder {
  id: string;
  appointmentId?: string;
  orderCode?: string;
  technicianId?: string;
  technicianName?: string;
  // NOTE: Status is managed in appointment.status, not in service_order
  // status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'; - REMOVED
  startTime?: Date;
  endTime?: Date;
  checklist?: string; // JSON string
  diagnosis?: string;
  workPerformed?: string;
  totalAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Legacy fields for backward compatibility (may be removed later)
  customerId?: string;
  vehicleId?: string;
  serviceCenterId?: string;
  serviceType?: string;
  description?: string;
  partsUsed?: string[];
  laborCost?: number;
  partsCost?: number;
  totalCost?: number;
  startDate?: Date;
  completionDate?: Date;
  notes?: string;
  
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
    console.log('🔍 getAllServiceOrders raw response:', response.data);
    
    // Backend returns ApiResponse.result as array directly
    const serviceOrders = response.data.result || [];
    
    return {
      serviceOrders,
      total: serviceOrders.length,
      page: params?.page || 0,
      size: params?.size || serviceOrders.length
    };
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

  // Lấy danh sách công việc được giao cho technician (từ service_orders)
  async getMyAssignments(technicianId: string, params?: {
    page?: number;
    size?: number;
    status?: string;
  }): Promise<ServiceOrder[]> {
    console.log('🔍 ServiceOrderService.getMyAssignments - technicianId:', technicianId);
    const response = await api.get('/service-orders/my-assignments', { 
      params: { ...params, technicianId } 
    });
    console.log('✅ ServiceOrderService.getMyAssignments - response:', response.data);
    // Backend returns simple array, not paginated
    return response.data.result || response.data;
  }

  // Tạo Service Order từ Appointment và phân công Technician (FLOW CHUẨN)
  async createServiceOrderFromAppointment(
    appointmentId: string,
    technicianId: string
  ): Promise<ServiceOrder> {
    console.log('Creating service order:', { appointmentId, technicianId });
    
    // Backend endpoint: POST /service-orders/from-appointment/{appointmentId}/assign?technicianId=xxx
    // Thử cả 2 cách: query param VÀ request body để đảm bảo BE nhận được
    const response = await api.post(
      `/service-orders/from-appointment/${appointmentId}/assign`,
      { technicianId }, // technicianId trong body
      { params: { technicianId } } // technicianId trong query param (để chắc chắn)
    );
    
    console.log('Service order created:', response.data);
    return response.data.result || response.data;
  }

  // ⭐ NEW: Lấy service orders của technician với checklist từ maintenance_plans
  async getMyServiceOrders(): Promise<ServiceOrder[]> {
    const response = await api.get('/service-orders/technician/me');
    return response.data.result || response.data;
  }

  // ⭐ NEW: Lấy service order theo appointment ID (để lấy checklist)
  async getServiceOrderByAppointmentId(appointmentId: string): Promise<ServiceOrder> {
    const response = await api.get(`/service-orders/appointment/${appointmentId}`);
    return response.data.result || response.data;
  }

  // ⭐ NEW: Parse checklist JSON string to object
  parseChecklist(checklistJson: string | undefined): any {
    if (!checklistJson) return null;
    try {
      return JSON.parse(checklistJson);
    } catch (error) {
      console.error('Error parsing checklist JSON:', error);
      return null;
    }
  }
}

export default new ServiceOrderService();
