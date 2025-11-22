/**
 * MDButton.tsx - Material Design 3 Button Component
 * 
 * Button component theo chuẩn Material Design 3.
 * Hỗ trợ nhiều variants, sizes và states.
 * 
 * Features:
 * - 5 variants: filled, outlined, text, elevated, tonal
 * - 3 sizes: small, medium, large
 * - Support icons (start & end)
 * - Full width option
 * - Disabled state
 * - Accessible (keyboard navigation)
 * 
 * @module components/ui/MDButton
 */

import React from 'react';
import './MDButton.css';

/**
 * MDButtonProps - Props cho MDButton component
 * 
 * @interface MDButtonProps
 */
interface MDButtonProps {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';  // Kiểu button (mặc định: filled)
  size?: 'small' | 'medium' | 'large';                                // Kích thước (mặc định: medium)
  disabled?: boolean;                                                 // Trạng thái disabled
  fullWidth?: boolean;                                                // Chiếm full width của container
  startIcon?: React.ReactNode;                                        // Icon ở đầu button
  endIcon?: React.ReactNode;                                          // Icon ở cuối button
  children: React.ReactNode;                                          // Nội dung button (text)
  onClick?: () => void;                                               // Click handler
  type?: 'button' | 'submit' | 'reset';                              // Loại button (mặc định: button)
  className?: string;                                                 // Custom CSS class
}

/**
 * MDButton Component
 * 
 * Material Design 3 button component với nhiều variants và customization options.
 * Follow MD3 design guidelines cho spacing, typography, và elevation.
 * 
 * @param {MDButtonProps} props - Component props
 * @returns {JSX.Element} Button element
 * 
 * @example
 * ```tsx
 * // Filled button (primary)
 * <MDButton variant="filled" onClick={handleClick}>
 *   Click me
 * </MDButton>
 * 
 * // Outlined button với icon
 * <MDButton variant="outlined" startIcon={<Icon />}>
 *   With Icon
 * </MDButton>
 * 
 * // Full width submit button
 * <MDButton type="submit" fullWidth>
 *   Submit Form
 * </MDButton>
 * ```
 */
export const MDButton: React.FC<MDButtonProps> = ({
  variant = 'filled',
  size = 'medium',
  disabled = false,
  fullWidth = false,
  startIcon,
  endIcon,
  children,
  onClick,
  type = 'button',
  className = '',
}) => {
  // Tạo CSS classes dựa trên props
  const baseClass = 'md-button';                          // Base class
  const variantClass = `md-button--${variant}`;           // Variant modifier
  const sizeClass = `md-button--${size}`;                 // Size modifier
  const fullWidthClass = fullWidth ? 'md-button--full-width' : '';  // Full width modifier
  const disabledClass = disabled ? 'md-button--disabled' : '';      // Disabled state

  // Combine tất cả classes, filter out empty strings
  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="md-button__icon md-button__icon--start">{startIcon}</span>}
      <span className="md-button__text">{children}</span>
      {endIcon && <span className="md-button__icon md-button__icon--end">{endIcon}</span>}
    </button>
  );
};

export default MDButton;