import React from 'react';
import { Package, AlertCircle, TrendingUp } from 'lucide-react';
import { PlanSuggestedPart } from '../../../types/servicePlan';
import servicePlanService from '../../../services/servicePlanService';
import './SuggestedPartCard.css';

interface SuggestedPartCardProps {
  suggestedPart: PlanSuggestedPart;
  onSelect: (part: PlanSuggestedPart) => void;
  disabled?: boolean;
}

const SuggestedPartCard: React.FC<SuggestedPartCardProps> = ({
  suggestedPart,
  onSelect,
  disabled = false
}) => {
  const { part, usageProbability, isCommonlyUsed, usageNote, suggestedQuantity } = suggestedPart;
  
  const probabilityInfo = servicePlanService.getProbabilityBadge(usageProbability);
  const isOutOfStock = part.currentStock === 0;
  const isLowStock = part.currentStock <= part.minimumStock && part.currentStock > 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };
  
  return (
    <div className={`suggested-part-card ${probabilityInfo.className} ${isOutOfStock ? 'out-of-stock' : ''}`}>
      {/* Badges */}
      <div className="card-badges">
        {isCommonlyUsed && (
          <span className="badge commonly-used">
            🔥 Thường dùng
          </span>
        )}
        <span 
          className={`badge probability ${probabilityInfo.className}`}
          style={{ backgroundColor: probabilityInfo.color }}
        >
          <TrendingUp size={12} />
          {usageProbability}% cần dùng
        </span>
      </div>
      
      {/* Part Info */}
      <div className="part-main-info">
        <div className="part-icon">
          <Package size={24} />
        </div>
        <div className="part-details">
          <h6 className="part-name">{part.name}</h6>
          <div className="part-code">Mã: {part.partNumber}</div>
        </div>
      </div>
      
      {/* Meta Info */}
      <div className="part-meta">
        <div className="meta-item">
          <span className="label">Tồn kho:</span>
          <span className={`value ${isLowStock ? 'low-stock' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}>
            {part.currentStock} {part.location}
            {isLowStock && !isOutOfStock && (
              <AlertCircle size={14} className="warning-icon" />
            )}
          </span>
        </div>
        <div className="meta-item">
          <span className="label">Đề xuất:</span>
          <span className="value">{suggestedQuantity} {part.location}</span>
        </div>
        <div className="meta-item">
          <span className="label">Giá:</span>
          <span className="value price">{formatCurrency(part.unitPrice)}</span>
        </div>
      </div>
      
      {/* Usage Note */}
      {usageNote && (
        <div className="usage-note">
          <AlertCircle size={14} />
          <span>{usageNote}</span>
        </div>
      )}
      
      {/* Action Button */}
      <button
        className="btn-select-part"
        onClick={() => onSelect(suggestedPart)}
        disabled={disabled || isOutOfStock}
      >
        {isOutOfStock ? (
          <>
            <AlertCircle size={16} />
            Hết hàng
          </>
        ) : (
          <>
            <Package size={16} />
            Chọn phụ tùng
          </>
        )}
      </button>
      
      {isLowStock && !isOutOfStock && (
        <div className="stock-warning">
          ⚠️ Sắp hết hàng
        </div>
      )}
    </div>
  );
};

export default SuggestedPartCard;
