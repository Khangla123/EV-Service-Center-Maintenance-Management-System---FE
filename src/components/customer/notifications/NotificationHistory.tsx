import React, { useState, useMemo } from 'react';
import { X, Calendar, CreditCard, Bell, AlertTriangle, CheckCircle, Clock, Search, Filter, RefreshCw } from 'lucide-react';
import { useNotificationState } from '../../../hooks/useNotificationState';
import MDButton from '../../ui/MDButton';
import './NotificationHistory.css';

interface NotificationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = ({
  isOpen,
  onClose
}) => {
  console.log('NotificationHistory render:', { isOpen });
  
  const notificationState = useNotificationState({
    enableHistory: true,
    storageKey: 'homepage_notifications_dismissed'
  });

  const [filterType, setFilterType] = useState<'all' | 'maintenance' | 'payment'>('all');
  const [filterAction, setFilterAction] = useState<'all' | 'dismissed' | 'snoozed' | 'action_clicked'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const history = notificationState.getNotificationHistory();

  const filteredHistory = useMemo(() => {
    let filtered = [...history];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Filter by action
    if (filterAction !== 'all') {
      filtered = filtered.filter(item => item.actionTaken === filterAction);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = Date.now();
      let startTime = 0;
      
      switch (dateRange) {
        case 'today':
          startTime = now - (24 * 60 * 60 * 1000);
          break;
        case 'week':
          startTime = now - (7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startTime = now - (30 * 24 * 60 * 60 * 1000);
          break;
      }
      
      filtered = filtered.filter(item => item.createdAt >= startTime);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.message.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [history, filterType, filterAction, dateRange, searchTerm]);

  const getIcon = (type: string) => {
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

  const getActionBadge = (action?: string) => {
    switch (action) {
      case 'dismissed':
        return <span className="action-badge dismissed">Đã đóng</span>;
      case 'snoozed':
        return <span className="action-badge snoozed">Đã hoãn</span>;
      case 'action_clicked':
        return <span className="action-badge clicked">Đã xử lý</span>;
      default:
        return <span className="action-badge unknown">Chưa rõ</span>;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) {
      return `${minutes} phút trước`;
    } else if (hours < 24) {
      return `${hours} giờ trước`;
    } else if (days < 7) {
      return `${days} ngày trước`;
    } else {
      return formatDate(timestamp);
    }
  };

  const clearOldHistory = () => {
    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    notificationState.clearHistory(oneMonthAgo);
  };

  const clearAllHistory = () => {
    notificationState.clearHistory();
  };

  if (!isOpen) return null;

  return (
    <div className="notification-history-overlay">
      <div className="notification-history-modal">
        <div className="modal-header">
          <div className="header-content">
            <h2>📜 Lịch sử thông báo</h2>
            <p>Xem lại tất cả thông báo đã nhận ({filteredHistory.length} kết quả)</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-box">
            <Search className="h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
              <option value="all">Tất cả loại</option>
              <option value="maintenance">Bảo dưỡng</option>
              <option value="payment">Thanh toán</option>
            </select>

            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value as any)}>
              <option value="all">Tất cả hành động</option>
              <option value="dismissed">Đã đóng</option>
              <option value="snoozed">Đã hoãn</option>
              <option value="action_clicked">Đã xử lý</option>
            </select>

            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}>
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
            </select>
          </div>

          <div className="action-buttons">
            <MDButton
              variant="text"
              onClick={clearOldHistory}
              className="clear-btn"
              size="small"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Xóa cũ (&gt;30 ngày)
            </MDButton>
          </div>
        </div>

        {/* History List */}
        <div className="history-content">
          {filteredHistory.length === 0 ? (
            <div className="empty-state">
              <Bell className="h-16 w-16 text-gray-400 mb-4" />
              <h3>Không có lịch sử thông báo</h3>
              <p>Chưa có thông báo nào được ghi lại hoặc không khớp với bộ lọc.</p>
            </div>
          ) : (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <div key={item.id} className={`history-item ${item.type} priority-${item.priority}`}>
                  <div className="item-icon">
                    {getIcon(item.type)}
                  </div>
                  
                  <div className="item-content">
                    <div className="item-header">
                      <h4>{item.title}</h4>
                      <div className="item-meta">
                        <span className="timestamp" title={formatDate(item.createdAt)}>
                          {formatRelativeTime(item.createdAt)}
                        </span>
                        {getActionBadge(item.actionTaken)}
                      </div>
                    </div>
                    
                    <p className="item-message">{item.message}</p>
                    
                    <div className="item-details">
                      {item.dismissedAt && (
                        <span className="detail-item">
                          <Clock className="h-3 w-3" />
                          Xử lý: {formatRelativeTime(item.dismissedAt)}
                        </span>
                      )}
                      {item.snoozeCount && item.snoozeCount > 0 && (
                        <span className="detail-item">
                          <RefreshCw className="h-3 w-3" />
                          Đã hoãn {item.snoozeCount} lần
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <span>Tổng cộng: {filteredHistory.length} thông báo</span>
            {history.length > 50 && (
              <MDButton
                variant="text"
                onClick={clearAllHistory}
                className="clear-all-btn"
                size="small"
              >
                Xóa tất cả lịch sử
              </MDButton>
            )}
          </div>
          
          <MDButton
            variant="text"
            onClick={onClose}
            className="close-btn-footer"
          >
            Đóng
          </MDButton>
        </div>
      </div>
    </div>
  );
};

export default NotificationHistory;