/**
 * Service Plan Service Module
 * Quản lý Plans, Suggested Parts và Checklists cho service packages
 * @module services/servicePlanService
 */

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
 * ServicePlanService Class
 * Service để quản lý Plans, Suggested Parts và Service Order Checklists
 * Hỗ trợ cả Admin APIs (quản lý plans) và Technician APIs (thực hiện checklist)
 * @class ServicePlanService
 */
class ServicePlanService {
  
  // ==================== ADMIN APIs ====================
  
  /**
   * getPlansByPackage - Lấy tất cả plans cho một service package
   * @param {string} packageId - UUID của service package
   * @returns {Promise<ServicePackagePlanResponse[]>} Danh sách plans
   * @example
   * const plans = await servicePlanService.getPlansByPackage('package-uuid');
   */
  async getPlansByPackage(packageId: string): Promise<ServicePackagePlanResponse[]> {
    const response = await api.get(`/api/service-packages/${packageId}/plans`);
    return response.data;
  }
  
  /**
   * createPlan - Tạo plan mới cho service package (Admin)
   * @param {string} packageId - UUID của service package
   * @param {CreatePlanRequest} request - Thông tin plan
   * @returns {Promise<ServicePackagePlan>} Plan vừa tạo
   * @example
   * const plan = await servicePlanService.createPlan('package-uuid', {
   *   title: 'Kiểm tra hệ thống phanh',
   *   description: 'Kiểm tra đĩa phanh, dầu phanh',
   *   stepOrder: 1
   * });
   */
  async createPlan(packageId: string, request: CreatePlanRequest): Promise<ServicePackagePlan> {
    const response = await api.post(`/api/service-packages/${packageId}/plans`, request);
    return response.data;
  }
  
  /**
   * updatePlan - Cập nhật plan (Admin)
   * @param {string} planId - UUID của plan
   * @param {Partial<CreatePlanRequest>} request - Dữ liệu cần cập nhật
   * @returns {Promise<ServicePackagePlan>} Plan sau khi update
   * @example
   * const updated = await servicePlanService.updatePlan('plan-uuid', {
   *   title: 'Kiểm tra hệ thống phanh (cập nhật)'
   * });
   */
  async updatePlan(planId: string, request: Partial<CreatePlanRequest>): Promise<ServicePackagePlan> {
    const response = await api.put(`/api/service-packages/plans/${planId}`, request);
    return response.data;
  }
  
  /**
   * deletePlan - Xóa plan (Admin)
   * @param {string} planId - UUID của plan cần xóa
   * @returns {Promise<void>}
   * @example
   * await servicePlanService.deletePlan('plan-uuid');
   */
  async deletePlan(planId: string): Promise<void> {
    await api.delete(`/api/service-packages/plans/${planId}`);
  }
  
  /**
   * getSuggestedParts - Lấy suggested parts cho một plan (Admin)
   * @param {string} planId - UUID của plan
   * @returns {Promise<PlanSuggestedPart[]>} Danh sách suggested parts
   * @example
   * const parts = await servicePlanService.getSuggestedParts('plan-uuid');
   */
  async getSuggestedParts(planId: string): Promise<PlanSuggestedPart[]> {
    const response = await api.get(`/api/service-packages/plans/${planId}/suggested-parts`);
    return response.data;
  }
  
  /**
   * addSuggestedPart - Thêm suggested part cho plan (Admin)
   * @param {string} planId - UUID của plan
   * @param {AddSuggestedPartRequest} request - Thông tin suggested part
   * @returns {Promise<PlanSuggestedPart>} Suggested part vừa thêm
   * @example
   * const suggestedPart = await servicePlanService.addSuggestedPart('plan-uuid', {
   *   partId: 'part-uuid',
   *   usageProbability: 85,
   *   isCommonlyUsed: true
   * });
   */
  async addSuggestedPart(planId: string, request: AddSuggestedPartRequest): Promise<PlanSuggestedPart> {
    const response = await api.post(`/api/service-packages/plans/${planId}/suggested-parts`, request);
    return response.data;
  }
  
