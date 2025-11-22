/**
 * AuthContext.tsx - Authentication Context
 * 
 * Context quản lý toàn bộ authentication state và logic của ứng dụng.
 * Sử dụng React Context API và useReducer để quản lý state phc tạp.
 * 
 * Chức năng chính:
 * - Quản lý trạng thái đăng nhập/đăng xuất
 * - Lưu trữ token và thông tin user
 * - Tự động khôi phục session từ localStorage
 * - Xử lý đăng ký user mới
 * - Quản lý error messages
 * 
 * @module AuthContext
 */

// React core imports
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Type imports - Định nghĩa kiểu dữ liệu
import { User, AuthState, UserRole } from '../types';

// Service imports - Gọi API
import authService from '../services/authService';
import userService from '../services/userService';
import { getErrorMessage } from '../services/api';

/**
 * AuthContextType - Kiểu dữ liệu cho AuthContext
 * 
 * Định nghĩa các properties và methods mà AuthContext cung cấp.
 * 
 * @interface AuthContextType
 * @property {AuthState} state - Trạng thái authentication hiện tại
 * @property {Function} login - Hàm đăng nhập
 * @property {Function} logout - Hàm đăng xuất
 * @property {Function} register - Hàm đăng ký
 * @property {Function} clearError - Hàm xóa error message
 */
interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  clearError: () => void;
}

/**
 * RegisterData - Dữ liệu đăng ký user mới
 * 
 * @interface RegisterData
 * @property {string} firstName - Tên
 * @property {string} lastName - Họ
 * @property {string} email - Email
 * @property {string} phone - Số điện thoại
 * @property {string} password - Mật khẩu
 * @property {UserRole} role - Vai trò của user
 */
interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

/**
 * AuthAction - Các action types cho reducer
 * 
 * Discriminated union type cho tất cả các actions có thể dispatch.
 * 
 * Actions:
 * - LOGIN_START: Bắt đầu quá trình đăng nhập
 * - LOGIN_SUCCESS: Đăng nhập thành công
 * - LOGIN_FAILURE: Đăng nhập thất bại
 * - LOGOUT: Đăng xuất
 * - LOAD_USER: Khôi phục user từ localStorage
 * - CLEAR_ERROR: Xóa error message
 */
type AuthAction = 
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload?: string }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_ERROR' };

/**
 * Initial state cho AuthContext
 * Trạng thái ban đầu khi chưa có user đăng nhập
 */
const initialState: AuthState = {
  user: null,                // Chưa có user
  token: null,               // Chưa có token
  isAuthenticated: false,    // Chưa đăng nhập
  isLoading: false,          // Không đang loading
  error: null                // Không có error
};

/**
 * authReducer - Reducer function quản lý auth state
 * 
 * Xử lý các actions để cập nhật state một cách immutable.
 * Sử dụng pattern reducer để quản lý state phc tạp.
 * 
 * @param {AuthState} state - State hiện tại
 * @param {AuthAction} action - Action được dispatch
 * @returns {AuthState} State mới sau khi áp dụng action
 */
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    // Bắt đầu đăng nhập - set loading = true, clear error
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    // Đăng nhập thành công - lưu user và token, set authenticated = true
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    // Đăng nhập thất bại - clear user/token, set error message
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload || 'Đăng nhập thất bại'
      };
    
    // Đăng xuất - reset về initial state
    case 'LOGOUT':
      return initialState;
    
    // Load user từ localStorage - khôi phục session
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    // Xóa error message
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    // Default case - trả về state hiện tại
    default:
      return state;
  }
};

