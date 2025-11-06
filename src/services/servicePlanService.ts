import api from './api';
import {
  ServicePackagePlan,
  PlanSuggestedPart,
  ServiceOrderChecklist,
  ChecklistWithSuggestionsResponse,
  CreatePlanRequest,
  AddSuggestedPartRequest,
  UpdateChecklistRequest,
  AddPartToOrderRequest,
  ServicePackagePlanResponse,
  ServiceOrderPartWithContext
} from '../types/servicePlan';

/**
 * Service để quản lý Plans và Suggested Parts
 */
class ServicePlanService {
  
  // ==================== ADMIN APIs ====================
  
  /**
   * Lấy tất cả plans cho một service package
   */
  async getPlansByPackage(packageId: string): Promise<ServicePackagePlanResponse[]> {
    const response = await api.get(`/api/service-packages/${packageId}/plans`);
    return response.data;
  }
  
  /**
   * Tạo plan mới cho service package
   */
  async createPlan(packageId: string, request: CreatePlanRequest): Promise<ServicePackagePlan> {
    const response = await api.post(`/api/service-packages/${packageId}/plans`, request);
    return response.data;
  }
  
  /**
   * Cập nhật plan
   */
  async updatePlan(planId: string, request: Partial<CreatePlanRequest>): Promise<ServicePackagePlan> {
    const response = await api.put(`/api/service-packages/plans/${planId}`, request);
    return response.data;
  }
  
  /**
   * Xóa plan
   */
  async deletePlan(planId: string): Promise<void> {
    await api.delete(`/api/service-packages/plans/${planId}`);
  }
  
  /**
   * Lấy suggested parts cho một plan
   */
  async getSuggestedParts(planId: string): Promise<PlanSuggestedPart[]> {
    const response = await api.get(`/api/service-packages/plans/${planId}/suggested-parts`);
    return response.data;
  }
  
  /**
   * Thêm suggested part cho plan
   */
  async addSuggestedPart(planId: string, request: AddSuggestedPartRequest): Promise<PlanSuggestedPart> {
    const response = await api.post(`/api/service-packages/plans/${planId}/suggested-parts`, request);
    return response.data;
  }
  
  /**
   * Xóa suggested part
   */
  async removeSuggestedPart(suggestedPartId: string): Promise<void> {
    await api.delete(`/api/service-packages/plans/suggested-parts/${suggestedPartId}`);
  }
  
  // ==================== TECHNICIAN APIs ====================
  
  /**
   * Lấy checklist với suggestions cho service order
   */
  async getChecklistWithSuggestions(serviceOrderId: string): Promise<ChecklistWithSuggestionsResponse> {
    const response = await api.get(`/api/service-orders/${serviceOrderId}/checklist`);
    return response.data;
  }
  
  /**
   * Cập nhật trạng thái checklist item
   */
  async updateChecklistItem(
    checklistId: string, 
    request: UpdateChecklistRequest
  ): Promise<ServiceOrderChecklist> {
    const response = await api.patch(`/api/service-orders/checklist/${checklistId}`, request);
    return response.data;
  }
  
  /**
   * Toggle complete status của checklist item
   */
  async toggleChecklistItem(checklistId: string, isCompleted: boolean): Promise<ServiceOrderChecklist> {
    return this.updateChecklistItem(checklistId, { isCompleted });
  }
  
  /**
   * Thêm custom checklist item
   */
  async addCustomChecklistItem(
    serviceOrderId: string,
    title: string,
    description?: string
  ): Promise<ServiceOrderChecklist> {
    const response = await api.post(`/api/service-orders/${serviceOrderId}/checklist`, {
      title,
      description
    });
    return response.data;
  }
  
  /**
   * Xóa checklist item (chỉ custom items)
   */
  async deleteChecklistItem(checklistId: string): Promise<void> {
    await api.delete(`/api/service-orders/checklist/${checklistId}`);
  }
  
  /**
   * Thêm part vào service order (từ suggestion hoặc manual)
   */
  async addPartToOrder(request: AddPartToOrderRequest): Promise<ServiceOrderPartWithContext> {
    const response = await api.post(
      `/api/service-orders/${request.serviceOrderId}/parts`,
      request
    );
    return response.data;
  }
  
  /**
   * Lấy danh sách parts đã dùng trong service order
   */
  async getOrderParts(serviceOrderId: string): Promise<ServiceOrderPartWithContext[]> {
    const response = await api.get(`/api/service-orders/${serviceOrderId}/parts`);
    return response.data;
  }
  
  /**
   * Xóa part khỏi service order
   */
  async removePartFromOrder(serviceOrderId: string, partId: string): Promise<void> {
    await api.delete(`/api/service-orders/${serviceOrderId}/parts/${partId}`);
  }
  
  /**
   * Cập nhật số lượng part
   */
  async updatePartQuantity(
    serviceOrderId: string,
    partId: string,
    quantity: number,
    technicianNote?: string
  ): Promise<ServiceOrderPartWithContext> {
    const response = await api.patch(
      `/api/service-orders/${serviceOrderId}/parts/${partId}`,
      { quantity, technicianNote }
    );
    return response.data;
  }
  
  // ==================== HELPER METHODS ====================
  
  /**
   * Lấy suggested parts cho checklist item hiện tại
   */
  async getSuggestedPartsForChecklistItem(
    checklistItemId: string
  ): Promise<PlanSuggestedPart[]> {
    const response = await api.get(`/api/service-orders/checklist/${checklistItemId}/suggested-parts`);
    return response.data;
  }
  
  /**
   * Sort suggested parts by priority
   */
  sortSuggestedPartsByPriority(parts: PlanSuggestedPart[]): PlanSuggestedPart[] {
    return [...parts].sort((a, b) => {
      // Commonly used first
      if (a.isCommonlyUsed && !b.isCommonlyUsed) return -1;
      if (!a.isCommonlyUsed && b.isCommonlyUsed) return 1;
      
      // Then by usage probability
      return b.usageProbability - a.usageProbability;
    });
  }
  
  /**
   * Filter suggested parts by probability threshold
   */
  filterByProbability(
    parts: PlanSuggestedPart[],
    minProbability: number = 0
  ): PlanSuggestedPart[] {
    return parts.filter(p => p.usageProbability >= minProbability);
  }
  
  /**
   * Get probability badge info
   */
  getProbabilityBadge(probability: number): {
    label: string;
    color: string;
    className: string;
  } {
    if (probability >= 70) {
      return { label: 'Rất cao', color: '#ef4444', className: 'high' };
    } else if (probability >= 50) {
      return { label: 'Cao', color: '#f59e0b', className: 'medium-high' };
    } else if (probability >= 30) {
      return { label: 'Trung bình', color: '#eab308', className: 'medium' };
    } else {
      return { label: 'Thấp', color: '#94a3b8', className: 'low' };
    }
  }
}

export default new ServicePlanService();
