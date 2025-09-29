import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, CreditCard, Bell, CheckCircle } from 'lucide-react';
import MDButton from '../../ui/MDButton';
import './NotificationBanner.css';

export interface NotificationItem {
  id: string;
  type: 'maintenance' | 'payment' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionText?: string;
  onAction?: () => void;
  dismissible?: boolean;
}

interface NotificationBannerProps {
  notifications: NotificationItem[];
  onDismiss: (notificationId: string) => void;
  className?: string;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notifications,
  onDismiss,
  className = ''
}) => {
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  if (!notifications || notifications.length === 0) {
    return null;
  }

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'maintenance':
        return <Calendar className="h-5 w-5" />;
      case 'payment':
        return <CreditCard className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getBannerClass = (type: NotificationItem['type'], priority: NotificationItem['priority']) => {
    const baseClass = 'notification-banner';
    const typeClass = `notification-${type}`;
    const priorityClass = `priority-${priority}`;
    return `${baseClass} ${typeClass} ${priorityClass}`;
  };

  const toggleExpanded = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const handleDismiss = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    onDismiss(notificationId);
  };

  return (
    <div className={`notification-banner-container ${className}`}>
      {notifications.map((notification) => {
        const isExpanded = expandedNotifications.has(notification.id);
        const isDismissible = notification.dismissible !== false;

        return (
          <div
            key={notification.id}
            className={getBannerClass(notification.type, notification.priority)}
          >
            <div className="notification-content">
              <div className="notification-main">
                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>
                
                <div className="notification-text">
                  <div className="notification-title">{notification.title}</div>
                  <div className={`notification-message ${isExpanded ? 'expanded' : ''}`}>
                    {notification.message}
                  </div>
                </div>

                <div className="notification-actions">
                  {notification.message.length > 100 && (
                    <button
                      className="expand-btn"
                      onClick={() => toggleExpanded(notification.id)}
                    >
                      {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                  )}
                  
                  {notification.actionText && notification.onAction && (
                    <MDButton
                      variant="outlined"
                      size="small"
                      onClick={notification.onAction}
                      className="action-btn"
                    >
                      {notification.actionText}
                    </MDButton>
                  )}

                  {isDismissible && (
                    <button
                      className="close-btn"
                      onClick={(e) => handleDismiss(e, notification.id)}
                      title="Đóng thông báo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationBanner;