import api from './api';

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  description?: string;
  operatingHours?: string; // JSON string from backend
  capacity?: number;
  services?: string[];
  rating?: number;
  totalReviews?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateServiceCenterRequest {
  name: string;
  address: string;
  city: string;
  district?: string;
  phone?: string;
  email?: string;
  description?: string;
  workingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  services?: string[];
}

export interface UpdateServiceCenterRequest {
  name?: string;
  address?: string;
  city?: string;
  district?: string;
  phone?: string;
  email?: string;
  description?: string;
  workingHours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  services?: string[];
  isActive?: boolean;
}

class ServiceCenterService {
  // Lấy danh sách trung tâm dịch vụ
  async getAllServiceCenters(params?: {
    page?: number;
    size?: number;
    city?: string;
    district?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<{ serviceCenters: ServiceCenter[]; total: number; page: number; size: number }> {
    const response = await api.get('/service-centers', { params });
    // Backend trả về { message: string, result: ServiceCenter[] }
    // Cần map lại để phù hợp với interface này
    return {
      serviceCenters: response.data.result || [],
      total: response.data.result?.length || 0,
      page: 1,
      size: response.data.result?.length || 0
    };
  }

  // Tạo trung tâm dịch vụ mới (admin)
  async createServiceCenter(data: CreateServiceCenterRequest): Promise<ServiceCenter> {
    const response = await api.post('/service-centers', data);
    return response.data;
  }

  // Lấy chi tiết trung tâm dịch vụ
  async getServiceCenterById(serviceCenterId: string): Promise<ServiceCenter> {
    const response = await api.get(`/service-centers/${serviceCenterId}`);
    return response.data;
  }

  // Cập nhật trung tâm dịch vụ (admin)
  async updateServiceCenter(
    serviceCenterId: string,
    data: UpdateServiceCenterRequest
  ): Promise<ServiceCenter> {
    const response = await api.put(`/service-centers/${serviceCenterId}`, data);
    return response.data;
  }

  // Xóa trung tâm dịch vụ (admin)
  async deleteServiceCenter(serviceCenterId: string): Promise<{ message: string }> {
    const response = await api.delete(`/service-centers/${serviceCenterId}`);
    return response.data;
  }
}

export default new ServiceCenterService();
