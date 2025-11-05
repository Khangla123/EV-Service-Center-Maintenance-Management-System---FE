import api from './api';

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

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface UpdateRoleRequest {
  role: string;
}

class UserService {
  // Đăng ký tài khoản mới - gọi endpoint /customers để tạo cả user + customer
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

  // Lấy danh sách tất cả users (admin)
  async getAllUsers(params?: {
    page?: number;
    size?: number;
    role?: string;
    search?: string;
  }): Promise<{ users: User[]; total: number; page: number; size: number }> {
    const response = await api.get('/users/user', { params });
    return response.data;
  }

  // Lấy thông tin user theo ID
  async getUserById(userId: string): Promise<User> {
    const response = await api.get(`/users/user/${userId}`);
    return response.data;
  }

  // Cập nhật thông tin user theo ID
  async updateUser(userId: string, data: UpdateUserRequest): Promise<User> {
    const response = await api.put(`/users/user/${userId}`, data);
    return response.data;
  }

  // Cập nhật role của user (admin)
  async updateUserRole(userId: string, data: UpdateRoleRequest): Promise<User> {
    const response = await api.patch(`/users/user/${userId}/role`, data);
    return response.data;
  }

  // Xóa user theo ID (admin)
  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/user/${userId}`);
    return response.data;
  }
}

export default new UserService();
