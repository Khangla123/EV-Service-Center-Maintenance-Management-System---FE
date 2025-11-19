import api from './api';

export interface Customer {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;  // API trả về fullName
  username?: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role?: string;
  active?: boolean;
  emailVerified?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  dateOfBirth?: Date | string;
  lastLogin?: Date | string;
  subscriptionExpiry?: Date | string;
  totalSpent?: number;
}

export interface CreateCustomerRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

class CustomerService {
  // Lấy danh sách khách hàng
  async getAllCustomers(params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<any> {
    const response = await api.get('/customers', { params });
    // Backend returns: {message: string, result: Page<CustomerResponse>}
    // Page contains: {content: Customer[], totalElements, totalPages, size, number}
    return response.data.result || response.data;
  }

  // Tạo khách hàng mới
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data;
  }

  // Lấy chi tiết khách hàng theo ID
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  }

  // Cập nhật thông tin khách hàng
  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    const response = await api.put(`/customers/${customerId}`, data);
    return response.data;
  }

  // Lấy hồ sơ khách hàng hiện tại (customer tự xem)
  async getMyProfile(): Promise<Customer> {
    const response = await api.get('/customers/me');
    // Backend trả về format: {message: string, result: Customer}
    return response.data.result || response.data;
  }

  // Cập nhật hồ sơ của tôi (customer tự cập nhật)
  async updateMyProfile(data: UpdateCustomerRequest): Promise<Customer> {
    const response = await api.put('/customers/me', data);
    return response.data;
  }
}

export default new CustomerService();
