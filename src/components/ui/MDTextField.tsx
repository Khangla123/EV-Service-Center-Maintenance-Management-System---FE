/**
 * MDTextField.tsx - Material Design 3 Text Field Component
 * 
 * Text input component theo chuẩn Material Design 3.
 * Hỗ trợ nhiều variants, states và customization options.
 * 
 * Features:
 * - 2 variants: filled, outlined
 * - Floating label animation
 * - Error state với helper text
 * - Support icons (start & end)
 * - Auto-focus management
 * - Controlled/Uncontrolled modes
 * - Full accessibility support
 * 
 * @module components/ui/MDTextField
 */

import React, { useState } from 'react';
import './MDTextField.css';

/**
 * MDTextFieldProps - Props cho MDTextField component
 * 
 * @interface MDTextFieldProps
 */
interface MDTextFieldProps {
  label?: string;                                          // Label text (floating)
  placeholder?: string;                                    // Placeholder text
  value?: string;                                          // Controlled value
  defaultValue?: string;                                   // Uncontrolled default value
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'; // Input type
  variant?: 'filled' | 'outlined';                         // TextField variant
  size?: 'small' | 'medium';                               // Kích thước
  fullWidth?: boolean;                                     // Chiếm full width
  disabled?: boolean;                                      // Disabled state
  error?: boolean;                                         // Error state
  helperText?: string;                                     // Helper/Error text
  required?: boolean;                                      // Required field marker
  startIcon?: React.ReactNode;                             // Icon ở đầu
  endIcon?: React.ReactNode;                               // Icon ở cuối
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;  // Change handler
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;     // Blur handler
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;    // Focus handler
  className?: string;                                      // Custom CSS class
  id?: string;                                             // Input ID
  name?: string;                                           // Input name
  autoComplete?: string;                                   // Autocomplete attribute
}

/**
 * MDTextField Component
 * 
 * Material Design 3 text field với floating label và rich features.
 * Tự động quản lý focus state và label animation.
 * 
 * @param {MDTextFieldProps} props - Component props
 * @returns {JSX.Element} TextField element
 * 
 * @example
 * ```tsx
 * // Basic outlined text field
 * <MDTextField
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 * 
 * // Error state với helper text
 * <MDTextField
 *   label="Password"
 *   type="password"
 *   error={hasError}
 *   helperText="Password is required"
 * />
 * 
 * // Với icons
 * <MDTextField
 *   label="Search"
 *   startIcon={<SearchIcon />}
 *   endIcon={<ClearIcon />}
 * />
 * ```
 */
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
  autoComplete,
}) => {
  // Local state để quản lý UI animations
  const [focused, setFocused] = useState(false);                        // Focus state
  const [hasValue, setHasValue] = useState(Boolean(value || defaultValue)); // Có value hay không

  /**
   * handleFocus - Xử lý khi input được focus
   * Set focused state và trigger label animation
   */
  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    onFocus?.(event);
  };

  /**
   * handleBlur - Xử lý khi input mất focus
   * Update hasValue state dựa trên current value
   */
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    setHasValue(Boolean(event.target.value));
    onBlur?.(event);
  };

  /**
   * handleChange - Xử lý khi value thay đổi
   * Update hasValue state để control label animation
   */
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
            autoComplete={autoComplete}
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