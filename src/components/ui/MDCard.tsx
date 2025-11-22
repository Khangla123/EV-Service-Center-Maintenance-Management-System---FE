/**
 * MDCard.tsx - Material Design 3 Card Component
 * 
 * Card container component theo chuẩn Material Design 3.
 * Hỗ trợ 3 variants với elevation và styling khác nhau.
 * 
 * Features:
 * - 3 variants: elevated, filled, outlined
 * - Flexible padding options
 * - Interactive state (clickable)
 * - Polymorphic component (div hoặc button)
 * - Accessibility support
 * 
 * @module components/ui/MDCard
 */

import React from 'react';
import './MDCard.css';

/**
 * MDCardProps - Props cho MDCard component
 * 
 * @interface MDCardProps
 */
interface MDCardProps {
  variant?: 'elevated' | 'filled' | 'outlined';  // Card variant (mặc định: elevated)
  children: React.ReactNode;                      // Nội dung card
  onClick?: () => void;                           // Click handler (biến card thành clickable)
  className?: string;                             // Custom CSS class
  padding?: 'none' | 'small' | 'medium' | 'large'; // Padding size (mặc định: medium)
  interactive?: boolean;                          // Force interactive state
}

/**
 * MDCard Component
 * 
 * Polymorphic card component - render as div hoặc button tùy onClick.
 * Follow MD3 design guidelines cho elevation, spacing, và border radius.
 * 
 * @param {MDCardProps} props - Component props
 * @returns {JSX.Element} Card element (div hoặc button)
 * 
 * @example
 * ```tsx
 * // Static card
 * <MDCard variant="elevated">
 *   <h3>Card Title</h3>
 *   <p>Card content...</p>
 * </MDCard>
 * 
 * // Clickable card
 * <MDCard variant="outlined" onClick={handleClick}>
 *   Click me
 * </MDCard>
 * 
 * // Card với custom padding
 * <MDCard padding="large">
 *   Large padding content
 * </MDCard>
 * ```
 */
export const MDCard: React.FC<MDCardProps> = ({
  variant = 'elevated',
  children,
  onClick,
  className = '',
  padding = 'medium',
  interactive = false,
}) => {
  // Tạo CSS classes
  const baseClass = 'md-card';
  const variantClass = `md-card--${variant}`;
  const paddingClass = `md-card--padding-${padding}`;
  const interactiveClass = interactive || onClick ? 'md-card--interactive' : '';

  const cardClasses = [
    baseClass,
    variantClass,
    paddingClass,
    interactiveClass,
    className
  ].filter(Boolean).join(' ');

  // Polymorphic component - render as button nếu có onClick, otherwise div
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Component>
  );
};

export default MDCard;