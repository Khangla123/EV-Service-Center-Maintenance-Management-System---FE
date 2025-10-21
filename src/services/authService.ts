import api from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

// Backend API Response wrapper
interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

// Backend LoginResponse (from backend)
interface BackendLoginResponse {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  accessToken: string;
}

// Frontend LoginResponse (for internal use)
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

class AuthService {
  // Đăng nhập
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<ApiResponse<BackendLoginResponse>>('/auth/login', credentials);
    
    // Backend trả về ApiResponse wrapper
    const backendData = response.data.result;
    
    if (!backendData || !backendData.accessToken) {
      throw new Error('Invalid response from server');
    }
    
    // Parse fullName thành firstName và lastName
    const nameParts = backendData.fullName ? backendData.fullName.split(' ') : ['', ''];
    const lastName = nameParts[0] || '';
    const firstName = nameParts.slice(1).join(' ') || nameParts[0] || '';
    
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

  // Đăng xuất
  async logout(): Promise<void> {
    try {
      await api.post<ApiResponse<void>>('/auth/logout');
    } finally {
      // Xóa token và user info khỏi localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  }

  // Quên mật khẩu - gửi OTP qua email
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<void>>('/auth/forgot-password', data);
    return { message: response.data.message };
  }

  // Xác thực OTP
  async verifyOtp(data: VerifyOtpRequest): Promise<{ message: string; valid: boolean }> {
    const response = await api.post<ApiResponse<void>>('/auth/verify-otp', data);
    return { message: response.data.message, valid: response.data.code === 1000 };
  }

  // Đặt lại mật khẩu
  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<void>>('/auth/reset-password', data);
    return { message: response.data.message };
  }

  // Lấy thông tin user hiện tại
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

  // Kiểm tra xem user đã đăng nhập chưa
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  // Lấy user info từ localStorage
  getUser(): LoginResponse['user'] | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Lấy token từ localStorage
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }
}

export default new AuthService();