  /**
   * removeSuggestedPart - Xóa suggested part (Admin)
   * @param {string} suggestedPartId - UUID của suggested part
   * @returns {Promise<void>}
   * @example
   * await servicePlanService.removeSuggestedPart('suggested-part-uuid');
   */
  async removeSuggestedPart(suggestedPartId: string): Promise<void> {
    await api.delete(`/api/service-packages/plans/suggested-parts/${suggestedPartId}`);
  }
  
  // ==================== TECHNICIAN APIs ====================
  
  /**
   * getChecklistWithSuggestions - Lấy checklist với suggestions cho service order (Technician)
   * @param {string} serviceOrderId - UUID của service order
   * @returns {Promise<ChecklistWithSuggestionsResponse>} Checklist và suggested parts
   * @example
   * const checklist = await servicePlanService.getChecklistWithSuggestions('order-uuid');
   */
  async getChecklistWithSuggestions(serviceOrderId: string): Promise<ChecklistWithSuggestionsResponse> {
    const response = await api.get(`/api/service-orders/${serviceOrderId}/checklist`);
    return response.data;
  }
  
  /**
   * updateChecklistItem - Cập nhật trạng thái checklist item (Technician)
   * @param {string} checklistId - UUID của checklist item
   * @param {UpdateChecklistRequest} request - Dữ liệu cần cập nhật
   * @returns {Promise<ServiceOrderChecklist>} Checklist item sau khi update
   * @example
   * const updated = await servicePlanService.updateChecklistItem('checklist-uuid', {
   *   isCompleted: true,
   *   technicianNotes: 'Đã kiểm tra xong'
   * });
   */
  async updateChecklistItem(
    checklistId: string, 
    request: UpdateChecklistRequest
  ): Promise<ServiceOrderChecklist> {
    const response = await api.patch(`/api/service-orders/checklist/${checklistId}`, request);
    return response.data;
  }
  
  /**
   * toggleChecklistItem - Toggle complete status của checklist item
   * @param {string} checklistId - UUID của checklist item
   * @param {boolean} isCompleted - Trạng thái hoàn thành
   * @returns {Promise<ServiceOrderChecklist>} Checklist item sau khi toggle
   * @example
   * const toggled = await servicePlanService.toggleChecklistItem('checklist-uuid', true);
   */
  async toggleChecklistItem(checklistId: string, isCompleted: boolean): Promise<ServiceOrderChecklist> {
    return this.updateChecklistItem(checklistId, { isCompleted });
  }
  
  /**
   * addCustomChecklistItem - Thêm custom checklist item (Technician)
   * @param {string} serviceOrderId - UUID của service order
   * @param {string} title - Tiêu đề checklist item
   * @param {string} description - Mô tả (optional)
   * @returns {Promise<ServiceOrderChecklist>} Checklist item vừa tạo
   * @example
   * const customItem = await servicePlanService.addCustomChecklistItem(
   *   'order-uuid',
   *   'Kiểm tra thêm',
   *   'Phát hiện vấn đề khác'
   * );
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
   * deleteChecklistItem - Xóa checklist item (chỉ custom items) (Technician)
   * @param {string} checklistId - UUID của checklist item
   * @returns {Promise<void>}
   * @example
   * await servicePlanService.deleteChecklistItem('checklist-uuid');
   */
  async deleteChecklistItem(checklistId: string): Promise<void> {
    await api.delete(`/api/service-orders/checklist/${checklistId}`);
  }
  
  /**
   * addPartToOrder - Thêm part vào service order (từ suggestion hoặc manual) (Technician)
   * @param {AddPartToOrderRequest} request - Thông tin part và service order
   * @returns {Promise<ServiceOrderPartWithContext>} Part vừa thêm vào order
   * @example
   * const addedPart = await servicePlanService.addPartToOrder({
   *   serviceOrderId: 'order-uuid',
   *   partId: 'part-uuid',
   *   quantity: 2,
   *   technicianNote: 'Thay thế theo khuyến nghị'
   * });
   */
  async addPartToOrder(request: AddPartToOrderRequest): Promise<ServiceOrderPartWithContext> {
    const response = await api.post(
      `/api/service-orders/${request.serviceOrderId}/parts`,
      request
    );
    return response.data;
  }
  
