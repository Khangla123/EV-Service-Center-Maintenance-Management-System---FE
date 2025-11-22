/**
 * Service Package Service Module
 * Quản lý các API liên quan đến service packages (gói dịch vụ bảo dưỡng)
 * @module services/servicePackageService
 */

import api from './api';

/**
 * Service Package Interface
 * Định nghĩa cấu trúc dữ liệu của gói dịch vụ
 * @interface ServicePackage
 */
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
}

/**
 * Create Service Package Request
 * Payload để tạo gói dịch vụ mới
 * @interface CreateServicePackageRequest
 */
export interface CreateServicePackageRequest {
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
}

/**
 * Update Service Package Request
 * Payload để cập nhật gói dịch vụ
 * @interface UpdateServicePackageRequest
 */
export interface UpdateServicePackageRequest {
  name?: string;
  description?: string;
  price?: number;
  durationMinutes?: number;
  isActive?: boolean;
}

/**
 * ServicePackageService Class
 * Service layer quản lý gói dịch vụ bảo dưỡng
 * @class ServicePackageService
 */
class ServicePackageService {
  /**
   * getAllServicePackages - Lấy danh sách tất cả gói dịch vụ
   * @returns {Promise<ServicePackage[]>} Danh sách service packages
   * @example
   * const packages = await servicePackageService.getAllServicePackages();
   */
  async getAllServicePackages(): Promise<ServicePackage[]> {
    const response = await api.get('/service-packages');
    return response.data.result || [];
  }

  /**
   * getServicePackageById - Lấy chi tiết gói dịch vụ theo ID
   * @param {string} servicePackageId - UUID của service package
   * @returns {Promise<ServicePackage>} Chi tiết gói dịch vụ
   * @example
   * const pkg = await servicePackageService.getServicePackageById('package-uuid');
   */
  async getServicePackageById(servicePackageId: string): Promise<ServicePackage> {
    const response = await api.get(`/service-packages/${servicePackageId}`);
    return response.data.result;
  }

  /**
   * createServicePackage - Tạo gói dịch vụ mới (Admin only)
   * @param {CreateServicePackageRequest} data - Thông tin gói dịch vụ
   * @returns {Promise<ServicePackage>} Gói dịch vụ vừa tạo
   * @example
   * const newPackage = await servicePackageService.createServicePackage({
   *   name: 'Bảo dưỡng toàn diện',
   *   description: 'Kiểm tra và bảo dưỡng toàn bộ hệ thống',
   *   price: 2000000,
   *   durationMinutes: 120
   * });
   */
  async createServicePackage(data: CreateServicePackageRequest): Promise<ServicePackage> {
    const response = await api.post('/service-packages', data);
    return response.data.result;
  }

  /**
   * updateServicePackage - Cập nhật gói dịch vụ (Admin only)
   * @param {string} id - UUID của service package
   * @param {UpdateServicePackageRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<ServicePackage>} Gói dịch vụ sau khi update
   * @example
   * const updated = await servicePackageService.updateServicePackage('package-uuid', {
   *   price: 2500000,
   *   isActive: true
   * });
   */
  async updateServicePackage(id: string, data: UpdateServicePackageRequest): Promise<ServicePackage> {
    const response = await api.put(`/service-packages/${id}`, data);
    return response.data.result;
  }

  /**
   * deleteServicePackage - Xóa gói dịch vụ (Admin only)
   * @param {string} id - UUID của service package
   * @returns {Promise} Message xác nhận
   * @example
   * await servicePackageService.deleteServicePackage('package-uuid');
   */
  async deleteServicePackage(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/service-packages/${id}`);
    return response.data;
  }
}

export default new ServicePackageService();
