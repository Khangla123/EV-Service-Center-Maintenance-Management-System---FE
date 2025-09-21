import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loading?: boolean;
}

const GradientButton: React.FC<GradientButtonProps> = ({ children, loading, className = '', ...props }) => (
  <button
    className={`relative w-full overflow-hidden bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:scale-100 ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {/* Shine effect */}
    <span className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-white/10 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></span>
    <span className="relative flex items-center justify-center">
      {loading ? (
        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : null}
      {children}
    </span>
  </button>
);

export default GradientButton;
