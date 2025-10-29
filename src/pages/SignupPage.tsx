import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, UserPlus, Sparkles, Settings, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MDButton, MDTextField, MDCard } from '../components/ui';
import './SignupPage.css';

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: UserRole.CUSTOMER,
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { state, register, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get return URL from location state, default to customer dashboard for new signups
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

  useEffect(() => {
    if (state.error) {
      setErrors({ general: state.error });
    }
  }, [state.error]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrors({});

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Split fullName into firstName and lastName
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[nameParts.length - 1]; // Last part is first name in Vietnamese
    const lastName = nameParts.slice(0, -1).join(' '); // Everything else is last name

    const registerData = {
      firstName,
      lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role
    };
    
    console.log('SignupPage - Submitting registration:', registerData); // Debug log

    await register(registerData);
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