import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'VNPAY' | 'MOMO' | 'ZALOPAY' | 'BANK_TRANSFER';
  enabled: boolean;
  description?: string;
}

export interface CreatePaymentRequest {
  invoiceId: string;
  amount: number;
  orderInfo?: string;
  paymentMethod?: string;
}

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

export interface VNPayPaymentUrlResponse {
  paymentUrl: string;
}

class PaymentService {
  // Lấy danh sách tất cả payments
  async getAllPayments(): Promise<PaymentResponse[]> {
    const response = await api.get('/payments');
    return response.data.result || response.data;
  }

  // Tạo payment mới
  async createPayment(data: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await api.post('/payments', data);
    return response.data.result || response.data;
  }

  // Lấy chi tiết payment
  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data.result || response.data;
  }

  // Lấy các phương thức thanh toán có sẵn
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

  // Tạo URL thanh toán VNPay
  async createVNPayPaymentUrl(
    invoiceId: string,
    amount: number,
    orderInfo?: string
  ): Promise<string> {
    const params = new URLSearchParams({
      invoiceId,
      amount: amount.toString(),
      ...(orderInfo && { orderInfo })
    });

    const response = await api.post(`/payments/vnpay/create?${params.toString()}`);
    return response.data.result || response.data;
  }

  // Xử lý callback từ VNPay
  async handleVNPayCallback(queryParams: Record<string, string>): Promise<PaymentResponse> {
    const params = new URLSearchParams(queryParams);
    const response = await api.get(`/payments/vnpay/callback?${params.toString()}`);
    return response.data.result || response.data;
  }

  // Xác nhận payment (cho staff/admin)
  async verifyPayment(paymentId: string, verified: boolean): Promise<PaymentResponse> {
    const response = await api.put(`/payments/${paymentId}/verify`, { verified });
    return response.data.result || response.data;
  }

  // ========== MOCK PAYMENT METHODS (Thanh toán giả lập) ==========

  // Tạo URL thanh toán giả lập (mock payment)
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

  // Xử lý callback từ mock payment
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
