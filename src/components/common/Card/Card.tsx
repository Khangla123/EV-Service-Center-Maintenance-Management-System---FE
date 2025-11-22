/**
 * Card Component
 * Container component với shadow, border và padding tùy chỉnh
 * @module components/common/Card
 */

import React from 'react';
import './Card.css';

/**
 * Card Props Interface
 * Props cho Card component
 * @interface CardProps
 */
interface CardProps {
  /** Nội dung bên trong card */
  children: React.ReactNode;
  /** Class CSS bổ sung */
  className?: string;
  /** Mức độ padding */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Mức độ shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Hiển thị border */
  border?: boolean;
  /** Hiệu ứng hover */
  hoverable?: boolean;
  /** Callback khi click (biến card thành clickable) */
  onClick?: () => void;
}

/**
 * Card Component
 * Container component linh hoạt cho layout
 * @param {CardProps} props - Component props
 * @returns {JSX.Element} Card component
 * @example
 * <Card padding="lg" shadow="md" hoverable>
 *   <h3>Title</h3>
 *   <p>Content</p>
 * </Card>
 * 
 * @example
 * <Card onClick={handleClick} border={false}>
 *   Clickable card
 * </Card>
 */
const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hoverable = false,
  onClick
}) => {
  // Tạo class names dựa trên props
  const baseClass = 'card';
  const paddingClass = `card--padding-${padding}`;
  const shadowClass = `card--shadow-${shadow}`;
  const borderClass = border ? 'card--border' : '';
  const hoverableClass = hoverable ? 'card--hoverable' : '';
  const clickableClass = onClick ? 'card--clickable' : '';

  // Kết hợp tất cả classes
  const cardClasses = [
    baseClass,
    paddingClass,
    shadowClass,
    borderClass,
    hoverableClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;