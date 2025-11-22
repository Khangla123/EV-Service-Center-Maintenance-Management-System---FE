/**
 * vehicleService.ts - Vehicle Management Service
 * 
 * Service xử lý tất cả các API calls liên quan đến quản lý xe.
 * Bao gồm CRUD operations cho xe và quản lý xe của customer.
 * 
 * Features:
 * - Tìm kiếm xe (search, filter)
 * - CRUD operations (create, read, update, delete)
 * - Customer vehicle management
 * - Admin/Staff vehicle management
 * - Vehicle registration
 * 
 * @module services/vehicleService
 */

import api from './api';
import { Vehicle } from '../types';

/**
 * CreateVehicleRequest - Dữ liệu để tạo xe mới
 * 
 * @interface CreateVehicleRequest
 */
export interface CreateVehicleRequest {
  customerId?: string;        // UUID customer (optional cho admin/staff)
  vehicleModelId: string;     // UUID của VehicleModel
  vin: string;                // Vehicle Identification Number
  licensePlate: string;       // Biển số xe
  color: string;              // Màu sắc
  purchaseDate: Date;         // Ngày mua
  mileage: number;            // Số km đã chạy
  warrantyExpiration?: Date;  // Ngày hết hạn bảo hành
}

/**
 * UpdateVehicleRequest - Dữ liệu để cập nhật xe
 * 
 * Tất cả fields đều optional - chỉ update fields được cung cấp.
 * 
 * @interface UpdateVehicleRequest
 */
export interface UpdateVehicleRequest {
  vehicleModelId?: string;
  vin?: string;
  licensePlate?: string;
  color?: string;
  mileage?: number;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
}

/**
 * VehicleService Class
 * 
 * Service class quản lý tất cả vehicle operations.
 * Hỗ trợ cả customer và admin/staff operations.
 */
class VehicleService {
  /**
   * searchVehicles - Tìm kiếm xe với filters
   * 
   * Hỗ trợ pagination và nhiều filters khác nhau.
   * 
   * @param {Object} [params] - Search parameters
   * @param {number} [params.page] - Số trang (bắt đầu từ 0)
   * @param {number} [params.size] - Số items mỗi trang
   * @param {string} [params.customerId] - Filter theo customer ID
   * @param {string} [params.model] - Filter theo model name
   * @param {string} [params.make] - Filter theo manufacturer
   * @param {string} [params.licensePlate] - Filter theo biển số
   * @returns {Promise<Object>} Danh sách xe và pagination info
   * 
   * @example
   * ```typescript
   * const result = await vehicleService.searchVehicles({
   *   page: 0,
   *   size: 10,
   *   customerId: 'customer-uuid'
   * });
   * console.log(result.vehicles); // Vehicle[]
   * ```
   */
  async searchVehicles(params?: {
    page?: number;
    size?: number;
    customerId?: string;
    model?: string;
    make?: string;
    licensePlate?: string;
  }): Promise<{ vehicles: Vehicle[]; total: number; page: number; size: number }> {
    const response = await api.get('/vehicles', { params });
    return response.data;
  }

  /**
   * createVehicle - Tạo xe mới (Admin/Staff)
   * 
   * Chỉ admin/staff mới có quyền gọi API này.
   * Customer sử dụng registerMyVehicle() thay thế.
   * 
   * @param {CreateVehicleRequest} data - Thông tin xe mới
   * @returns {Promise<Vehicle>} Xe vừa tạo
   */
  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await api.post('/vehicles', data);
    return response.data;
  }

  /**
   * getVehicleById - Lấy chi tiết xe theo ID
   * 
   * @param {string} vehicleId - UUID của xe
   * @returns {Promise<Vehicle>} Thông tin xe
   */
  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  }

  /**
   * updateVehicle - Cập nhật thông tin xe (Admin/Staff)
   * 
   * @param {string} vehicleId - UUID của xe
   * @param {UpdateVehicleRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Vehicle>} Xe sau khi cập nhật
   */
  async updateVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await api.put(`/vehicles/${vehicleId}`, data);
    return response.data;
  }

  /**
   * updateMyVehicle - Cập nhật xe của tôi (Customer)
   * 
   * Customer chỉ có thể update xe của mình.
   * 
   * @param {string} vehicleId - UUID của xe
   * @param {UpdateVehicleRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Vehicle>} Xe sau khi cập nhật
   */
  async updateMyVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await api.put(`/vehicles/me/${vehicleId}`, data);
    // Backend trả về { message: string, result: Vehicle }
    return response.data.result || response.data;
  }

  /**
   * deleteVehicle - Xóa xe (Admin/Staff)
   * 
   * @param {string} vehicleId - UUID của xe
   * @returns {Promise<{message: string}>} Success message
   */
  async deleteVehicle(vehicleId: string): Promise<{ message: string }> {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  }

  /**
   * deleteMyVehicle - Xóa xe của tôi (Customer)
   * 
   * Customer chỉ có thể xóa xe của mình.
   * 
   * @param {string} vehicleId - UUID của xe
   * @returns {Promise<{message: string}>} Success message
   */
  async deleteMyVehicle(vehicleId: string): Promise<{ message: string }> {
    const response = await api.delete(`/vehicles/me/${vehicleId}`);
    return response.data;
  }

  /**
   * getVehiclesByCustomerId - Lấy tất cả xe của một customer (Admin/Staff)
   * 
   * @param {string} customerId - UUID của customer
   * @returns {Promise<Vehicle[]>} Danh sách xe
   */
  async getVehiclesByCustomerId(customerId: string): Promise<Vehicle[]> {
    const response = await api.get(`/customers/${customerId}/vehicles`);
    // Backend returns {message, result: Vehicle[]}
    return response.data.result || response.data;
  }

  /**
   * createVehicleForCustomer - Tạo xe cho customer cụ thể (Admin/Staff)
   * 
   * @param {string} customerId - UUID của customer
   * @param {Omit<CreateVehicleRequest, 'customerId'>} data - Thông tin xe
   * @returns {Promise<Vehicle>} Xe vừa tạo
   */
  async createVehicleForCustomer(
    customerId: string,
    data: Omit<CreateVehicleRequest, 'customerId'>
  ): Promise<Vehicle> {
    const response = await api.post(`/vehicles/customers/${customerId}`, data);
    return response.data;
  }

  /**
   * getMyVehicles - Lấy danh sách xe của tôi (Customer)
   * 
   * Customer tự xem xe của mình.
   * 
   * @returns {Promise<Vehicle[]>} Danh sách xe
   */
  async getMyVehicles(): Promise<Vehicle[]> {
    const response = await api.get('/vehicles/me');
    // Backend trả về { message: string, result: Vehicle[] }
    return response.data.result || [];
  }

  /**
   * registerMyVehicle - Đăng ký xe mới cho chính mình (Customer)
   * 
   * Customer đăng ký xe mới cho tài khoản của mình.
   * 
   * @param {Omit<CreateVehicleRequest, 'customerId'>} data - Thông tin xe
   * @returns {Promise<Vehicle>} Xe vừa đăng ký
   */
  async registerMyVehicle(data: Omit<CreateVehicleRequest, 'customerId'>): Promise<Vehicle> {
    const response = await api.post('/vehicles/me', data);
    // Backend trả về { message: string, result: Vehicle }
    return response.data.result || response.data;
  }
}

/**
 * Export singleton instance
 * Sử dụng: import vehicleService from './vehicleService'
 */
export default new VehicleService();
