/**
 * SignupPage.tsx - User Registration Page
 * 
 * Trang đăng ký tài khoản mới cho người dùng.
 * Bao gồm form validation đầy đủ và UI hiện đại.
 * 
 * Features:
 * - Multi-step form validation
 * - Password strength validation
 * - Phone number formatting
 * - Name parsing (Vietnamese format)
 * - Show/hide password toggles
 * - Terms & conditions acceptance
 * - Auto-login sau khi đăng ký
 * - Role-based navigation
 * - Benefits showcase section
 * 
 * @module pages/SignupPage
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, UserPlus, Sparkles, Settings, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MDButton, MDTextField, MDCard } from '../components/ui';
import './SignupPage.css';

/**
 * SignupPage Component
 * 
 * Component trang đăng ký với form validation và auto-login.
 * 
 * @returns {JSX.Element} SignupPage component
 */
const SignupPage: React.FC = () => {
  // Form data state - Lưu trữ tất cả thông tin đăng ký
  const [formData, setFormData] = useState({
    fullName: '',           // Họ và tên đầy đủ
    email: '',              // Email
    phone: '',              // Số điện thoại
    password: '',           // Mật khẩu
    confirmPassword: '',    // Xác nhận mật khẩu
    role: UserRole.CUSTOMER, // Vai trò mặc định
    acceptTerms: false      // Đồng ý điều khoản
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);  // Toggle hiển thị password
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  // Toggle hiển thị confirm password
  const [errors, setErrors] = useState<{ [key: string]: string }>({}); // Form validation errors
  
  // Hooks
  const { state, register, clearError } = useAuth();  // Auth context
  const navigate = useNavigate();  // Navigation
  const location = useLocation();  // Current location
  
  /**
   * getReturnUrl - Lấy URL để redirect sau khi đăng ký thành công
   * 
   * Ưu tiên lấy từ location state, fallback về customer dashboard.
   * 
   * @returns {string} Return URL
   */
  const getReturnUrl = () => {
    const stateReturnUrl = (location.state as { returnUrl?: string })?.returnUrl;
    if (stateReturnUrl) return stateReturnUrl;
    // Default to customer dashboard for newly registered users
    return '/customer/dashboard';
  };
  const returnUrl = getReturnUrl();

  useEffect(() => {
    if (state.isAuthenticated) {
      // Navigate based on user role
      if (state.user?.role === UserRole.CUSTOMER) {
        navigate('/customer/dashboard');
      } else {
        navigate(returnUrl);
      }
    }
  }, [state.isAuthenticated, state.user, navigate, returnUrl]);

  /**
   * Effect: Hiển thị error từ auth context
   */
  useEffect(() => {
    if (state.error) {
      setErrors({ general: state.error });
    }
  }, [state.error]);

  /**
   * validateForm - Validate toàn bộ form data
   * 
   * Validation rules:
   * - fullName: required, ít nhất 2 từ (họ và tên)
   * - email: required, đúng format email
   * - phone: required, 10-11 số
   * - password: required, ít nhất 6 ký tự
   * - confirmPassword: required, phải khớp với password
   * - acceptTerms: phải check
   * 
   * @returns {Object} Object chứa validation errors
   */
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên là bắt buộc';
    } else if (formData.fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Vui lòng nhập đầy đủ họ và tên';
    }

    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone) {
      newErrors.phone = 'Số điện thoại là bắt buộc';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
    }

    return newErrors;
  };

  /**
   * handleSubmit - Xử lý khi submit form đăng ký
   * 
   * Flow:
   * 1. Prevent default form submission
   * 2. Clear existing errors
   * 3. Validate form data
   * 4. Parse Vietnamese name (họ và tên)
   * 5. Gọi register API
   * 6. Auto-login sau khi đăng ký thành công
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

    // Parse Vietnamese name format
    // Format: "Họ Tên Đệm Tên" -> lastName="Họ Tên Đệm", firstName="Tên"
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[nameParts.length - 1]; // Phần cuối là tên
    const lastName = nameParts.slice(0, -1).join(' '); // Phần còn lại là họ

    await register({
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    });
    // Navigation is handled by useEffect based on user role
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    if (errors[name] || errors.general) {
      setErrors(prev => ({ ...prev, [name]: '', general: '' }));
      clearError();
    }
  };

  return (
    <div className="md-signup-page">
      {/* Background Pattern */}
      <div className="md-signup-page__background">
        <div className="md-signup-page__pattern"></div>
      </div>

      <div className="md-signup-page__container">
        {/* Benefits Section */}
        <div className="md-signup-page__benefits">
          <div className="md-signup-page__benefits-content">
            <div className="md-signup-page__logo-section">
              <Link to="/" className="md-signup-page__logo-link">
                <div className="md-signup-page__logo">
                  <img 
                    src="/ev-service-logo.svg" 
                    alt="EV Service Center" 
                    className="md-signup-page__logo-icon"
                  />
                </div>
              </Link>
              <h2 className="md-signup-page__brand-title">EV Service Center</h2>
              <p className="md-signup-page__brand-subtitle">
                Phần mềm quản lý bảo dưỡng xe điện cho trung tâm dịch vụ
              </p>
            </div>

            <div className="md-signup-page__features">
              <div className="md-signup-page__feature">
                <div className="md-signup-page__feature-icon">
                  <Sparkles size={24} />
                </div>
                <div className="md-signup-page__feature-content">
                  <h3 className="md-signup-page__feature-title">Công nghệ AI tiên tiến</h3>
                  <p className="md-signup-page__feature-description">
                    Hệ thống chẩn đoán thông minh và dự đoán bảo trì
                  </p>
                </div>
              </div>

              <div className="md-signup-page__feature">
                <div className="md-signup-page__feature-icon">
                  <Settings size={24} />
                </div>
                <div className="md-signup-page__feature-content">
                  <h3 className="md-signup-page__feature-title">Hỗ trợ đa thương hiệu</h3>
                  <p className="md-signup-page__feature-description">
                    Tương thích với tất cả loại xe điện phổ biến
                  </p>
                </div>
              </div>

              <div className="md-signup-page__feature">
                <div className="md-signup-page__feature-icon">
                  <Clock size={24} />
                </div>
                <div className="md-signup-page__feature-content">
                  <h3 className="md-signup-page__feature-title">Dịch vụ 24/7</h3>
                  <p className="md-signup-page__feature-description">
                    Hỗ trợ khách hàng và bảo trì khẩn cấp mọi lúc
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="md-signup-page__form-section">
          <div className="md-signup-page__header">
            <h1 className="md-signup-page__title">Tạo tài khoản</h1>
            <p className="md-signup-page__subtitle">
              Bắt đầu hành trình chăm sóc xe điện của bạn
            </p>
          </div>

          <MDCard variant="elevated" className="md-signup-page__form-card">
            <form onSubmit={handleSubmit} className="md-signup-page__form">
              {errors.general && (
                <div className="md-signup-page__error">
                  <AlertCircle className="md-signup-page__error-icon" />
                  <span className="md-signup-page__error-text">{errors.general}</span>
                </div>
              )}

              <MDTextField
                placeholder="Họ và tên"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                error={!!errors.fullName}
                helperText={errors.fullName}
                fullWidth
                required
              />

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
              />

              <MDTextField
                placeholder="Số điện thoại"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={!!errors.phone}
                helperText={errors.phone}
                fullWidth
                required
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
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="md-signup-page__password-toggle"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />

              <MDTextField
                placeholder="Xác nhận mật khẩu"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                fullWidth
                required
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="md-signup-page__password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />

              <div className="md-signup-page__terms">
                <label className="md-signup-page__terms-label">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="md-signup-page__terms-checkbox"
                  />
                  <span className="md-signup-page__terms-text">
                    Tôi đồng ý với{' '}
                    <button
                      type="button"
                      className="md-signup-page__terms-link"
                      onClick={() => alert('Điều khoản sử dụng')}
                    >
                      Điều khoản sử dụng
                    </button>
                    {' '}và{' '}
                    <button
                      type="button"
                      className="md-signup-page__terms-link"
                      onClick={() => alert('Chính sách bảo mật')}
                    >
                      Chính sách bảo mật
                    </button>
                  </span>
                </label>
                {errors.acceptTerms && (
                  <div className="md-signup-page__terms-error">
                    {errors.acceptTerms}
                  </div>
                )}
              </div>

              <MDButton
                type="submit"
                variant="filled"
                size="large"
                fullWidth
                disabled={state.isLoading}
                startIcon={state.isLoading ? null : <UserPlus size={20} />}
              >
                {state.isLoading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </MDButton>

              <div className="md-signup-page__login-link">
                <span>Đã có tài khoản? </span>
                <Link to="/login" className="md-signup-page__login-button">
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          </MDCard>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;