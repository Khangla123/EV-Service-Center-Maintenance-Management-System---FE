/**
 * api.ts - Axios HTTP Client Configuration
 * 
 * File cấu hình axios instance cho toàn bộ ứng dụng.
 * Bao gồm interceptors để xử lý authentication và errors.
 * 
 * Features:
 * - Tự động thêm JWT token vào headers
 * - Xử lý 401 Unauthorized (token hết hạn)
 * - Xử lý error messages thân thiện
 * - Set timeout và base URL
 * 
 * @module services/api
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * getBaseURL - Lấy base URL cho API
 * 
 * Ư tiên sử dụng REACT_APP_API_URL từ environment variables.
 * Nếu không có, fallback về localhost:8080.
 * 
 * @returns {string} Base URL cho API calls
 */
const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    // Đảm bảo URL là absolute (bắt đầu bằng http:// hoặc https://)
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
  }
  // Fallback to default local development URL
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getBaseURL();

/**
 * Axios Instance
 * 
 * Tạo một axios instance với cấu hình chung cho tất cả API calls.
 * 
 * Configuration:
 * - baseURL: API base URL
 * - timeout: 10 seconds (10000ms)
 * - headers: Default Content-Type application/json
 * - withCredentials: true - cho phép gửi cookies
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * Request Interceptor
 * 
 * Tự động thêm JWT token vào Authorization header cho mọi request.
 * Chạy trước khi mỗi API request được gửi đi.
 * 
 * Flow:
 * 1. Lấy accessToken từ localStorage
 * 2. Nếu có token -> thêm vào Authorization header
 * 3. Return config để tiếp tục request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    
    // Nếu có token và headers exist -> thêm Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    // Xử lý error khi cấu hình request
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Xử lý response và errors từ API.
 * Đặc biệt xử lý 401 Unauthorized (token hết hạn/không hợp lệ).
 * 
 * Flow:
 * - Success response: Trả về response nguyên bản
 * - Error response:
 *   + 401: Clear localStorage và redirect to login
 *   + Khác: Reject promise với error
 */
api.interceptors.response.use(
  (response) => {
    // Response thành công - trả về nguyên bản
    return response;
  },
  async (error: AxiosError) => {
    // Xử lý 401 Unauthorized - Token hết hạn hoặc không hợp lệ
    if (error.response?.status === 401) {
      // Xóa token và user data khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Redirect về trang login (tránh redirect nếu đã ở trang login)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Reject promise với error để caller có thể xử lý
    return Promise.reject(error);
  }
);

export default api;

/**
 * getErrorMessage - Helper function để xử lý và trích xuất error message
 * 
 * Chuyển đổi các error từ API thành các message thân thiện cho người dùng.
 * Xử lý cả Axios errors và generic errors.
 * 
 * @param {unknown} error - Error object cần xử lý
 * @returns {string} User-friendly error message
 * 
 * Xử lý các trường hợp:
 * - Backend trả về message có format đặc biệt (ví dụ: "400 BAD_REQUEST 'Message'")
 * - HTTP status codes phổ biến (400, 401, 403, 404, 409, 500, 503)
 * - Generic errors
 * 
 * @example
 * ```typescript
 * try {
 *   await api.post('/login', data);
 * } catch (error) {
 *   const message = getErrorMessage(error);
 *   console.error(message); // "Sai email hoặc mật khẩu"
 * }
 * ```
 */
export const getErrorMessage = (error: unknown): string => {
  // Kiểm tra xem có phải là Axios error không
  if (axios.isAxiosError(error)) {
    const response = error.response;
    
    // Xử lý message từ backend
    if (response?.data?.message) {
      let message = response.data.message;
      
      // Xử lý message có format: "400 BAD_REQUEST 'Sai email hoặc mật khẩu'"
      // Lấy phần message trong dấu ngoặc đơn
      const match = message.match(/'([^']+)'/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Nếu không có dấu ngoặc đơn, loại bỏ status code và status text
      message = message.replace(/^\d+\s+[A-Z_]+\s+/i, '').trim();
      
      // Nếu message vẫn chứa status text, sử dụng message mặc định
      if (message.match(/^(BAD_REQUEST|UNAUTHORIZED|FORBIDDEN|NOT_FOUND)/i)) {
        if (response.status === 400 || response.status === 401) {
          return 'Sai email hoặc mật khẩu';
        }
      }
      
      return message;
    }
    
    // Xử lý các HTTP status code với message thân thiện
    if (response?.status) {
      switch (response.status) {
        case 400:
          return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
        case 401:
          return 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
        case 403:
          return 'Bạn không có quyền truy cập.';
        case 404:
          return 'Không tìm thấy thông tin.';
        case 409:
          return 'Email này đã được đăng ký.';
        case 500:
          return 'Lỗi máy chủ. Vui lòng thử lại sau.';
        case 503:
          return 'Dịch vụ tạm thời không khả dụng.';
        default:
          return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      }
    }
    
    // Fallback error message
    return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
  
  // Generic error (không phải Axios error)
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};
