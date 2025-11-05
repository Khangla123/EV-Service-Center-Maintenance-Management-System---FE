import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '' }) => (
  <div
    className={`relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden ${className}`}
    style={{
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    }}
  >
    {/* Sparkle gradient overlay */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-pulse opacity-60"></div>
      <div className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-r from-pink-400/30 to-blue-400/30 rounded-full blur-2xl animate-pulse"></div>
    </div>
    <div className="relative z-10">{children}</div>
  </div>
);

export default GlassPanel;
