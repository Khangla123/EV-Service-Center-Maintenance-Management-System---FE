/**
 * User Service Module
 * Quản lý các API liên quan đến users và đăng ký tài khoản
 * @module services/userService
 */

import api from './api';

/**
 * User Interface
 * Định nghĩa cấu trúc dữ liệu của user
 * @interface User
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Register Request
 * Payload để đăng ký tài khoản mới
 * @interface RegisterRequest
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  
}

/**
 * Update User Request
 * Payload để cập nhật thông tin user
 * @interface UpdateUserRequest
 */
export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

/**
 * Update Role Request
 * Payload để cập nhật role của user (Admin only)
 * @interface UpdateRoleRequest
 */
export interface UpdateRoleRequest {
  role: string;
}

/**
 * UserService Class
 * Service layer quản lý users và đăng ký tài khoản
 * @class UserService
 */
class UserService {
  /**
   * register - Đăng ký tài khoản mới
   * Gọi endpoint /customers để tạo cả user + customer profile
   * Tự động parse tên tiếng Việt (lastName + firstName -> fullName)
   * @param {RegisterRequest} data - Thông tin đăng ký
   * @returns {Promise<User>} User vừa tạo
   * @example
   * const newUser = await userService.register({
   *   email: 'user@example.com',
   *   password: 'password123',
   *   firstName: 'Van A',
   *   lastName: 'Nguyen',
   *   phone: '0901234567'
   * });
   */
  async register(data: RegisterRequest): Promise<User> {
    // Map RegisterRequest to CustomerCreateRequest format
    const customerData = {
      email: data.email,
      fullName: `${data.lastName} ${data.firstName}`.trim(), // Combine lastName + firstName
      phone: data.phone,
      password: data.password, // Send the user's chosen password
    };
    
    const response = await api.post('/customers', customerData);
    
    // Backend returns CustomerResponse, map to User format
    const result = response.data.result || response.data;
    return {
      id: result.id,
      email: result.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: result.phone,
      role: 'customer',
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.createdAt)
    };
  }

  /**
   * getAllUsers - Lấy danh sách tất cả users (Admin only)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang
   * @param {number} params.size - Kích thước trang
   * @param {string} params.role - Filter theo role
   * @param {string} params.search - Từ khóa tìm kiếm
   * @returns {Promise} Danh sách users với pagination
   * @example
   * const result = await userService.getAllUsers({
   *   page: 1,
   *   size: 10,
   *   role: 'customer'
   * });
   */
  async getAllUsers(params?: {
    page?: number;
    size?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; page: number; size: number }> {
    const response = await api.get('/users/user', { params });
    return response.data;
  }

  /**
   * getUserById - Lấy thông tin user theo ID (Admin)
   * @param {string} userId - UUID của user
   * @returns {Promise<User>} Chi tiết user
   * @example
   * const user = await userService.getUserById('user-uuid');
   */
  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/users/user/${userId}`);
    return response.data;
  }

  /**
   * updateUser - Cập nhật thông tin user theo ID (Admin)
   * @param {string} userId - UUID của user
   * @param {UpdateUserRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<User>} User sau khi update
   * @example
   * const updated = await userService.updateUser('user-uuid', {
   *   phone: '0909999999'
   * });
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/user/${userId}`, data);
    return response.data;
  }

  /**
   * updateUserRole - Cập nhật role của user (Admin only)
   * @param {string} userId - UUID của user
   * @param {UpdateRoleRequest} data - Role mới
   * @returns {Promise<User>} User với role đã cập nhật
   * @example
   * const updated = await userService.updateUserRole('user-uuid', {
   *   role: 'STAFF'
   * });
   */
  async updateUserRole(userId: string, data: UpdateRoleRequest): Promise<User> {
    const response = await api.patch(`/users/user/${userId}/role`, data);
    return response.data;
  }

  /**
   * deleteUser - Xóa user theo ID (Admin only)
   * @param {string} userId - UUID của user cần xóa
   * @returns {Promise} Message xác nhận
   * @example
   * await userService.deleteUser('user-uuid');
   */
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/user/${userId}`);
    return response.data;
  }
}

export default new UserService();
