import React, { useState, useRef, useEffect } from 'react';
import { Bell, History, MoreVertical } from 'lucide-react';
import './NotificationIcon.css';

interface NotificationIconProps {
  count: number;
  onClick: () => void;
  onHistoryClick?: () => void;
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  count,
  onClick,
  onHistoryClick,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMainClick = () => {
    setIsAnimating(true);
    onClick();
    
    // Reset animation after completion
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Menu clicked, current showDropdown:', showDropdown);
    setShowDropdown(!showDropdown);
  };

  const handleHistoryClick = () => {
    console.log('History button clicked!');
    setShowDropdown(false);
    if (onHistoryClick) {
      console.log('Calling onHistoryClick...');
      onHistoryClick();
    } else {
      console.log('onHistoryClick is not defined!');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className={`notification-icon-container ${className}`} ref={dropdownRef}>
      <button 
        className={`notification-icon ${isAnimating ? 'animate' : ''} ${count > 0 ? 'has-notifications' : ''}`}
        onClick={handleMainClick}
        title={count > 0 ? `Bạn có ${count} thông báo mới` : 'Không có thông báo'}
      >
        <Bell className="bell-icon" size={20} />
        {count > 0 && (
          <span className="notification-badge">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Menu Button */}
      {onHistoryClick && (
        <button
          className="menu-button"
          onClick={handleMenuClick}
          title="Tùy chọn thêm"
        >
          <MoreVertical size={16} />
        </button>
      )}

      {/* Dropdown Menu */}
      {showDropdown && onHistoryClick && (
        <div className="notification-dropdown">
          <button
            className="dropdown-item"
            onClick={handleHistoryClick}
          >
            <History className="h-4 w-4" />
            Xem lịch sử thông báo
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;