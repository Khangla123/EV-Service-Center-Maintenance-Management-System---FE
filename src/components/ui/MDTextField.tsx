import React, { useState } from 'react';
import './MDTextField.css';

interface MDTextFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  variant?: 'filled' | 'outlined';
  size?: 'small' | 'medium';
  fullWidth?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  id?: string;
  name?: string;
}

export const MDTextField: React.FC<MDTextFieldProps> = ({
  label,
  placeholder,
  value,
  defaultValue,
  type = 'text',
  variant = 'outlined',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  error = false,
  helperText,
  required = false,
  startIcon,
  endIcon,
  onChange,
  onBlur,
  onFocus,
  className = '',
  id,
  name,
}) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue));

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setHasValue(Boolean(event.target.value));
    onBlur?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(Boolean(event.target.value));
    onChange?.(event);
  };

  const baseClass = 'md-textfield';
  const variantClass = `md-textfield--${variant}`;
  const sizeClass = `md-textfield--${size}`;
  const fullWidthClass = fullWidth ? 'md-textfield--full-width' : '';
  const disabledClass = disabled ? 'md-textfield--disabled' : '';
  const errorClass = error ? 'md-textfield--error' : '';
  const focusedClass = focused ? 'md-textfield--focused' : '';
  const hasValueClass = hasValue || focused ? 'md-textfield--has-value' : '';

  const containerClasses = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    disabledClass,
    errorClass,
    focusedClass,
    hasValueClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      <div className="md-textfield__container">
        {startIcon && (
          <div className="md-textfield__icon md-textfield__icon--start">
            {startIcon}
          </div>
        )}
        
        <div className="md-textfield__input-container">
          <input
            id={id}
            name={name}
            type={type}
            value={value}
            defaultValue={defaultValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="md-textfield__input"
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          
          {label && (
            <label htmlFor={id} className="md-textfield__label">
              {label}
              {required && <span className="md-textfield__required">*</span>}
            </label>
          )}
        </div>
        
        {endIcon && (
          <div className="md-textfield__icon md-textfield__icon--end">
            {endIcon}
          </div>
        )}
      </div>
      
      {helperText && (
        <div className="md-textfield__helper-text">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default MDTextField;