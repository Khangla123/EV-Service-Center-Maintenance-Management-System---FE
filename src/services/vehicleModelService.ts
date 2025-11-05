import api from './api';

export interface VehicleModel {
  id: string;
  manufacturer: string;
  model: string;
  year: number;
  batteryCapacity: number;
  rangeKm: number;
  imageUrl?: string;
  createdAt: Date;
}

class VehicleModelService {
  // Lấy tất cả loại xe
  async getAllVehicleModels(): Promise<VehicleModel[]> {
    const response = await api.get('/vehicles');
    return response.data.result || response.data;
  }

  // Lấy chi tiết loại xe theo ID
  async getVehicleModelById(id: string): Promise<VehicleModel> {
    const response = await api.get(`/vehicles/${id}`);
    return response.data.result || response.data;
  }

  // Lấy loại xe theo hãng
  async getVehicleModelsByManufacturer(manufacturer: string): Promise<VehicleModel[]> {
    const allModels = await this.getAllVehicleModels();
    return allModels.filter(model => 
      model.manufacturer.toLowerCase() === manufacturer.toLowerCase()
    );
  }
}

export default new VehicleModelService();
