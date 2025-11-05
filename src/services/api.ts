import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base API URL - đảm bảo luôn là absolute URL
const getBaseURL = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) {
    // Đảm bảo URL là absolute
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
  }
  return 'http://localhost:8080/api';
};

const API_BASE_URL = getBaseURL();

// Tạo axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - thêm token vào header
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      
      // Redirect về login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Helper function để xử lý error message
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const response = error.response;
    
    // Lấy message từ backend nếu có
    if (response?.data?.message) {
      let message = response.data.message;
      
      // Xử lý message từ backend có format: "400 BAD_REQUEST 'Sai email hoặc mật khẩu'"
      // Lấy phần message trong dấu ngoặc đơn
      const match = message.match(/'([^']+)'/);
      if (match && match[1]) {
        return match[1];
      }
      
      // Nếu không có dấu ngoặc đơn, loại bỏ status code và BAD_REQUEST
      message = message.replace(/^\d+\s+[A-Z_]+\s+/i, '').trim();
      
      // Nếu message vẫn chứa "BAD_REQUEST" hoặc các status text khác
      if (message.match(/^(BAD_REQUEST|UNAUTHORIZED|FORBIDDEN|NOT_FOUND)/i)) {
        // Sử dụng message mặc định dựa trên status code
        if (response.status === 400 || response.status === 401) {
          return 'Sai email hoặc mật khẩu';
        }
      }
      
      return message;
    }
    
    // Xử lý các HTTP status code phổ biến với message thân thiện
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
    
    return error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  }
  return 'Có lỗi xảy ra. Vui lòng thử lại.';
};
