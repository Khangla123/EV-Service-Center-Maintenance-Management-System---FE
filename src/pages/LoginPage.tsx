/**
 * LoginPage.tsx - User Login Page
 * 
 * Trang đăng nhập của ứng dụng.
 * Xử lý authentication và redirect dựa trên user role.
 * 
 * Features:
 * - Form validation (email và password)
 * - Show/hide password
 * - Error handling và hiển thị error messages
 * - Remember me checkbox
 * - Forgot password link
 * - Auto redirect sau khi login thành công
 * - Role-based navigation (Customer/Staff/Technician/Admin)
 * 
 * @module pages/LoginPage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MDButton, MDTextField, MDCard } from '../components/ui';
import './LoginPage.css';

/**
 * LoginPage Component
 * 
 * Component trang đăng nhập với form validation và role-based navigation.
 * 
 * @returns {JSX.Element} LoginPage component
 */
const LoginPage: React.FC = () => {
  // Form data state - Lưu trữ email và password
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);  // Show/hide password toggle
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Form validation errors
  
  // Hooks
  const { state, login, clearError } = useAuth();  // Auth context
  const navigate = useNavigate();  // Navigation
  const location = useLocation();  // Current location (for returnUrl)
  
  /**
   * Effect: Clear form khi component mount
   * Chạy sau khi logout để clear dữ liệu cũ
   */
  useEffect(() => {
    setFormData({
      email: '',
      password: '',
    });
    setShowPassword(false);
    setErrors({});
  }, []);
  
  /**
   * getReturnUrl - Lấy URL để redirect sau khi login
   * 
   * Ư tiên lấy từ location state (nếu có).
   * Nếu không có, mặc định là customer dashboard.
   * 
   * @returns {string} Return URL
   */
  const getReturnUrl = () => {
    const stateReturnUrl = (location.state as { returnUrl?: string })?.returnUrl;
    if (stateReturnUrl) return stateReturnUrl;
    // Mặc định cho newly logged in users
    return '/customer/dashboard';
  };
  const returnUrl = getReturnUrl();

  /**
   * Effect: Auto redirect sau khi login thành công
   * 
   * Navigate dựa trên user role:
   * - CUSTOMER -> /customer/dashboard
   * - STAFF -> /staff/dashboard
   * - TECHNICIAN -> /technician/tasks
   * - ADMIN -> /admin/dashboard
   */
  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      // Navigate based on user role
      switch (state.user?.role) {
        case UserRole.CUSTOMER:
          navigate('/customer/dashboard');
          break;
        case UserRole.STAFF:
          navigate('/staff/dashboard');
          break;
        case UserRole.TECHNICIAN:
          navigate('/technician/tasks'); // Navigate directly to tasks page
          break;
        case UserRole.ADMIN:
          navigate('/admin/dashboard');
          break;
        default:
          navigate(returnUrl);
      }
    }
  }, [state.isAuthenticated, state.user, navigate]);

  /**
   * Effect: Hiển thị error từ auth context
   */
  useEffect(() => {
    if (state.error) {
      setErrors({ general: state.error });
    }
  }, [state.error]);

  /**
   * validateForm - Validate form data trước khi submit
   * 
   * Validation rules:
   * - Email: required, phải đúng format email
   * - Password: required
   * 
   * @returns {Object} Object chứa các field errors (empty nếu không có lỗi)
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }

    return newErrors;
  };

  /**
   * handleSubmit - Xử lý khi submit form
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Clear existing errors
   * 3. Validate form data
   * 4. Nếu hợp lệ -> gọi login API
   * 5. Navigation được xử lý bởi useEffect dựa trên role
   * 
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();  // Clear errors từ context
    setErrors({});  // Clear local errors

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Gọi login API
    await login(formData.email, formData.password);
    // Navigation được xử lý bởi useEffect dựa trên user role
  };

  /**
   * handleInputChange - Xử lý khi user nhập vào input fields
   * 
   * Tự động clear errors khi user bắt đầu nhập lại.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
      clearError();
    }
  };

  return (
    <div className="md-login-page">
      {/* Background Pattern */}
      <div className="md-login-page__background">
        <div className="md-login-page__pattern"></div>
      </div>

      <div className="md-login-page__container">
        <div className="md-login-page__content">
          {/* Header */}
          <div className="md-login-page__header">
            <Link to="/" className="md-login-page__logo-link">
              <div className="md-login-page__logo">
                <img 
                  src="/ev-service-logo.svg" 
                  alt="EV Service Center" 
                  className="md-login-page__logo-icon"
                />
              </div>
            </Link>
            <h1 className="md-login-page__title">Chào mừng bạn</h1>
            <p className="md-login-page__subtitle">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {/* Main Login Card */}
          <MDCard variant="elevated" className="md-login-page__form-card">
            <form onSubmit={handleSubmit} className="md-login-page__form" autoComplete="off">
              {errors.general && (
                <div className="md-login-page__error">
                  <AlertCircle className="md-login-page__error-icon" />
                  <span className="md-login-page__error-text">{errors.general}</span>
                </div>
              )}

              <MDTextField
                placeholder="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                required
                autoComplete="off"
              />

              <MDTextField
                placeholder="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                required
                autoComplete="new-password"
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="md-login-page__password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />

              <div className="md-login-page__options">
                <label className="md-login-page__checkbox">
                  <input
                    type="checkbox"
                    className="md-login-page__checkbox-input"
                  />
                  <span className="md-login-page__checkbox-label">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Tính năng đang được phát triển')}
                  className="md-login-page__forgot-password"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <MDButton
                type="submit"
                variant="filled"
                size="large"
                fullWidth
                disabled={state.isLoading}
              >
                {state.isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </MDButton>

              <div className="md-login-page__signup-link">
                <span>Chưa có tài khoản? </span>
                <Link 
                  to="/signup" 
                  state={{ returnUrl }} 
                  className="md-login-page__signup-button"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </MDCard>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
