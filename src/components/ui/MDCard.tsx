import React from 'react';
import './MDCard.css';

interface MDCardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  padding?: 'none' | 'small' | 'medium' | 'large';
  interactive?: boolean;
}

export const MDCard: React.FC<MDCardProps> = ({
  variant = 'elevated',
  children,
  onClick,
  className = '',
  padding = 'medium',
  interactive = false,
}) => {
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