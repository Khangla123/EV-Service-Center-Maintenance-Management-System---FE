import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Shield, UserCheck, Users, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { MDButton, MDTextField, MDCard } from '../components/ui';
import './LoginPage.css';

// Demo accounts info (for display only)
const getDemoAccounts = () => {
  return {
    customer: {
      email: 'customer@evservice.vn',
      password: '123456',
      name: 'Nguyễn Văn Khách'
    },
    staff: {
      email: 'staff@evservice.vn',
      password: '123456',
      name: 'Lê Văn Nhân'
    },
    technician: {
      email: 'technician@evservice.vn',
      password: '123456',
      name: 'Hoàng Văn Kỹ'
    },
    admin: {
      email: 'admin@evservice.vn',
      password: '123456',
      name: 'Vũ Thị Quản'
    }
  };
};

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { state, login, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const demoAccounts = getDemoAccounts();
  
  // Get return URL from location state, default to customer dashboard for customers
  const getReturnUrl = () => {
    const stateReturnUrl = (location.state as { returnUrl?: string })?.returnUrl;
    if (stateReturnUrl) return stateReturnUrl;
    // Default to customer dashboard for newly logged in users
    return '/customer/dashboard';
  };
  const returnUrl = getReturnUrl();

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
          navigate('/technician/dashboard');
          break;
        case UserRole.ADMIN:
          navigate('/admin/dashboard');
          break;
        default:
          navigate(returnUrl);
      }
    }
  }, [state.isAuthenticated, state.user, navigate]);

  useEffect(() => {
    if (state.error) {
      setErrors({ general: state.error });
    }
  }, [state.error]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setErrors({});

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    await login(formData.email, formData.password);
    // Navigation is handled by useEffect based on user role
  };

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

  const fillDemoAccount = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
    clearError();
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
            <h1 className="md-login-page__title">Chào mừng trở lại</h1>
            <p className="md-login-page__subtitle">Đăng nhập để tiếp tục sử dụng dịch vụ</p>
          </div>

          {/* Main Login Card */}
          <MDCard variant="elevated" className="md-login-page__form-card">
            <form onSubmit={handleSubmit} className="md-login-page__form">
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

          {/* Demo Accounts */}
          <MDCard variant="outlined" className="md-login-page__demo-card">
            <h3 className="md-login-page__demo-title">Tài khoản demo</h3>
            <div className="md-login-page__demo-buttons">
              <MDButton
                variant="outlined"
                size="medium"
                startIcon={<UserCheck size={18} />}
                onClick={() => fillDemoAccount(demoAccounts.customer.email, demoAccounts.customer.password)}
                className="md-login-page__demo-button"
              >
                Khách hàng
              </MDButton>
              <MDButton
                variant="outlined"
                size="medium"
                startIcon={<Users size={18} />}
                onClick={() => fillDemoAccount(demoAccounts.staff.email, demoAccounts.staff.password)}
                className="md-login-page__demo-button"
              >
                Nhân viên
              </MDButton>
              <MDButton
                variant="outlined"
                size="medium"
                startIcon={<Wrench size={18} />}
                onClick={() => fillDemoAccount(demoAccounts.technician.email, demoAccounts.technician.password)}
                className="md-login-page__demo-button"
              >
                Kỹ thuật viên
              </MDButton>
              <MDButton
                variant="outlined"
                size="medium"
                startIcon={<Shield size={18} />}
                onClick={() => fillDemoAccount(demoAccounts.admin.email, demoAccounts.admin.password)}
                className="md-login-page__demo-button"
              >
                Quản trị viên
              </MDButton>
            </div>
          </MDCard>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
