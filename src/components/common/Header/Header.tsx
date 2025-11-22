import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Bell, Settings, Wrench, CreditCard } from 'lucide-react';
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
  onShowMaintenanceReminder?: () => void;
  onShowPaymentReminder?: () => void;
  onShowAllNotifications?: () => void;
  maintenanceReminderCount?: number;
  paymentReminderCount?: number;
  readNotifications?: Set<string>;
  onMarkNotificationAsRead?: (notificationId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  onLogout, 
  onShowMaintenanceReminder, 
  onShowPaymentReminder,
  onShowAllNotifications,
  maintenanceReminderCount = 0,
  paymentReminderCount = 0,
  readNotifications: externalReadNotifications,
  onMarkNotificationAsRead
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const navigate = useNavigate();
  
  // Use external readNotifications from context if available, otherwise use empty Set
  const readNotifications = externalReadNotifications || new Set<string>();
  
  // Helper function to mark notification as read
  const markAsRead = (notificationId: string) => {
    if (onMarkNotificationAsRead) {
      onMarkNotificationAsRead(notificationId);
    }
  };
  
  // Đếm số loại thông báo (mỗi loại chỉ tính 1 lần)
  const notificationTypes = [];
  if (maintenanceReminderCount > 0) notificationTypes.push('maintenance');
  if (paymentReminderCount > 0) notificationTypes.push('payment');
  
  const totalNotifications = notificationTypes.length;
  const unreadCount = notificationTypes.filter(type => !readNotifications.has(type)).length;
  
  // Mock data for old notifications (lịch sử thông báo) - giống Facebook
  const oldNotifications = [
    {
      id: 'old-1',
      type: 'maintenance',
      title: 'Bảo dưỡng định kỳ hoàn tất',
      description: 'Xe VinFast VF8 đã hoàn tất bảo dưỡng định kỳ',
      time: '3 ngày trước',
      isRead: true
    },
    {
      id: 'old-2',
      type: 'payment',
      title: 'Thanh toán thành công',
      description: 'Đã thanh toán hóa đơn bảo dưỡng tháng 8',
      time: '1 tuần trước',
      isRead: true
    },
    {
      id: 'old-3',
      type: 'maintenance',
      title: 'Kiểm tra pin hoàn tất',
      description: 'Hệ thống pin hoạt động bình thường',
      time: '2 tuần trước',
      isRead: true
    },
    {
      id: 'old-4',
      type: 'payment',
      title: 'Xác nhận đặt lịch bảo dưỡng',
      description: 'Lịch hẹn bảo dưỡng ngày 15/09 đã được xác nhận',
      time: '3 tuần trước',
      isRead: true
    },
    {
      id: 'old-5',
      type: 'maintenance',
      title: 'Cập nhật phần mềm xe',
      description: 'Hệ thống xe của bạn đã được cập nhật phiên bản mới',
      time: '1 tháng trước',
      isRead: true
    }
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!user) {
      return [];
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

  // Determine home path based on user role
  const getHomePath = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case UserRole.CUSTOMER:
        return '/customer/dashboard';
      case UserRole.STAFF:
        return '/staff/dashboard';
      case UserRole.TECHNICIAN:
        return '/technician/tasks';
      case UserRole.ADMIN:
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="header" style={{ backgroundColor: '#ffffff', background: '#ffffff' }}>
      <div className="header__container">
        {/* Logo */}
        <Link to={getHomePath()} className="header__logo">
          <div className="header__logo-container">
            <img 
              src="/ev-service-logo.svg" 
              alt="EV Service Center" 
              className="header__logo-icon"
            />
            <span className="header__logo-text">EV Service Center</span>
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
              {/* User Menu */}
              <div className="header__user-menu">
                <button
                  className="header__user-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={`${user.lastName} ${user.firstName}`}
                      className="header__user-avatar"
                    />
                  ) : (
                    <div className="header__user-avatar header__user-avatar--placeholder">
                      {user.lastName.charAt(0)}{user.firstName.charAt(0)}
                    </div>
                  )}
                  <span className="header__user-name">
                    {user.lastName} {user.firstName}
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
                  ĐĂNG NHẬP
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
                  ĐĂNG NHẬP
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