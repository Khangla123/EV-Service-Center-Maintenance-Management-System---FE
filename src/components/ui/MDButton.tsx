import React from 'react';
import './MDButton.css';

interface MDButtonProps {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  fullWidth?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

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
  const baseClass = 'md-button';
  const variantClass = `md-button--${variant}`;
  const sizeClass = `md-button--${size}`;
  const fullWidthClass = fullWidth ? 'md-button--full-width' : '';
  const disabledClass = disabled ? 'md-button--disabled' : '';

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