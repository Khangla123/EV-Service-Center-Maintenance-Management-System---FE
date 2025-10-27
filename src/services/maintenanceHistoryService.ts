import api from './api';

// Backend API Response wrapper
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Backend MaintenanceHistoryResponse structure
export interface MaintenanceRecord {
  appointmentId: string;
  serviceTitle: string;
  vehicleModel: string;
  licensePlate: string;
  mileage: number;
  totalAmount: number;
  serviceDate: string;
  nextMaintenanceDate?: string;
  status: string;
  inspectionPassed?: boolean;
}

// Backend MaintenanceHistoryStatisticsResponse structure
interface MaintenanceHistoryStatisticsResponse {
  totalMaintenances: number;
  totalCost: number;
  averageCost: number;
  maintenanceHistory: MaintenanceRecord[];
}

export interface MaintenanceHistoryFilter {
  vehicleId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}

class MaintenanceHistoryService {
  // Lấy lịch sử bảo dưỡng
  async getMaintenanceHistory(params?: MaintenanceHistoryFilter): Promise<{
    maintenanceRecords: MaintenanceRecord[];
    totalMaintenances: number;
    totalCost: number;
    averageCost: number;
  }> {
    try {
      const response = await api.get<ApiResponse<MaintenanceHistoryStatisticsResponse>>('/maintenance-history', { params });
      
      // Backend trả về format: { code, message, result }
      const result = response.data.result;
      
      return {
        maintenanceRecords: result?.maintenanceHistory || [],
        totalMaintenances: result?.totalMaintenances || 0,
        totalCost: result?.totalCost || 0,
        averageCost: result?.averageCost || 0
      };
    } catch (error: any) {
      console.error('Error fetching maintenance history:', error);
      
      // Nếu lỗi 401/403, có thể do chưa đăng nhập
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw new Error('Vui lòng đăng nhập để xem lịch sử bảo dưỡng');
      }
      
      // Trả về dữ liệu rỗng thay vì throw error
      return {
        maintenanceRecords: [],
        totalMaintenances: 0,
        totalCost: 0,
        averageCost: 0
      };
    }
  }

  // Lọc lịch sử bảo dưỡng (POST)
  async filterMaintenanceHistory(filter: MaintenanceHistoryFilter): Promise<{
    maintenanceRecords: MaintenanceRecord[];
    totalMaintenances: number;
    totalCost: number;
    averageCost: number;
  }> {
    try {
      const response = await api.post<ApiResponse<MaintenanceHistoryStatisticsResponse>>('/maintenance-history/filter', filter);
      
      const result = response.data.result;
      
      return {
        maintenanceRecords: result?.maintenanceHistory || [],
        totalMaintenances: result?.totalMaintenances || 0,
        totalCost: result?.totalCost || 0,
        averageCost: result?.averageCost || 0
      };
    } catch (error: any) {
      console.error('Error filtering maintenance history:', error);
      
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        throw new Error('Vui lòng đăng nhập để lọc lịch sử bảo dưỡng');
      }
      
      return {
        maintenanceRecords: [],
        totalMaintenances: 0,
        totalCost: 0,
        averageCost: 0
      };
    }
  }
}

export default new MaintenanceHistoryService();
