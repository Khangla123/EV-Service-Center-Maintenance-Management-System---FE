/**
 * authService.ts - Authentication Service
 * 
 * Service xử lý tất cả các API calls liên quan đến authentication.
 * Bao gồm login, logout, forgot password, reset password, v.v.
 * 
 * Features:
 * - Login và logout
 * - Forgot password flow (OTP-based)
 * - Password reset
 * - Get current user info
 * - Token management (localStorage)
 * - Name parsing (Vietnamese format)
 * 
 * @module services/authService
 */

import api from './api';

/**
 * LoginRequest - Dữ liệu đăng nhập
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * ApiResponse - Wrapper response từ backend API
 * 
 * @template T - Kiểu dữ liệu của result
 */
interface ApiResponse<T> {
  code: number;      // Response code (1000 = success)
  message: string;   // Response message
  result: T;         // Actual data
}

/**
 * BackendLoginResponse - Response từ backend login API
 */
interface BackendLoginResponse {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  accessToken: string;
}

/**
 * LoginResponse - Response format cho frontend
 * 
 * Đã parse và format lại từ backend response.
 */
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: string;
    avatar?: string;
  };
}

/**
 * ForgotPasswordRequest - Dữ liệu gửi OTP qua email
 */
export interface ForgotPasswordRequest {
  email: string;
}

/**
 * VerifyOtpRequest - Dữ liệu xác thực OTP
 */
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

/**
 * ResetPasswordRequest - Dữ liệu đặt lại mật khẩu
 */
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

/**
 * AuthService Class
 * 
 * Service class quản lý tất cả authentication operations.
 * Sử dụng singleton pattern (export instance).
 */
class AuthService {
  /**
   * login - Đăng nhập vào hệ thống
   * 
   * Gọi API login, parse response, và lưu token + user info vào localStorage.
   * Tự động parse fullName thành firstName và lastName (Vietnamese format).
   * 
   * @param {LoginRequest} credentials - Email và password
   * @returns {Promise<LoginResponse>} Token và user info
   * @throws {Error} Nếu response không hợp lệ
   * 
   * @example
   * ```typescript
   * const response = await authService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   * console.log(response.token); // JWT token
   * ```
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<BackendLoginResponse>>('/auth/login', credentials);
    
    // Backend trả về ApiResponse wrapper
    const backendData = response.data.result;
    
    // Validate response data
    if (!backendData || !backendData.accessToken) {
      throw new Error('Invalid response from server');
    }
    
    // Parse fullName thành firstName và lastName
    // Format Việt Nam: "Nguyễn Văn A" -> lastName="Nguyễn Văn", firstName="A"
    const nameParts = backendData.fullName ? backendData.fullName.split(' ') : ['', ''];
    const lastName = nameParts[0] || '';  // Phần đầu tiên là họ
    const firstName = nameParts.slice(1).join(' ') || nameParts[0] || '';  // Phần còn lại là tên
    
    // Convert backend response to frontend format
    const loginResponse: LoginResponse = {
      token: backendData.accessToken,
      user: {
        id: backendData.userId,
        email: backendData.email,
        firstName: firstName,
        lastName: lastName,
        role: backendData.role,
      }
    };
    
    // Lưu token và user info vào localStorage
    localStorage.setItem('accessToken', loginResponse.token);
    localStorage.setItem('user', JSON.stringify(loginResponse.user));
    
    return loginResponse;
  }

  /**
   * logout - Đăng xuất khỏi hệ thống
   * 
   * Gọi API logout và clear localStorage.
   * Luôn clear localStorage dù API có lỗi.
   * 
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    try {
      await api.post<ApiResponse<void>>('/auth/logout');
    } finally {
      // Luôn xóa token và user info
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * forgotPassword - Gửi OTP qua email để reset mật khẩu
   * 
   * @param {ForgotPasswordRequest} data - Email cần reset
   * @returns {Promise<{message: string}>} Success message
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password', data);
    return { message: response.data.message };
  }

  /**
   * verifyOtp - Xác thực OTP đã gửi qua email
   * 
   * @param {VerifyOtpRequest} data - Email và OTP code
   * @returns {Promise<{message: string, valid: boolean}>} Kết quả xác thực
   */
  async verifyOtp(data: VerifyOtpRequest): Promise<{ message: string; valid: boolean }> {
    const response = await api.post<ApiResponse<void>>('/auth/verify-otp', data);
    return { message: response.data.message, valid: response.data.code === 1000 };
  }

  /**
   * resetPassword - Đặt lại mật khẩu mới
   * 
   * Phải verify OTP trước khi gọi API này.
   * 
   * @param {ResetPasswordRequest} data - Email, OTP và mật khẩu mới
   * @returns {Promise<{message: string}>} Success message
   */
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', data);
    return { message: response.data.message };
  }

  /**
   * getCurrentUser - Lấy thông tin user hiện tại từ API
   * 
   * Update lại user info trong localStorage với data mới nhất từ server.
   * Preserve user ID từ localStorage vì backend không trả về.
   * 
   * @returns {Promise<LoginResponse['user']>} User info
   * @throws {Error} Nếu response invalid
   */
  async getCurrentUser(): Promise<LoginResponse['user']> {
    interface MeResponse {
      email: string;
      fullName: string;
      role: string;
      phone?: string;
    }
    
    const response = await api.get<ApiResponse<MeResponse>>('/auth/me');
    
    // Backend trả về ApiResponse wrapper
    const backendData = response.data.result;
    
    if (!backendData) {
      throw new Error('Invalid response from server');
    }
    
    // Parse fullName thành firstName và lastName
    const nameParts = backendData.fullName ? backendData.fullName.split(' ') : ['', ''];
    const lastName = nameParts[0] || '';
    const firstName = nameParts.slice(1).join(' ') || nameParts[0] || '';
    
    // Get existing user from localStorage to preserve id
    const existingUser = this.getUser();
    
    const user = {
      id: existingUser?.id || '', // Preserve existing id
      email: backendData.email,
      firstName: firstName,
      lastName: lastName,
      phone: backendData.phone,
      role: backendData.role,
    };
    
    // Cập nhật user info trong localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  }

  /**
   * isAuthenticated - Kiểm tra xem user có đăng nhập không
   * 
   * Kiểm tra bằng cách xem có token trong localStorage.
   * 
   * @returns {boolean} true nếu có token
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  /**
   * getUser - Lấy user info từ localStorage
   * 
   * @returns {LoginResponse['user'] | null} User info hoặc null nếu không có
   */
  getUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * getToken - Lấy JWT token từ localStorage
   * 
   * @returns {string | null} Token hoặc null nếu không có
   */
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

/**
 * Export singleton instance
 * Sử dụng trong toàn bộ app: import authService from './authService'
 */
export default new AuthService();