  /**
   * getOrderParts - Lấy danh sách parts đã dùng trong service order (Technician)
   * @param {string} serviceOrderId - UUID của service order
   * @returns {Promise<ServiceOrderPartWithContext[]>} Danh sách parts
   * @example
   * const parts = await servicePlanService.getOrderParts('order-uuid');
   */
  async getOrderParts(serviceOrderId: string): Promise<ServiceOrderPartWithContext[]> {
    const response = await api.get(`/api/service-orders/${serviceOrderId}/parts`);
    return response.data;
  }
  
  /**
   * removePartFromOrder - Xóa part khỏi service order (Technician)
   * @param {string} serviceOrderId - UUID của service order
   * @param {string} partId - UUID của part cần xóa
   * @returns {Promise<void>}
   * @example
   * await servicePlanService.removePartFromOrder('order-uuid', 'part-uuid');
   */
  async removePartFromOrder(serviceOrderId: string, partId: string): Promise<void> {
    await api.delete(`/api/service-orders/${serviceOrderId}/parts/${partId}`);
  }
  
  /**
   * updatePartQuantity - Cập nhật số lượng part (Technician)
   * @param {string} serviceOrderId - UUID của service order
   * @param {string} partId - UUID của part
   * @param {number} quantity - Số lượng mới
   * @param {string} technicianNote - Ghi chú (optional)
   * @returns {Promise<ServiceOrderPartWithContext>} Part sau khi update
   * @example
   * const updated = await servicePlanService.updatePartQuantity(
   *   'order-uuid',
   *   'part-uuid',
   *   3,
   *   'Tăng số lượng do phát hiện thêm vấn đề'
   * );
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
   * getSuggestedPartsForChecklistItem - Lấy suggested parts cho checklist item hiện tại
   * @param {string} checklistItemId - UUID của checklist item
   * @returns {Promise<PlanSuggestedPart[]>} Danh sách suggested parts
   * @example
   * const suggestions = await servicePlanService.getSuggestedPartsForChecklistItem('checklist-uuid');
   */
  async getSuggestedPartsForChecklistItem(
    checklistItemId: string
  ): Promise<PlanSuggestedPart[]> {
    const response = await api.get(`/api/service-orders/checklist/${checklistItemId}/suggested-parts`);
    return response.data;
  }
  
  /**
   * sortSuggestedPartsByPriority - Sắp xếp suggested parts theo độ ưu tiên
   * Sắp xếp theo: isCommonlyUsed (commonly used đầu tiên) -> usageProbability (cao đến thấp)
   * @param {PlanSuggestedPart[]} parts - Danh sách parts cần sắp xếp
   * @returns {PlanSuggestedPart[]} Danh sách đã sắp xếp
   * @example
   * const sorted = servicePlanService.sortSuggestedPartsByPriority(suggestedParts);
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
   * filterByProbability - Lọc suggested parts theo ngưỡng xác suất tối thiểu
   * @param {PlanSuggestedPart[]} parts - Danh sách parts cần lọc
   * @param {number} minProbability - Xác suất tối thiểu (0-100), mặc định 0
   * @returns {PlanSuggestedPart[]} Danh sách đã lọc
   * @example
   * const highProbability = servicePlanService.filterByProbability(parts, 70);
   */
  filterByProbability(
    parts: PlanSuggestedPart[],
    minProbability: number = 0
  ): PlanSuggestedPart[] {
    return parts.filter(p => p.usageProbability >= minProbability);
  }
  
  /**
   * getProbabilityBadge - Lấy thông tin badge hiển thị cho xác suất
   * Trả về label, color và className dựa trên mức độ xác suất
   * @param {number} probability - Xác suất (0-100)
   * @returns {Object} Badge info {label, color, className}
   * @example
   * const badge = servicePlanService.getProbabilityBadge(85);
   * // Returns: { label: 'Rất cao', color: '#ef4444', className: 'high' }
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
