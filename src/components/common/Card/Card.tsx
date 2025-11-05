import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hoverable = false,
  onClick
}) => {
  const baseClass = 'card';
  const paddingClass = `card--padding-${padding}`;
  const shadowClass = `card--shadow-${shadow}`;
  const borderClass = border ? 'card--border' : '';
  const hoverableClass = hoverable ? 'card--hoverable' : '';
  const clickableClass = onClick ? 'card--clickable' : '';

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