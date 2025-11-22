/**
 * Button Component
 * Component button tùy chỉnh với nhiều variants và sizes
 * @module components/common/Button
 */

import React from 'react';
import './Button.css';

/**
 * Button Props Interface
 * Props cho Button component
 * @interface ButtonProps
 */
interface ButtonProps {
  /** Nội dung bên trong button */
  children: React.ReactNode;
  /** Kiểu hiển thị của button */
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  /** Kích thước button */
  size?: 'sm' | 'md' | 'lg';
  /** Vô hiệu hóa button */
  disabled?: boolean;
  /** Trạng thái loading (hiển thị spinner) */
  loading?: boolean;
  /** Button chiếm toàn bộ chiều rộng */
  fullWidth?: boolean;
  /** Loại button HTML */
  type?: 'button' | 'submit' | 'reset';
  /** Callback khi click */
  onClick?: () => void;
  /** Class CSS bổ sung */
  className?: string;
}

/**
 * Button Component
 * Button tùy chỉnh với loading state, variants, sizes
 * @param {ButtonProps} props - Component props
 * @returns {JSX.Element} Button component
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 * 
 * @example
 * <Button variant="danger" loading={isLoading}>
 *   Delete
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = ''
}) => {
  // Tạo class names dựa trên props
  const baseClass = 'btn';
  const variantClass = `btn--${variant}`;
  const sizeClass = `btn--${size}`;
  const fullWidthClass = fullWidth ? 'btn--full-width' : '';
  const loadingClass = loading ? 'btn--loading' : '';
  const disabledClass = disabled || loading ? 'btn--disabled' : '';

  // Kết hợp tất cả classes
  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    loadingClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <span className="btn__spinner">
          <svg className="btn__spinner-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      <span className={loading ? 'btn__content btn__content--loading' : 'btn__content'}>
        {children}
      </span>
    </button>
  );
};

export default Button;