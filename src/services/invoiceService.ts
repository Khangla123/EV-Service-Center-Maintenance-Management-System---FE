import api from './api';

export interface InvoiceResponse {
  id: string;
  serviceOrderId: string;
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

export interface CreateInvoiceRequest {
  serviceOrderId: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  dueDate?: string;
  notes?: string;
}

export interface UpdateInvoiceRequest {
  totalAmount?: number;
  discount?: number;
  status?: string;
  paymentMethod?: string;
  dueDate?: string;
  notes?: string;
}

class InvoiceService {
  // Lấy danh sách tất cả invoices
  async getAllInvoices(): Promise<InvoiceResponse[]> {
    const response = await api.get('/invoices');
    return response.data.result || response.data;
  }

  // Tạo invoice mới
  async createInvoice(data: CreateInvoiceRequest): Promise<InvoiceResponse> {
    const response = await api.post('/invoices', data);
    return response.data.result || response.data;
  }

  // Lấy chi tiết invoice
  async getInvoiceById(invoiceId: string): Promise<InvoiceResponse> {
    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data.result || response.data;
  }

  // Cập nhật invoice
  async updateInvoice(invoiceId: string, data: UpdateInvoiceRequest): Promise<InvoiceResponse> {
    const response = await api.put(`/invoices/${invoiceId}`, data);
    return response.data.result || response.data;
  }

  // Lấy invoices của customer hiện tại
  async getMyInvoices(): Promise<InvoiceResponse[]> {
    const response = await api.get('/invoices/me');
    return response.data.result || response.data;
  }

  // Lấy invoices chưa thanh toán
  async getUnpaidInvoices(): Promise<InvoiceResponse[]> {
    const invoices = await this.getMyInvoices();
    return invoices.filter(invoice => invoice.status === 'PENDING' || invoice.status === 'OVERDUE');
  }
}

export default new InvoiceService();
