/**
 * Invoice Service Module
 * Quản lý các API liên quan đến invoices (hóa đơn)
 * @module services/invoiceService
 */

import api from './api';

/**
 * Invoice Response Interface
 * Định nghĩa cấu trúc dữ liệu của hóa đơn
 * @interface InvoiceResponse
 */
export interface InvoiceResponse {
  id: string;
  serviceOrderId: string;
  appointmentId?: string;
  customerId: string;
  customerName?: string;
  vehicleId?: string;
  vehicleLicensePlate?: string;
  invoiceNumber?: string;
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';
  paymentMethod?: string;
  paymentStatus?: string;
  issueDate: string;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Create Invoice Request
 * Payload để tạo hóa đơn mới
 * @interface CreateInvoiceRequest
 */
export interface CreateInvoiceRequest {
  serviceOrderId: string;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string;
}

/**
 * Update Invoice Request
 * Payload để cập nhật hóa đơn
 * @interface UpdateInvoiceRequest
 */
export interface UpdateInvoiceRequest {
  totalAmount?: number;
  discount?: number;
  status?: string;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
}

/**
 * InvoiceService Class
 * Service layer quản lý hóa đơn và thanh toán
 * @class InvoiceService
 */
class InvoiceService {
  /**
   * getAllInvoices - Lấy danh sách tất cả invoices (Admin/Staff)
   * @returns {Promise<InvoiceResponse[]>} Danh sách hóa đơn
   * @example
   * const invoices = await invoiceService.getAllInvoices();
   */
  async getAllInvoices(): Promise<InvoiceResponse[]> {
    const response = await api.get('/invoices');
    return response.data.result || response.data;
  }

  /**
   * createInvoice - Tạo hóa đơn mới từ service order
   * @param {CreateInvoiceRequest} data - Thông tin hóa đơn
   * @returns {Promise<InvoiceResponse>} Hóa đơn vừa tạo
   * @example
   * const invoice = await invoiceService.createInvoice({
   *   serviceOrderId: 'order-uuid',
   *   subtotal: 1000000,
   *   taxAmount: 100000,
   *   discountAmount: 50000
   * });
   */
  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceResponse> {
    const response = await api.post('/invoices', data);
    return response.data.result || response.data;
  }

  /**
   * getInvoiceById - Lấy chi tiết hóa đơn theo ID
   * @param {string} invoiceId - UUID của invoice
   * @returns {Promise<InvoiceResponse>} Chi tiết hóa đơn
   * @example
   * const invoice = await invoiceService.getInvoiceById('invoice-uuid');
   */
  async getInvoiceById(invoiceId: string): Promise<InvoiceResponse> {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data.result || response.data;
  }

  /**
   * updateInvoice - Cập nhật hóa đơn (Staff/Admin)
   * @param {string} invoiceId - UUID của invoice
   * @param {UpdateInvoiceRequest} data - Dữ liệu cần cập nhật
   * @returns {Promise<InvoiceResponse>} Hóa đơn sau khi update
   * @example
   * const updated = await invoiceService.updateInvoice('invoice-uuid', {
   *   status: 'PAID',
   *   paymentMethod: 'VNPAY'
   * });
   */
  async updateInvoice(invoiceId: string, data: UpdateInvoiceRequest): Promise<InvoiceResponse> {
    const response = await api.put(`/invoices/${invoiceId}`, data);
    return response.data.result || response.data;
  }

  /**
   * getMyInvoices - Lấy danh sách hóa đơn của customer hiện tại
   * @returns {Promise<InvoiceResponse[]>} Danh sách invoices của customer
   * @example
   * const myInvoices = await invoiceService.getMyInvoices();
   */
  async getMyInvoices(): Promise<InvoiceResponse[]> {
    const response = await api.get('/invoices/me');
    return response.data.result || response.data;
  }

  /**
   * getUnpaidInvoices - Lấy danh sách hóa đơn chưa thanh toán
   * Filter các invoices có status PENDING hoặc OVERDUE
   * @returns {Promise<InvoiceResponse[]>} Danh sách invoices chưa thanh toán
   * @example
   * const unpaid = await invoiceService.getUnpaidInvoices();
   * // Hiển thị cảnh báo cho customer
   */
  async getUnpaidInvoices(): Promise<InvoiceResponse[]> {
    const invoices = await this.getMyInvoices();
    return invoices.filter(invoice => invoice.status === 'PENDING' || invoice.status === 'OVERDUE');
  }
}

export default new InvoiceService();
