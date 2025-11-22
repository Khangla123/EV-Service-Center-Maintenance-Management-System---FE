/**
 * Staff Service Module
 * Quản lý các API liên quan đến staff và technician
 * @module services/staffService
 */

import api from './api';

/**
 * Staff Interface
 * Định nghĩa cấu trúc dữ liệu của nhân viên (Staff/Technician)
 * @interface Staff
 */
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
  currentStatus?: 'AVAILABLE' | 'BUSY' | 'INACTIVE';
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  employeeCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create Staff Request
 * Payload để tạo nhân viên mới
 * @interface CreateStaffRequest
 */
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

/**
 * Update Staff Request
 * Payload để cập nhật thông tin nhân viên (Admin)
 * @interface UpdateStaffRequest
 */
export interface UpdateStaffRequest {
  fullName?: string;
  phone?: string;
  address?: string;
  serviceCenterId?: string;
  specialization?: string;
  hireDate?: string;
  salary?: number;
}

/**
 * Update Staff Profile Request
 * Payload để nhân viên tự cập nhật profile
 * @interface UpdateStaffProfileRequest
 */
export interface UpdateStaffProfileRequest {
  fullName?: string;
  phone?: string;
  specialization?: string;
}

/**
 * StaffService Class
 * Service layer quản lý nhân viên (Staff và Technician)
 * @class StaffService
 */
class StaffService {
  /**
   * createStaff - Tạo nhân viên mới (Admin only)
   * @param {CreateStaffRequest} data - Thông tin nhân viên
   * @returns {Promise<Staff>} Nhân viên vừa tạo
   * @example
   * const newStaff = await staffService.createStaff({
   *   email: 'staff@example.com',
   *   password: 'password123',
   *   fullName: 'Nguyen Van A',
   *   phone: '0901234567',
   *   role: 'TECHNICIAN',
   *   specialization: 'Engine Repair'
   * });
   */
  async createStaff(data: CreateStaffRequest): Promise<Staff> {
    const response = await api.post('/staff', data);
    return response.data.result || response.data;
  }

  /**
   * getAllStaff - Lấy danh sách tất cả nhân viên (Admin only)
   * @returns {Promise<Staff[]>} Danh sách staff
   * @example
   * const allStaff = await staffService.getAllStaff();
   */
  async getAllStaff(): Promise<Staff[]> {
    const response = await api.get('/staff');
    return response.data.result || response.data;
  }

  /**
   * getStaffById - Lấy chi tiết nhân viên theo ID (Admin only)
   * @param {string} staffId - UUID của staff
   * @returns {Promise<Staff>} Chi tiết staff
   * @example
   * const staff = await staffService.getStaffById('staff-uuid');
   */
  async getStaffById(staffId: string): Promise<Staff> {
    const response = await api.get(`/staff/${staffId}`);
    return response.data.result || response.data;
  }

  /**
   * updateStaff - Cập nhật thông tin nhân viên (Admin only)
   * @param {string} staffId - UUID của staff
   * @param {UpdateStaffRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Staff>} Staff sau khi update
   * @example
   * const updated = await staffService.updateStaff('staff-uuid', {
   *   salary: 15000000,
   *   specialization: 'Electric System'
   * });
   */
  async updateStaff(staffId: string, data: UpdateStaffRequest): Promise<Staff> {
    const response = await api.put(`/staff/${staffId}`, data);
    return response.data.result || response.data;
  }

  /**
   * deleteStaff - Xóa nhân viên (Admin only)
   * @param {string} staffId - UUID của staff
   * @returns {Promise} Message xác nhận
   * @example
   * await staffService.deleteStaff('staff-uuid');
   */
  async deleteStaff(staffId: string): Promise<{ message: string }> {
    const response = await api.delete(`/staff/${staffId}`);
    return response.data;
  }

  /**
   * getAvailableStaff - Lấy danh sách nhân viên rảnh (Staff/Admin)
   * @returns {Promise<Staff[]>} Danh sách staff available
   * @example
   * const available = await staffService.getAvailableStaff();
   */
  async getAvailableStaff(): Promise<Staff[]> {
    const response = await api.get('/staff/available');
    return response.data.result || response.data;
  }

  /**
   * getMyProfile - Lấy profile của staff hiện tại (Staff/Technician)
   * @returns {Promise<Staff>} Profile của staff đang đăng nhập
   * @example
   * const myProfile = await staffService.getMyProfile();
   */
  async getMyProfile(): Promise<Staff> {
    const response = await api.get('/staff/my-profile');
    return response.data.result || response.data;
  }

  /**
   * updateMyProfile - Cập nhật profile của staff hiện tại (Staff/Technician)
   * @param {UpdateStaffProfileRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Staff>} Profile sau khi update
   * @example
   * const updated = await staffService.updateMyProfile({
   *   phone: '0909999999',
   *   specialization: 'Battery System'
   * });
   */
  async updateMyProfile(data: UpdateStaffProfileRequest): Promise<Staff> {
    const response = await api.put('/staff/my-profile', data);
    return response.data.result || response.data;
  }

  /**
   * checkAvailability - Kiểm tra nhân viên có rảnh vào thời gian cụ thể không
   * @param {string} staffId - UUID của staff
   * @param {string} appointmentDate - Ngày giờ cần kiểm tra (ISO format)
   * @returns {Promise<boolean>} True nếu rảnh, false nếu bận
   * @example
   * const isAvailable = await staffService.checkAvailability(
   *   'staff-uuid',
   *   '2025-12-01T10:00:00Z'
   * );
   */
  async checkAvailability(staffId: string, appointmentDate: string): Promise<boolean> {
    console.log('Checking availability - Staff ID:', staffId);
    console.log('Checking availability - Appointment Date:', appointmentDate);
    
    const response = await api.get(`/staff/${staffId}/availability`, {
      params: { 
        appointmentDate: appointmentDate 
      }
    });
    return response.data.result;
  }
}

export default new StaffService();
