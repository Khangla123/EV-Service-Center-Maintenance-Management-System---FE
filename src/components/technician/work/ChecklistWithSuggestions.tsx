import React, { useState } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Plus, Trash2, Lightbulb } from 'lucide-react';
import { ServiceOrderChecklist, PlanSuggestedPart } from '../../../types/servicePlan';
import SuggestedPartCard from './SuggestedPartCard';
import servicePlanService from '../../../services/servicePlanService';
import './ChecklistWithSuggestions.css';

interface ChecklistWithSuggestionsProps {
  checklist: ServiceOrderChecklist[];
  onToggle: (checklistId: string, isCompleted: boolean) => Promise<void>;
  onAddCustomItem: (title: string, description?: string) => Promise<void>;
  onDeleteItem: (checklistId: string) => Promise<void>;
  onSelectPart: (part: PlanSuggestedPart, checklistItem: ServiceOrderChecklist) => void;
}

const ChecklistWithSuggestions: React.FC<ChecklistWithSuggestionsProps> = ({
  checklist,
  onToggle,
  onAddCustomItem,
  onDeleteItem,
  onSelectPart
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  
  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };
  
  const handleToggleCheckbox = async (item: ServiceOrderChecklist) => {
    setLoadingItems(prev => new Set(prev).add(item.id));
    try {
      await onToggle(item.id, !item.isCompleted);
    } finally {
      setLoadingItems(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  };
  
  const handleAddCustomItem = async () => {
    if (!newItemTitle.trim()) return;
    
    try {
      await onAddCustomItem(newItemTitle, newItemDescription);
      setNewItemTitle('');
      setNewItemDescription('');
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding custom item:', error);
    }
  };
  
  const sortedChecklist = [...checklist].sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  const completedCount = checklist.filter(item => item.isCompleted).length;
  const totalCount = checklist.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  // Tự động expand item đầu tiên chưa hoàn thành
  React.useEffect(() => {
    const firstIncomplete = sortedChecklist.find(item => !item.isCompleted);
    if (firstIncomplete && !expandedItems.has(firstIncomplete.id)) {
      setExpandedItems(new Set([firstIncomplete.id]));
    }
  }, [sortedChecklist]);
  
  return (
    <div className="checklist-with-suggestions">
      {/* Progress Header */}
      <div className="checklist-header">
        <div className="header-title">
          <CheckCircle2 size={20} />
          <h3>Checklist Kỹ thuật</h3>
          <span className="count-badge">{completedCount}/{totalCount}</span>
        </div>
        <button 
          className="btn-add-item"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus size={16} />
          Thêm hạng mục
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="progress-text">{progressPercentage}% hoàn thành</span>
      </div>
      
      {/* Add Custom Item Form */}
      {showAddForm && (
        <div className="add-item-form">
          <input
            type="text"
            placeholder="Tên hạng mục..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCustomItem()}
          />
          <textarea
            placeholder="Mô tả (tùy chọn)..."
            value={newItemDescription}
            onChange={(e) => setNewItemDescription(e.target.value)}
            rows={2}
          />
          <div className="form-actions">
            <button 
              className="btn-cancel"
              onClick={() => {
                setShowAddForm(false);
                setNewItemTitle('');
                setNewItemDescription('');
              }}
            >
              Hủy
            </button>
            <button 
              className="btn-save"
              onClick={handleAddCustomItem}
              disabled={!newItemTitle.trim()}
            >
              <Plus size={16} />
              Thêm
            </button>
          </div>
        </div>
      )}
      
      {/* Checklist Items */}
      <div className="checklist-items">
        {sortedChecklist.map((item, index) => {
          const isExpanded = expandedItems.has(item.id);
          const hasSuggestions = item.suggestedParts && item.suggestedParts.length > 0;
          const sortedSuggestions = hasSuggestions 
            ? servicePlanService.sortSuggestedPartsByPriority(item.suggestedParts!)
            : [];
          const isLoading = loadingItems.has(item.id);
          
          return (
            <div 
              key={item.id}
              className={`checklist-item ${item.isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}
            >
              {/* Item Header */}
              <div className="item-header">
                <div className="item-main">
                  <button
                    className="checkbox-btn"
                    onClick={() => handleToggleCheckbox(item)}
                    disabled={isLoading}
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 size={20} className="icon-completed" />
                    ) : (
                      <Circle size={20} className="icon-pending" />
                    )}
                  </button>
                  
                  <div className="item-content">
                    <div className="item-title-row">
                      <span className="item-number">{index + 1}.</span>
                      <h4 className="item-title">{item.title}</h4>
                      {!item.planId && (
                        <span className="custom-badge">Custom</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="item-description">{item.description}</p>
                    )}
                    {hasSuggestions && (
                      <div className="suggestions-indicator">
                        <Lightbulb size={14} />
                        <span>{sortedSuggestions.length} phụ tùng gợi ý</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="item-actions">
                  {hasSuggestions && (
                    <button
                      className="btn-expand"
                      onClick={() => toggleExpand(item.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                  )}
                  {!item.planId && (
                    <button
                      className="btn-delete"
                      onClick={() => onDeleteItem(item.id)}
                      title="Xóa hạng mục custom"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Expanded: Suggested Parts */}
              {isExpanded && hasSuggestions && (
                <div className="item-suggestions">
                  <div className="suggestions-header">
                    <Lightbulb size={18} />
                    <h5>Phụ tùng có thể cần ({sortedSuggestions.length})</h5>
                  </div>
                  
                  <div className="suggestions-list">
                    {sortedSuggestions.map(suggestedPart => (
                      <SuggestedPartCard
                        key={suggestedPart.id}
                        suggestedPart={suggestedPart}
                        onSelect={() => onSelectPart(suggestedPart, item)}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {item.notes && (
                <div className="item-notes">
                  <span className="notes-label">📝 Ghi chú:</span>
                  <span className="notes-text">{item.notes}</span>
                </div>
              )}
              
              {/* Completion Info */}
              {item.isCompleted && item.completedAt && (
                <div className="completion-info">
                  ✓ Hoàn thành lúc {new Date(item.completedAt).toLocaleString('vi-VN')}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Empty State */}
      {checklist.length === 0 && (
        <div className="empty-checklist">
          <CheckCircle2 size={48} strokeWidth={1.5} />
          <p>Chưa có checklist nào</p>
          <button 
            className="btn-add-first"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={16} />
            Thêm hạng mục đầu tiên
          </button>
        </div>
      )}
    </div>
  );
};

export default ChecklistWithSuggestions;
