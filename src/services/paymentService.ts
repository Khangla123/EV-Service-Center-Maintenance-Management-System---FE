/**
 * Payment Service Module
 * Quản lý các API liên quan đến payment (thanh toán) và tích hợp cổng thanh toán
 * @module services/paymentService
 */

import api from './api';

/**
 * Payment Method Interface
 * Định nghĩa các phương thức thanh toán hỗ trợ
 * @interface PaymentMethod
 */
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER';
  enabled: boolean;
  description?: string;
}

/**
 * Create Payment Request
 * Payload để tạo payment mới
 * @interface CreatePaymentRequest
 */
export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  orderInfo?: string;
  paymentMethod?: string;
}

/**
 * Payment Response Interface
 * Thông tin chi tiết của payment
 * @interface PaymentResponse
 */
export interface PaymentResponse {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';
  transactionId?: string;
  paymentDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * VNPay Payment URL Response
 * Response chứa URL chuyển hướng đến cổng thanh toán VNPay
 * @interface VNPayPaymentUrlResponse
 */
export interface VNPayPaymentUrlResponse {
  paymentUrl: string;
}

/**
 * PaymentService Class
 * Service layer xử lý thanh toán và tích hợp cổng thanh toán (VNPay, Mock)
 * @class PaymentService
 */
class PaymentService {
  /**
   * getAllPayments - Lấy danh sách tất cả payments
   * @returns {Promise<PaymentResponse[]>} Danh sách payments
   * @example
   * const payments = await paymentService.getAllPayments();
   */
  async getAllPayments(): Promise<PaymentResponse[]> {
    const response = await api.get('/payments');
    return response.data.result || response.data;
  }

  /**
   * createPayment - Tạo payment mới
   * @param {CreatePaymentRequest} data - Thông tin payment
   * @returns {Promise<PaymentResponse>} Payment vừa tạo
   * @example
   * const payment = await paymentService.createPayment({
   *   invoiceId: 'invoice-uuid',
   *   amount: 1000000,
   *   paymentMethod: 'VNPAY'
   * });
   */
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await api.post('/payments', data);
    return response.data.result || response.data;
  }

  /**
   * getPaymentById - Lấy chi tiết payment theo ID
   * @param {string} paymentId - UUID của payment
   * @returns {Promise<PaymentResponse>} Chi tiết payment
   * @example
   * const payment = await paymentService.getPaymentById('payment-uuid');
   */
  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data.result || response.data;
  }

  /**
   * getAvailablePaymentMethods - Lấy danh sách phương thức thanh toán khả dụng
   * Nếu API lỗi, trả về default payment methods (VNPay)
   * @returns {Promise<PaymentMethod[]>} Danh sách payment methods
   * @example
   * const methods = await paymentService.getAvailablePaymentMethods();
   */
  async getAvailablePaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/payments/methods');
      return response.data.result || response.data;
    } catch (error) {
      console.error('Error loading payment methods:', error);
      // Return default payment methods if API fails
      return [
        {
          id: 'vnpay',
          name: 'VNPay',
          type: 'VNPAY',
          enabled: true,
          description: 'Cổng thanh toán VNPay'
        }
      ];
    }
  }

  /**
   * createVNPayPaymentUrl - Tạo URL thanh toán VNPay
   * Gọi API backend để tạo signed payment URL, sau đó redirect customer đến VNPay
   * @param {string} invoiceId - UUID của invoice
   * @param {number} amount - Số tiền thanh toán (VND)
   * @param {string} orderInfo - Thông tin đơn hàng (optional)
   * @returns {Promise<string>} URL chuyển hướng đến VNPay
   * @example
   * const paymentUrl = await paymentService.createVNPayPaymentUrl(
   *   'invoice-uuid',
   *   1000000,
   *   'Thanh toan hoa don dich vu'
   * );
   * window.location.href = paymentUrl;
   */
  async createVNPayPaymentUrl(
    invoiceId: string,
    amount: number,
    orderInfo?: string
  ): Promise<string> {
    try {
      const params = new URLSearchParams({
        invoiceId,
        amount: amount.toString(),
        ...(orderInfo && { orderInfo })
      });

      console.log('Creating VNPay payment URL with params:', {
        invoiceId,
        amount,
        orderInfo,
        fullUrl: `/payments/vnpay/create?${params.toString()}`
      });

      const response = await api.post(`/payments/vnpay/create?${params.toString()}`);
      
      console.log('VNPay payment URL response:', response.data);
      
      return response.data.result || response.data;
    } catch (error: any) {
      console.error('Error creating VNPay payment URL:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  }

  /**
   * handleVNPayCallback - Xử lý callback từ VNPay sau khi thanh toán
   * VNPay redirect về với query params chứa thông tin giao dịch
   * @param {Record<string, string>} queryParams - Query parameters từ VNPay
   * @returns {Promise<PaymentResponse>} Kết quả xử lý payment
   * @example
   * const urlParams = new URLSearchParams(window.location.search);
   * const params = Object.fromEntries(urlParams);
   * const result = await paymentService.handleVNPayCallback(params);
   */
  async handleVNPayCallback(queryParams: Record<string, string>): Promise<PaymentResponse> {
    const params = new URLSearchParams(queryParams);
    const response = await api.get(`/payments/vnpay/callback?${params.toString()}`);
    return response.data.result || response.data;
  }

  /**
   * verifyPayment - Xác nhận payment (cho staff/admin)
   * @param {string} paymentId - UUID của payment
   * @param {boolean} verified - True nếu xác nhận, false nếu từ chối
   * @returns {Promise<PaymentResponse>} Payment sau khi verify
   * @example
   * const verified = await paymentService.verifyPayment('payment-uuid', true);
   */
  async verifyPayment(paymentId: string, verified: boolean): Promise<PaymentResponse> {
    const response = await api.put(`/payments/${paymentId}/verify`, { verified });
    return response.data.result || response.data;
  }

  // ========== MOCK PAYMENT METHODS (Thanh toán giả lập) ==========

  /**
   * createMockPaymentUrl - Tạo URL thanh toán giả lập (cho testing/development)
   * Không kết nối với cổng thanh toán thật, chỉ để test flow
   * @param {string} invoiceId - UUID của invoice
   * @param {number} amount - Số tiền
   * @param {string} orderInfo - Thông tin đơn hàng
   * @returns {Promise<string>} URL chuyển hướng mock
   * @example
   * const mockUrl = await paymentService.createMockPaymentUrl(
   *   'invoice-uuid',
   *   1000000,
   *   'Test payment'
   * );
   */
  async createMockPaymentUrl(
    invoiceId: string,
    amount: number,
    orderInfo?: string
  ): Promise<string> {
    const params = new URLSearchParams({
      invoiceId,
      amount: amount.toString(),
      ...(orderInfo && { orderInfo })
    });

    const response = await api.post(`/payments/mock/create?${params.toString()}`);
    return response.data.result || response.data;
  }

  /**
   * handleMockCallback - Xử lý callback từ mock payment
   * @param {string} txnRef - Mã tham chiếu giao dịch
   * @param {boolean} success - Trạng thái thanh toán (true = thành công)
   * @returns {Promise<PaymentResponse>} Kết quả payment
   * @example
   * const result = await paymentService.handleMockCallback('TXN123', true);
   */
  async handleMockCallback(txnRef: string, success: boolean): Promise<PaymentResponse> {
    const params = new URLSearchParams({
      txnRef,
      success: success.toString()
    });
    const response = await api.post(`/payments/mock/callback?${params.toString()}`);
    return response.data.result || response.data;
  }
}

export default new PaymentService();
