import api from './api';
import { Vehicle } from '../types';

export interface CreateVehicleRequest {
  customerId?: string;
  model: string;
  make: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  batteryCapacity: number;
  mileage: number;
  purchaseDate: Date;
  warrantyExpiration: Date;
}

export interface UpdateVehicleRequest {
  model?: string;
  make?: string;
  year?: number;
  licensePlate?: string;
  vin?: string;
  color?: string;
  batteryCapacity?: number;
  mileage?: number;
  purchaseDate?: Date;
  warrantyExpiration?: Date;
}

class VehicleService {
  // Tìm kiếm xe (có thể filter theo customerId, model, etc.)
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

  // Thêm xe mới (admin/staff)
  async createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
    const response = await api.post('/vehicles', data);
    return response.data;
  }

  // Lấy chi tiết xe theo ID
  async getVehicleById(vehicleId: string): Promise<Vehicle> {
    const response = await api.get(`/vehicles/${vehicleId}`);
    return response.data;
  }

  // Cập nhật thông tin xe
  async updateVehicle(vehicleId: string, data: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await api.put(`/vehicles/${vehicleId}`, data);
    return response.data;
  }

  // Xóa xe
  async deleteVehicle(vehicleId: string): Promise<{ message: string }> {
    const response = await api.delete(`/vehicles/${vehicleId}`);
    return response.data;
  }

  // Lấy danh sách xe của một khách hàng cụ thể
  async getVehiclesByCustomerId(customerId: string): Promise<Vehicle[]> {
    const response = await api.get(`/customers/${customerId}/vehicles`);
    // Backend returns {message, result: Vehicle[]}
    return response.data.result || response.data;
  }

  // Thêm xe cho khách hàng cụ thể
  async createVehicleForCustomer(
    customerId: string,
    data: Omit<CreateVehicleRequest, 'customerId'>
  ): Promise<Vehicle> {
    const response = await api.post(`/vehicles/customers/${customerId}`, data);
    return response.data;
  }

  // Lấy danh sách xe của tôi (customer tự xem xe của mình)
  async getMyVehicles(): Promise<Vehicle[]> {
    const response = await api.get('/vehicles/me');
    // Backend trả về { message: string, result: Vehicle[] }
    return response.data.result || [];
  }

  // Đăng ký xe mới cho chính mình (customer)
  async registerMyVehicle(data: Omit<CreateVehicleRequest, 'customerId'>): Promise<Vehicle> {
    const response = await api.post('/vehicles/me', data);
    return response.data;
  }
}

export default new VehicleService();
