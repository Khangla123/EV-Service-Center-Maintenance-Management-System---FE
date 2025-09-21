import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const TextInput: React.FC<TextInputProps> = ({ icon, error, className = '', ...props }) => (
  <div className="relative">
    {icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300">{icon}</span>}
    <input
      className={`w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-transparent rounded-xl text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all ${error ? 'border-red-400/50' : ''} ${className}`}
      aria-invalid={!!error}
      {...props}
    />
    {error && <p className="text-red-300 text-xs mt-1 pl-1">{error}</p>}
  </div>
);

export default TextInput;
