import api from './api';

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateServicePackageRequest {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

export interface UpdateServicePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

class ServicePackageService {
  // Lấy danh sách gói dịch vụ
  async getAllServicePackages(): Promise<ServicePackage[]> {
    const response = await api.get('/service-packages');
    return response.data.result || [];
  }

  // Lấy chi tiết gói dịch vụ
  async getServicePackageById(servicePackageId: string): Promise<ServicePackage> {
    const response = await api.get(`/service-packages/${servicePackageId}`);
    return response.data.result;
  }

  // Tạo gói dịch vụ mới (Admin only)
  async createServicePackage(data: CreateServicePackageRequest): Promise<ServicePackage> {
    const response = await api.post('/service-packages', data);
    return response.data.result;
  }

  // Cập nhật gói dịch vụ (Admin only)
  async updateServicePackage(id: string, data: UpdateServicePackageRequest): Promise<ServicePackage> {
    const response = await api.put(`/service-packages/${id}`, data);
    return response.data.result;
  }

  // Xóa gói dịch vụ (Admin only)
  async deleteServicePackage(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/service-packages/${id}`);
    return response.data;
  }
}

export default new ServicePackageService();