/**
 * AuthContext - Context object
 * Cung cấp auth state và methods cho toàn bộ component tree
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 * 
 * Custom hook để sử dụng AuthContext trong components.
 * Tự động kiểm tra xem hook có được sử dụng trong AuthProvider không.
 * 
 * @throws {Error} Nếu sử dụng ngoài AuthProvider
 * @returns {AuthContextType} Auth context value
 * 
 * @example
 * ```tsx
 * const { state, login, logout } = useAuth();
 * 
 * if (state.isAuthenticated) {
 *   // User đã đăng nhập
 * }
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProviderProps - Props cho AuthProvider
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Provider component cung cấp auth context cho toàn bộ component tree.
 * Bao bọc toàn bộ ứng dụng để cho phép tất cả components truy cập auth state.
 * 
 * Features:
 * - Tự động khôi phục session từ localStorage khi app load
 * - Cung cấp login/logout/register methods
 * - Quản lý token và user state
 * 
 * @param {AuthProviderProps} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Khởi tạo reducer với initialState
  const [state, dispatch] = useReducer(authReducer, initialState);

  /**
   * Effect: Khôi phục session từ localStorage khi app load
   * Chạy một lần khi component mount
   */
  useEffect(() => {
    // Kiểm tra xem có token và user data trong localStorage không
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        // Parse user data từ JSON string
        const user = JSON.parse(userData);
        // Dispatch action để khôi phục user state
        dispatch({ type: 'LOAD_USER', payload: { user, token } });
      } catch (error) {
        // Nếu parse thất bại, xóa data bị lỗi
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  /**
   * login - Hàm xử lý đăng nhập
   * 
   * Gọi API để authenticate user và lưu token + user info.
   * Token và user data được lưu vào localStorage và state.
   * 
   * @param {string} email - Email của user
   * @param {string} password - Mật khẩu
   * @returns {Promise<boolean>} true nếu thành công, false nếu thất bại
   * 
   * Flow:
   * 1. Dispatch LOGIN_START - bắt đầu loading
   * 2. Gọi authService.login() API
   * 3. Nếu thành công: dispatch LOGIN_SUCCESS với user & token
   * 4. Nếu thất bại: dispatch LOGIN_FAILURE với error message
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    // Bắt đầu quá trình đăng nhập
    dispatch({ type: 'LOGIN_START' });

    try {
      // Gọi API để authenticate
      const response = await authService.login({ email, password });
      
      // Chuyển đổi response sang kiểu User
      const user: User = {
        id: response.user.id,
        email: response.user.email,
        firstName: response.user.firstName,
        lastName: response.user.lastName,
        phone: response.user.phone,
        role: response.user.role as UserRole,
        avatar: response.user.avatar,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Dispatch success action với user và token
      // authService.login tự động lưu vào localStorage
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user, token: response.token } 
      });
      return true;
    } catch (error) {
      // Xử lý error và lấy error message thân thiện
      const errorMessage = getErrorMessage(error);
      // Dispatch failure action với error message
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  /**
   * register - Hàm xử lý đăng ký user mới
   * 
   * Gọi API để tạo user mới, sau đó tự động đăng nhập.
   * 
   * @param {RegisterData} userData - Thông tin đăng ký
   * @returns {Promise<boolean>} true nếu thành công, false nếu thất bại
   * 
   * Flow:
   * 1. Dispatch LOGIN_START
   * 2. Gọi userService.register() API
   * 3. Nếu thành công: gọi login() để tự động đăng nhập
   * 4. Nếu thất bại: dispatch LOGIN_FAILURE
   */
  const register = async (userData: RegisterData): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // Gọi API để đăng ký user mới
      await userService.register({
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone
      });

      // Sau khi đăng ký thành công, tự động đăng nhập
      return await login(userData.email, userData.password);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return false;
    }
  };

  /**
   * logout - Hàm xử lý đăng xuất
   * 
   * Gọi API logout (nếu có) và clear toàn bộ auth state.
   * Xóa token và user data khỏi localStorage.
   * 
   * Lưu ý: Luôn dispatch LOGOUT action dù API có lỗi hay không,
   * để đảm bảo client-side state được clear.
   */
  const logout = async () => {
    try {
      // Gọi API logout (invalidate token trên server)
      await authService.logout();
    } catch (error) {
      // Bỏ qua lỗi khi logout - vẫn tiếp tục clear state
      console.error('Logout error:', error);
    } finally {
      // Luôn dispatch LOGOUT để clear state
      // authService.logout tự động clear localStorage
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * clearError - Hàm xóa error message
   * 
   * Sử dụng khi muốn clear error message khỏi state,
   * ví dụ: khi user bắt đầu nhập lại form.
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    register,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};