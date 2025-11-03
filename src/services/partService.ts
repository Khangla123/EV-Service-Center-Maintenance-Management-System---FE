import api from './api';

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

export interface RestockPartRequest {
  quantity: number;
  notes?: string;
}

class PartService {
  // Lấy danh sách tất cả phụ tùng
  async getAllParts(): Promise<PartResponse[]> {
    const response = await api.get('/parts');
    return response.data.result || response.data;
  }

  // Tạo phụ tùng mới
  async createPart(data: CreatePartRequest): Promise<PartResponse> {
    const response = await api.post('/parts', data);
    return response.data.result || response.data;
  }

  // Lấy chi tiết phụ tùng
  async getPartById(partId: string): Promise<PartResponse> {
    const response = await api.get(`/parts/${partId}`);
    return response.data.result || response.data;
  }

  // Cập nhật phụ tùng
  async updatePart(partId: string, data: UpdatePartRequest): Promise<PartResponse> {
    const response = await api.put(`/parts/${partId}`, data);
    return response.data.result || response.data;
  }

  // Xóa phụ tùng (soft delete)
  async deletePart(partId: string): Promise<void> {
    const response = await api.delete(`/parts/${partId}`);
    return response.data;
  }

  // Lấy danh sách phụ tùng sắp hết
  async getLowStockParts(): Promise<PartResponse[]> {
    const response = await api.get('/parts/low-stock');
    return response.data.result || response.data;
  }

  // Nhập kho phụ tùng
  async restockPart(partId: string, data: RestockPartRequest): Promise<PartResponse> {
    const response = await api.post(`/parts/${partId}/restock`, data);
    return response.data.result || response.data;
  }
}

export default new PartService();
