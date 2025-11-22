/**
 * Part Service Module
 * Quản lý các API liên quan đến parts (phụ tùng)
 * @module services/partService
 */

import api from './api';

/**
 * Part Response Interface
 * Định nghĩa cấu trúc dữ liệu của phụ tùng
 * @interface PartResponse
 */
export interface PartResponse {
  id: string;
  serviceCenterId: string;
  serviceCenterName?: string;
  partCode: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create Part Request
 * Payload để tạo phụ tùng mới
 * @interface CreatePartRequest
 */
export interface CreatePartRequest {
  serviceCenterId: string;
  partCode: string;
  name: string;
  description?: string;
  category: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  supplier?: string;
}

/**
 * Update Part Request
 * Payload để cập nhật thông tin phụ tùng
 * @interface UpdatePartRequest
 */
export interface UpdatePartRequest {
  partCode?: string;
  name?: string;
  description?: string;
  category?: string;
  unitPrice?: number;
  stockQuantity?: number;
  minStockLevel?: number;
  supplier?: string;
}

/**
 * Restock Part Request
 * Payload để nhập kho phụ tùng
 * @interface RestockPartRequest
 */
export interface RestockPartRequest {
  quantity: number;
  notes?: string;
}

/**
 * PartService Class
 * Service layer để xử lý các API calls liên quan đến parts (quản lý kho phụ tùng)
 * @class PartService
 */
class PartService {
  /**
   * getAllParts - Lấy danh sách tất cả phụ tùng trong hệ thống
   * @returns {Promise<PartResponse[]>} Danh sách tất cả parts
   * @example
   * const parts = await partService.getAllParts();
   */
  async getAllParts(): Promise<PartResponse[]> {
    const response = await api.get('/parts');
    return response.data.result || response.data;
  }

  /**
   * createPart - Tạo phụ tùng mới trong kho
   * @param {CreatePartRequest} data - Thông tin phụ tùng cần tạo
   * @returns {Promise<PartResponse>} Phụ tùng vừa được tạo
   * @example
   * const newPart = await partService.createPart({
   *   serviceCenterId: 'center-uuid',
   *   partCode: 'BRAKE-001',
   *   name: 'Brake Pad',
   *   category: 'Brake System',
   *   unitPrice: 500000,
   *   stockQuantity: 50,
   *   minStockLevel: 10
   * });
   */
  async createPart(data: CreatePartRequest): Promise<PartResponse> {
    const response = await api.post('/parts', data);
    return response.data.result || response.data;
  }

  /**
   * getPartById - Lấy chi tiết phụ tùng theo ID
   * @param {string} partId - UUID của part
   * @returns {Promise<PartResponse>} Chi tiết phụ tùng
   * @example
   * const part = await partService.getPartById('part-uuid');
   */
  async getPartById(partId: string): Promise<PartResponse> {
    const response = await api.get(`/parts/${partId}`);
    return response.data.result || response.data;
  }

  /**
   * updatePart - Cập nhật thông tin phụ tùng
   * @param {string} partId - UUID của part
   * @param {UpdatePartRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<PartResponse>} Phụ tùng sau khi update
   * @example
   * const updated = await partService.updatePart('part-uuid', {
   *   unitPrice: 550000,
   *   stockQuantity: 45
   * });
   */
  async updatePart(partId: string, data: UpdatePartRequest): Promise<PartResponse> {
    const response = await api.put(`/parts/${partId}`, data);
    return response.data.result || response.data;
  }

  /**
   * deletePart - Xóa phụ tùng (soft delete)
   * @param {string} partId - UUID của part cần xóa
   * @returns {Promise<void>}
   * @example
   * await partService.deletePart('part-uuid');
   */
  async deletePart(partId: string): Promise<void> {
    const response = await api.delete(`/parts/${partId}`);
    return response.data;
  }

  /**
   * getLowStockParts - Lấy danh sách phụ tùng sắp hết hàng
   * Trả về các parts có stockQuantity <= minStockLevel
   * @returns {Promise<PartResponse[]>} Danh sách parts sắp hết
   * @example
   * const lowStock = await partService.getLowStockParts();
   * // Cảnh báo nhân viên nhập thêm kho
   */
  async getLowStockParts(): Promise<PartResponse[]> {
    const response = await api.get('/parts/low-stock');
    return response.data.result || response.data;
  }

  /**
   * restockPart - Nhập kho phụ tùng (tăng số lượng)
   * @param {string} partId - UUID của part cần nhập kho
   * @param {RestockPartRequest} data - Số lượng và ghi chú
   * @returns {Promise<PartResponse>} Phụ tùng sau khi nhập kho
   * @example
   * const restocked = await partService.restockPart('part-uuid', {
   *   quantity: 20,
   *   notes: 'Nhập kho từ nhà cung cấp ABC'
   * });
   */
  async restockPart(partId: string, data: RestockPartRequest): Promise<PartResponse> {
    const response = await api.post(`/parts/${partId}/restock`, data);
    return response.data.result || response.data;
  }
}

export default new PartService();
