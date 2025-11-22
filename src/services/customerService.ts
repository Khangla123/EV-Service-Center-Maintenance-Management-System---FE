/**
 * Customer Service Module
 * Quản lý các API liên quan đến customer (khách hàng)
 * @module services/customerService
 */

import api from './api';

/**
 * Customer Interface
 * Định nghĩa cấu trúc dữ liệu của customer
 * @interface Customer
 */
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

/**
 * Create Customer Request
 * Payload để tạo customer mới
 * @interface CreateCustomerRequest
 */
export interface CreateCustomerRequest {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
}

/**
 * Update Customer Request
 * Payload để cập nhật thông tin customer
 * @interface UpdateCustomerRequest
 */
export interface UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * CustomerService Class
 * Service layer để xử lý các API calls liên quan đến customers
 * @class CustomerService
 */
class CustomerService {
  /**
   * getAllCustomers - Lấy danh sách tất cả khách hàng (Admin)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Số trang
   * @param {number} params.size - Kích thước trang
   * @param {string} params.search - Từ khóa tìm kiếm
   * @returns {Promise} Page object chứa danh sách customers
   * @example
   * const customersPage = await customerService.getAllCustomers({
   *   page: 0,
   *   size: 10,
   *   search: 'nguyen'
   * });
   */
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

  /**
   * createCustomer - Tạo khách hàng mới (Admin)
   * @param {CreateCustomerRequest} data - Thông tin customer cần tạo
   * @returns {Promise<Customer>} Customer vừa được tạo
   * @example
   * const customer = await customerService.createCustomer({
   *   userId: 'user-uuid',
   *   firstName: 'Nguyen',
   *   lastName: 'Van A',
   *   email: 'nguyenvana@example.com'
   * });
   */
  async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
    const response = await api.post('/customers', data);
    return response.data;
  }

  /**
   * getCustomerById - Lấy chi tiết khách hàng theo ID (Admin)
   * @param {string} customerId - UUID của customer
   * @returns {Promise<Customer>} Chi tiết customer
   * @example
   * const customer = await customerService.getCustomerById('customer-uuid');
   */
  async getCustomerById(customerId: string): Promise<Customer> {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  }

  /**
   * updateCustomer - Cập nhật thông tin khách hàng (Admin)
   * @param {string} customerId - UUID của customer
   * @param {UpdateCustomerRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Customer>} Customer sau khi update
   * @example
   * const updated = await customerService.updateCustomer('customer-uuid', {
   *   phone: '0901234567',
   *   address: 'Ho Chi Minh City'
   * });
   */
  async updateCustomer(customerId: string, data: UpdateCustomerRequest): Promise<Customer> {
    const response = await api.put(`/customers/${customerId}`, data);
    return response.data;
  }

  /**
   * getMyProfile - Lấy hồ sơ của customer hiện tại
   * Customer tự xem thông tin cá nhân của mình
   * @returns {Promise<Customer>} Profile của customer hiện tại
   * @example
   * const myProfile = await customerService.getMyProfile();
   */
  async getMyProfile(): Promise<Customer> {
    const response = await api.get('/customers/me');
    // Backend trả về format: {message: string, result: Customer}
    return response.data.result || response.data;
  }

  /**
   * updateMyProfile - Cập nhật hồ sơ cá nhân (Customer)
   * Customer tự cập nhật thông tin của mình
   * @param {UpdateCustomerRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<Customer>} Profile sau khi update
   * @example
   * const updated = await customerService.updateMyProfile({
   *   phone: '0901234567'
   * });
   */
  async updateMyProfile(data: UpdateCustomerRequest): Promise<Customer> {
    const response = await api.put('/customers/me', data);
    return response.data;
  }
}

export default new CustomerService();
