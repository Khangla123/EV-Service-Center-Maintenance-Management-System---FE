import api from './api';

export interface Staff {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  role: string;
  staffCode?: string;
  serviceCenterId?: string;
  serviceCenterName?: string;
  specialization?: string;
  hireDate?: string;
  salary?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  employeeCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStaffRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address?: string;
  role: 'STAFF' | 'TECHNICIAN';
  serviceCenterId?: string;
  specialization?: string;
  hireDate?: string;
  salary?: number;
}

export interface UpdateStaffRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  serviceCenterId?: string;
  specialization?: string;
  hireDate?: string;
  salary?: number;
}

export interface UpdateStaffProfileRequest {
  fullName?: string;
  phone?: string;
  specialization?: string;
}

class StaffService {
  // Create new staff (Admin only)
  async createStaff(data: CreateStaffRequest): Promise<Staff> {
    const response = await api.post('/staff', data);
    return response.data.result || response.data;
  }

  // Get all staff (Admin only)
  async getAllStaff(): Promise<Staff[]> {
    const response = await api.get('/staff');
    return response.data.result || response.data;
  }

  // Get staff by ID (Admin only)
  async getStaffById(staffId: string): Promise<Staff> {
    const response = await api.get(`/staff/${staffId}`);
    return response.data.result || response.data;
  }

  // Update staff (Admin only)
  async updateStaff(staffId: string, data: UpdateStaffRequest): Promise<Staff> {
    const response = await api.put(`/staff/${staffId}`, data);
    return response.data.result || response.data;
  }

  // Delete staff (Admin only)
  async deleteStaff(staffId: string): Promise<{ message: string }> {
    const response = await api.delete(`/staff/${staffId}`);
    return response.data;
  }

  // Get available staff (Staff/Admin)
  async getAvailableStaff(): Promise<Staff[]> {
    const response = await api.get('/staff/available');
    return response.data.result || response.data;
  }

  // Get my profile (Staff/Technician)
  async getMyProfile(): Promise<Staff> {
    const response = await api.get('/staff/my-profile');
    return response.data.result || response.data;
  }

  // Update my profile (Staff/Technician)
  async updateMyProfile(data: UpdateStaffProfileRequest): Promise<Staff> {
    const response = await api.put('/staff/my-profile', data);
    return response.data.result || response.data;
  }
}

export default new StaffService();
