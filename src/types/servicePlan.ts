// Service Plan Types
// Định nghĩa types cho hệ thống Plans và Parts Suggestions

import { Part } from './index';

/**
 * Plan mẫu cho mỗi Service Package
 */
export interface ServicePackagePlan {
  id: string;
  servicePackageId: string;
  title: string;
  description: string;
  sequenceOrder: number;
  isRequired: boolean;
  estimatedDurationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Phụ tùng gợi ý cho mỗi Plan
 */
export interface PlanSuggestedPart {
  id: string;
  planId: string;
  partId: string;
  part: Part; // Populated từ parts table
  suggestedQuantity: number;
  isCommonlyUsed: boolean;
  usageProbability: number; // 0-100, % khả năng cần dùng
  usageNote: string; // VD: "Thay nếu dung lượng pin < 70%"
  createdAt: Date;
}

/**
 * Checklist item thực tế trong Service Order
 */
export interface ServiceOrderChecklist {
  id: string;
  serviceOrderId: string;
  planId?: string; // null nếu là custom checklist
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string; // User ID
  notes?: string;
  sequenceOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated data
  plan?: ServicePackagePlan;
  suggestedParts?: PlanSuggestedPart[]; // Load từ plan_id
}

/**
 * Service Order Part với context
 * Mở rộng từ service_order_parts table
 */
export interface ServiceOrderPartWithContext {
  id: string;
  serviceOrderId: string;
  partId: string;
  part: Part;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  
  // New fields
  planId?: string; // Liên kết với plan nào
  isSuggested: boolean; // Từ gợi ý hay thêm thủ công
  technicianNote?: string;
  
  createdAt: Date;
}

/**
 * Response khi lấy checklist với suggestions
 */
export interface ChecklistWithSuggestionsResponse {
  checklist: ServiceOrderChecklist[];
  totalItems: number;
  completedItems: number;
  progressPercentage: number;
}

/**
 * Request tạo Plan mới
 */
export interface CreatePlanRequest {
  servicePackageId: string;
  title: string;
  description: string;
  sequenceOrder: number;
  isRequired: boolean;
  estimatedDurationMinutes: number;
}

/**
 * Request thêm Suggested Part
 */
export interface AddSuggestedPartRequest {
  planId: string;
  partId: string;
  suggestedQuantity: number;
  isCommonlyUsed: boolean;
  usageProbability: number;
  usageNote: string;
}

/**
 * Request cập nhật Checklist Item
 */
export interface UpdateChecklistRequest {
  isCompleted?: boolean;
  notes?: string;
}

/**
 * Request thêm Part vào Service Order
 */
export interface AddPartToOrderRequest {
  serviceOrderId: string;
  partId: string;
  planId?: string;
  quantity: number;
  isSuggested: boolean;
  technicianNote?: string;
}

/**
 * Response Plans cho Service Package
 */
export interface ServicePackagePlanResponse extends ServicePackagePlan {
  suggestedParts: PlanSuggestedPart[];
  suggestedPartsCount: number;
}
