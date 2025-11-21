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
              {/* Notifications */}
              <div className="header__notification-menu">
                <button 
                  className="header__notification-btn"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="header__notification-badge">{unreadCount}</span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="header__notification-dropdown">
                    <div className="notification-header">
                      <div className="notification-header-top">
                        <h3>Thông báo</h3>
                        <button 
                          className="notification-close-btn"
                          onClick={() => {
                            setIsNotificationOpen(false);
                            setShowAllNotifications(false);
                            setActiveTab('all');
                          }}
                          aria-label="Đóng thông báo"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="notification-tabs">
                        <button 
                          className={`notification-tab ${activeTab === 'all' ? 'active' : ''}`}
                          onClick={() => setActiveTab('all')}
                        >
                          Tất cả
                        </button>
                        <button 
                          className={`notification-tab ${activeTab === 'unread' ? 'active' : ''}`}
                          onClick={() => setActiveTab('unread')}
                        >
                          Chưa đọc
                        </button>
                      </div>
                    </div>
                    <div className="notification-list">
                      {totalNotifications === 0 && activeTab === 'all' ? (
                        <div className="notification-empty">
                          <Bell size={48} style={{ opacity: 0.3 }} />
                          <p>Không có thông báo nào</p>
                        </div>
                      ) : (
                        <>
                          {/* Thông báo mới - chưa đọc */}
                          {(activeTab === 'all' || activeTab === 'unread') && (
                            <>
                              {maintenanceReminderCount > 0 && !readNotifications.has('maintenance') && (
                                <button 
                                  className={`notification-item ${!readNotifications.has('maintenance') ? 'notification-item-unread' : 'notification-item-read'}`}
                                  onClick={() => {
                                    markAsRead('maintenance');
                                    setIsNotificationOpen(false);
                                    setShowAllNotifications(false);
                                    setActiveTab('all');
                                    // Đảm bảo dropdown đóng hoàn toàn trước khi mở popup
                                    setTimeout(() => {
                                      onShowMaintenanceReminder?.();
                                    }, 100);
                                  }}
                                >
                                  <div className="notification-icon maintenance">
                                    <Wrench size={20} />
                                  </div>
                                  <div className="notification-content">
                                    <div className="notification-title">
                                      🔔 Nhắc nhở bảo dưỡng
                                    </div>
                                    <div className="notification-description">
                                      {maintenanceReminderCount === 1 
                                        ? 'Xe của bạn cần được bảo dưỡng định kỳ' 
                                        : `Bạn có ${maintenanceReminderCount} xe cần bảo dưỡng`}
                                    </div>
                                    <div className="notification-time">Hôm nay</div>
                                  </div>
                                  {!readNotifications.has('maintenance') && (
                                    <div className="notification-unread-badge"></div>
                                  )}
                                </button>
                              )}
                              {paymentReminderCount > 0 && !readNotifications.has('payment') && (
                                <button 
                                  className={`notification-item ${!readNotifications.has('payment') ? 'notification-item-unread' : 'notification-item-read'}`}
                                  onClick={() => {
                                    markAsRead('payment');
                                    setIsNotificationOpen(false);
                                    setShowAllNotifications(false);
                                    setActiveTab('all');
                                    // Đảm bảo dropdown đóng hoàn toàn trước khi mở popup
                                    setTimeout(() => {
                                      onShowPaymentReminder?.();
                                    }, 100);
                                  }}
                                >
                                  <div className="notification-icon payment">
                                    <CreditCard size={20} />
                                  </div>
                                  <div className="notification-content">
                                    <div className="notification-title">
                                      💳 Nhắc nhở thanh toán
                                    </div>
                                    <div className="notification-description">
                                      {paymentReminderCount === 1 
                                        ? 'Bạn có khoản cần thanh toán' 
                                        : `Bạn có ${paymentReminderCount} khoản cần thanh toán`}
                                    </div>
                                    <div className="notification-time">Hôm nay</div>
                                  </div>
                                  {!readNotifications.has('payment') && (
                                    <div className="notification-unread-badge"></div>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* Hiển thị thông báo đã đọc trong tab Tất cả */}
                          {activeTab === 'all' && (
                            <>
                              {maintenanceReminderCount > 0 && readNotifications.has('maintenance') && (
                                <button 
                                  className="notification-item notification-item-read"
                                  onClick={() => {
                                    setIsNotificationOpen(false);
                                    setShowAllNotifications(false);
                                    setActiveTab('all');
                                    // Đảm bảo dropdown đóng hoàn toàn trước khi mở popup
                                    setTimeout(() => {
                                      onShowMaintenanceReminder?.();
                                    }, 100);
                                  }}
                                >
                                  <div className="notification-icon maintenance">
                                    <Wrench size={20} />
                                  </div>
                                  <div className="notification-content">
                                    <div className="notification-title">
                                      🔔 Nhắc nhở bảo dưỡng
                                    </div>
                                    <div className="notification-description">
                                      {maintenanceReminderCount === 1 
                                        ? 'Xe của bạn cần được bảo dưỡng định kỳ' 
                                        : `Bạn có ${maintenanceReminderCount} xe cần bảo dưỡng`}
                                    </div>
                                    <div className="notification-time">Hôm nay</div>
                                  </div>
                                </button>
                              )}
                              {paymentReminderCount > 0 && readNotifications.has('payment') && (
                                <button 
                                  className="notification-item notification-item-read"
                                  onClick={() => {
                                    setIsNotificationOpen(false);
                                    setShowAllNotifications(false);
                                    setActiveTab('all');
                                    // Đảm bảo dropdown đóng hoàn toàn trước khi mở popup
                                    setTimeout(() => {
                                      onShowPaymentReminder?.();
                                    }, 100);
                                  }}
                                >
                                  <div className="notification-icon payment">
                                    <CreditCard size={20} />
                                  </div>
                                  <div className="notification-content">
                                    <div className="notification-title">
                                      💳 Nhắc nhở thanh toán
                                    </div>
                                    <div className="notification-description">
                                      {paymentReminderCount === 1 
                                        ? 'Bạn có khoản cần thanh toán' 
                                        : `Bạn có ${paymentReminderCount} khoản cần thanh toán`}
                                    </div>
                                    <div className="notification-time">Hôm nay</div>
                                  </div>
                                </button>
                              )}
                            </>
                          )}
                          
                          {/* Thông báo cũ - đã đọc - chỉ hiển thị khi showAllNotifications = true */}
                          {activeTab === 'all' && showAllNotifications && oldNotifications.map(notif => (
                            <div key={notif.id} className="notification-item notification-item-read">
                              <div className={`notification-icon ${notif.type}`}>
                                {notif.type === 'maintenance' ? <Wrench size={20} /> : <CreditCard size={20} />}
                              </div>
                              <div className="notification-content">
                                <div className="notification-title">{notif.title}</div>
                                <div className="notification-description">{notif.description}</div>
                                <div className="notification-time">{notif.time}</div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Hiển thị message nếu tab Chưa đọc nhưng không có thông báo */}
                          {activeTab === 'unread' && unreadCount === 0 && (
                            <div className="notification-empty">
                              <Bell size={48} style={{ opacity: 0.3 }} />
                              <p>Không có thông báo chưa đọc</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {!showAllNotifications && activeTab === 'all' && (unreadCount > 0 || readNotifications.size > 0) && (
                      <div className="notification-footer">
                        <button 
                          className="view-all-btn"
                          onClick={() => setShowAllNotifications(true)}
                        >
                          Xem thông báo trước đó
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

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