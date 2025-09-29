import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Bell, Settings, Car } from 'lucide-react';
import { UserRole } from '../../../types';
import Button from '../Button';
import './Header.css';

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
  } | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) {
      return [
        { label: 'Giới thiệu', path: '/about' },
        { label: 'Dịch vụ bảo trì', path: '/services' },
        { label: 'Hỗ trợ xe điện', path: '/vehicles' },
        { label: 'Dịch vụ hậu mãi', path: '/after-sales' },
        { label: 'Phụ tùng & phụ kiện', path: '/parts' },
        { label: 'Liên hệ', path: '/contact' }
      ];
    }

    switch (user.role) {  
      case UserRole.STAFF:
        return [
          { label: 'Dashboard', path: '/staff/dashboard' },
          { label: 'Lịch hẹn', path: '/staff/appointments' },
          { label: 'Khách hàng', path: '/staff/customers' },
          { label: 'Dịch vụ', path: '/staff/services' }
        ];
      case UserRole.TECHNICIAN:
        return [
          { label: 'Dashboard', path: '/technician/dashboard' },
          { label: 'Công việc', path: '/technician/work' },
          { label: 'Lịch trình', path: '/technician/schedule' }
        ];
      case UserRole.ADMIN:
        return [
          { label: 'Dashboard', path: '/admin/dashboard' },
          { label: 'Nhân sự', path: '/admin/staff' },
          { label: 'Phụ tùng', path: '/admin/inventory' },
          { label: 'Báo cáo', path: '/admin/reports' }
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <header className="header" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
      <div className="header__container">
        {/* Logo */}
        <Link to="/" className="header__logo">
          <div className="header__logo-container">
            <Car className="header__logo-icon" />
            <span className="header__logo-text">EV Service</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header__nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="header__nav-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="header__actions">
          {user ? (
            <>
              {/* Notifications */}
              <button className="header__notification-btn">
                <Bell size={20} />
                <span className="header__notification-badge">3</span>
              </button>

              {/* User Menu */}
              <div className="header__user-menu">
                <button
                  className="header__user-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="header__user-avatar"
                    />
                  ) : (
                    <div className="header__user-avatar header__user-avatar--placeholder">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </div>
                  )}
                  <span className="header__user-name">
                    {user.firstName} {user.lastName}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="header__user-dropdown">
                    <div className="header__user-info">
                      <div className="header__user-role">
                        {user.role === UserRole.CUSTOMER && 'Khách hàng'}
                        {user.role === UserRole.STAFF && 'Nhân viên'}
                        {user.role === UserRole.TECHNICIAN && 'Kỹ thuật viên'}
                        {user.role === UserRole.ADMIN && 'Quản trị viên'}
                      </div>
                    </div>
                    <div className="header__user-dropdown-divider"></div>
                    <Link to="/profile" className="header__user-dropdown-item">
                      <User size={16} />
                      Hồ sơ cá nhân
                    </Link>
                    <Link to="/settings" className="header__user-dropdown-item">
                      <Settings size={16} />
                      Cài đặt
                    </Link>
                    <div className="header__user-dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="header__user-dropdown-item header__user-dropdown-item--logout"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="header__auth-buttons">
              <Link to="/login">
                <Button variant="outline" size="sm" className="header__account-btn">
                  TÀI KHOẢN
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="header__register-btn">
                  ĐẶT LỊCH BẢO TRÌ
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="header__mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="header__mobile-nav">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="header__mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="header__mobile-auth">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" fullWidth className="header__mobile-account-btn">
                  TÀI KHOẢN
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button fullWidth className="header__mobile-register-btn">
                  ĐẶT LỊCH BẢO TRÌ
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;