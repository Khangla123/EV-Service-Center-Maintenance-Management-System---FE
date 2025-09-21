import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex items-center bg-white/10 rounded-2xl p-4 hover:bg-white/20 transition-all border border-white/10 shadow-lg">
    <div className="flex-shrink-0 w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center mr-4">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-white mb-1">{title}</h4>
      {description && <p className="text-blue-200 text-xs">{description}</p>}
    </div>
  </div>
);

export default FeatureCard;
