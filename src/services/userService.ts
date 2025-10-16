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
  // Đăng ký tài khoản mới
  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post('/users/register', data);
    return response.data;
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
