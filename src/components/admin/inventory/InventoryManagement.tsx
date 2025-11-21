import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit,
  Box,
  ShoppingCart,
  X
} from 'lucide-react';
import partService, { PartResponse, CreatePartRequest, UpdatePartRequest } from '../../../services/partService';
import serviceCenterService from '../../../services/serviceCenterService';
import './InventoryManagement.css';

interface InventoryItem extends PartResponse {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const InventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [serviceCenters, setServiceCenters] = useState<any[]>([]);
  const [editingPart, setEditingPart] = useState<InventoryItem | null>(null);
  const [restockingPart, setRestockingPart] = useState<InventoryItem | null>(null);
  const [restockQuantity, setRestockQuantity] = useState(0);
  const [formData, setFormData] = useState<CreatePartRequest>({
    serviceCenterId: '',
    partCode: '',
    name: '',
    description: '',
    category: '',
    unitPrice: 0,
    stockQuantity: 0,
    minStockLevel: 0,
    supplier: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load separately to see which one fails
      let partsData: PartResponse[] = [];
      let centersData: any = { serviceCenters: [] };
      
      try {
        const rawPartsResponse = await partService.getAllParts();
        console.log('✅ Raw parts response:', rawPartsResponse);
        console.log('✅ Parts type:', typeof rawPartsResponse);
        console.log('✅ Is array?', Array.isArray(rawPartsResponse));
        
        // Handle response structure
        if (Array.isArray(rawPartsResponse)) {
          partsData = rawPartsResponse;
        } else if (rawPartsResponse && typeof rawPartsResponse === 'object') {
          console.log('✅ Response keys:', Object.keys(rawPartsResponse));
          // Try different possible response structures
          const responseObj = rawPartsResponse as any;
          partsData = responseObj.result || responseObj.data || responseObj.parts || [];
        }
        
        console.log('✅ Final parts data:', partsData);
        console.log('✅ Parts count:', partsData.length);
      } catch (partError: any) {
        console.error('❌ Parts error:', partError);
        console.error('❌ Error response:', partError.response?.data);
        console.error('❌ Error status:', partError.response?.status);
      }
      
      try {
        centersData = await serviceCenterService.getAllServiceCenters();
        console.log('✅ Centers loaded:', centersData);
        console.log('Centers structure:', JSON.stringify(centersData, null, 2));
      } catch (centerError: any) {
        console.error('❌ Centers error:', centerError.response?.data || centerError.message);
      }
      
      // Transform parts data to include status
      const inventoryWithStatus: InventoryItem[] = partsData.map(part => ({
        ...part,
        status: getStockStatus(part.stockQuantity, part.minStockLevel)
      }));
      
      setInventory(inventoryWithStatus);
      
      const centers = Array.isArray(centersData.serviceCenters) ? centersData.serviceCenters : [];
      setServiceCenters(centers);
      
      console.log('📊 Final: Parts=' + partsData.length + ', Centers=' + centers.length);
    } catch (error: any) {
      console.error('💥 Fatal error:', error);
      alert('Lỗi: ' + (error.message || 'Không thể tải dữ liệu'));
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current: number, min: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
    if (current === 0) return 'out-of-stock';
    if (current <= min) return 'low-stock';
    return 'in-stock';
  };

  const handleAddPart = () => {
    if (serviceCenters.length === 0) {
      alert('Chưa có trung tâm dịch vụ nào. Vui lòng thêm trung tâm dịch vụ trước.');
      return;
    }
    
    setShowAddModal(true);
    // Set default service center if available
    if (serviceCenters.length > 0) {
      setFormData(prev => ({
        ...prev,
        serviceCenterId: serviceCenters[0].id
      }));
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormData({
      serviceCenterId: '',
      partCode: '',
      name: '',
      description: '',
      category: '',
      unitPrice: 0,
      stockQuantity: 0,
      minStockLevel: 0,
      supplier: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.serviceCenterId) {
      alert('Vui lòng chọn trung tâm dịch vụ');
      return;
    }
    if (!formData.partCode.trim()) {
      alert('Vui lòng nhập mã phụ tùng');
      return;
    }
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên phụ tùng');
      return;
    }
    if (!formData.category) {
      alert('Vui lòng chọn danh mục');
      return;
    }
    if (formData.unitPrice <= 0) {
      alert('Đơn giá phải lớn hơn 0');
      return;
    }
    if (formData.stockQuantity < 0) {
      alert('Số lượng tồn kho không được âm');
      return;
    }
    if (formData.minStockLevel < 0) {
      alert('Tồn kho tối thiểu không được âm');
      return;
    }

    try {
      setSubmitting(true);
      console.log('Creating part with data:', formData);
      
      // Prepare clean data
      const cleanData: CreatePartRequest = {
        serviceCenterId: formData.serviceCenterId.trim(),
        partCode: formData.partCode.trim(),
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        category: formData.category.trim(),
        unitPrice: Number(formData.unitPrice),
        stockQuantity: Number(formData.stockQuantity),
        minStockLevel: Number(formData.minStockLevel),
        supplier: formData.supplier?.trim() || undefined
      };
      
      console.log('Clean data to send:', cleanData);
      
      const result = await partService.createPart(cleanData);
      console.log('Part created successfully:', result);
      
      alert('Thêm phụ tùng thành công!');
      handleCloseModal();
      await loadData(); // Reload data
    } catch (error: any) {
      console.error('Error creating part:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message 
        || 'Không thể thêm phụ tùng. Vui lòng thử lại.';
      
      alert(`Lỗi: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'unitPrice' || name === 'stockQuantity' || name === 'minStockLevel'
        ? Number(value)
        : value
    }));
  };

  const handleEditPart = (part: InventoryItem) => {
    setEditingPart(part);
    setFormData({
      serviceCenterId: part.serviceCenterId,
      partCode: part.partCode,
      name: part.name,
      description: part.description || '',
      category: part.category,
      unitPrice: part.unitPrice,
      stockQuantity: part.stockQuantity,
      minStockLevel: part.minStockLevel,
      supplier: part.supplier || ''
    });
    setShowEditModal(true);
  };

  const handleOrderPart = (part: InventoryItem) => {
    setRestockingPart(part);
    setRestockQuantity(0);
    setShowRestockModal(true);
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;

    try {
      setSubmitting(true);
      
      const updateData: UpdatePartRequest = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        unitPrice: formData.unitPrice,
        minStockLevel: formData.minStockLevel,
        supplier: formData.supplier
      };

      await partService.updatePart(editingPart.id, updateData);
      alert('Cập nhật phụ tùng thành công!');
      setShowEditModal(false);
      setEditingPart(null);
      await loadData();
    } catch (error: any) {
      console.error('Error updating part:', error);
      alert(`Lỗi: ${error.response?.data?.message || 'Không thể cập nhật phụ tùng'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockingPart || restockQuantity <= 0) {
      alert('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    try {
      setSubmitting(true);
      await partService.restockPart(restockingPart.id, { quantity: restockQuantity });
      alert(`Nhập kho thành công ${restockQuantity} ${restockingPart.name}!`);
      setShowRestockModal(false);
      setRestockingPart(null);
      setRestockQuantity(0);
      await loadData();
    } catch (error: any) {
      console.error('Error restocking part:', error);
      alert(`Lỗi: ${error.response?.data?.message || 'Không thể nhập kho'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const stats = [
    {
      label: 'Tổng số mặt hàng',
      value: inventory.length.toString(),
      icon: <Package size={20} />,
      color: 'blue'
    },
    {
      label: 'Tồn kho thấp',
      value: inventory.filter(i => i.status === 'low-stock').length.toString(),
      icon: <AlertTriangle size={20} />,
      color: 'yellow'
    },
    {
      label: 'Hết hàng',
      value: inventory.filter(i => i.status === 'out-of-stock').length.toString(),
      icon: <Box size={20} />,
      color: 'red'
    },
    {
      label: 'Giá trị kho',
      value: '₫2.5B',
      icon: <TrendingUp size={20} />,
      color: 'green'
    }
  ];

  const aiSuggestions = [
    {
      id: '1',
      item: 'Pin VinFast VF8',
      suggestedQuantity: 10,
      reason: 'Dự kiến cần cho 8 lịch hẹn trong 2 tuần tới',
      priority: 'high'
    },
    {
      id: '2',
      item: 'Lốp Michelin EV',
      suggestedQuantity: 20,
      reason: 'Hết hàng, có 5 đơn đặt hàng đang chờ',
      priority: 'urgent'
    },
    {
      id: '3',
      item: 'Hệ thống làm mát pin',
      suggestedQuantity: 8,
      reason: 'Tồn kho thấp, xu hướng tăng 15% tháng này',
      priority: 'medium'
    }
  ];

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'in-stock': return 'status-in-stock';
      case 'low-stock': return 'status-low-stock';
      case 'out-of-stock': return 'status-out-of-stock';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-stock': return 'Còn hàng';
      case 'low-stock': return 'Sắp hết';
      case 'out-of-stock': return 'Hết hàng';
      default: return status;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      default: return '';
    }
  };

  return (
    <div className="inventory-management">
      <div className="inventory-header">
        <div className="header-left">
          <h1>Quản lý Kho Phụ tùng</h1>
          <p>Theo dõi tồn kho và đề xuất nhập hàng thông minh</p>
        </div>
      </div>

      {/* Stats */}
      <div className="inventory-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="ai-suggestions-section">
        <div className="section-header">
          <TrendingUp size={20} />
          <h2>Gợi ý Đặt hàng từ AI</h2>
        </div>
        <div className="suggestions-list">
          {aiSuggestions.map((suggestion) => (
            <div key={suggestion.id} className={`suggestion-card ${getPriorityClass(suggestion.priority)}`}>
              <div className="suggestion-info">
                <h4>{suggestion.item}</h4>
                <p className="suggestion-reason">{suggestion.reason}</p>
                <p className="suggestion-quantity">Đề xuất: <strong>{suggestion.suggestedQuantity} chiếc</strong></p>
              </div>
              <div className="suggestion-actions">
                <button className="btn-approve">Phê duyệt</button>
                <button className="btn-adjust">Điều chỉnh</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="inventory-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm phụ tùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Tất cả danh mục</option>
            <option value="Pin EV">Pin EV</option>
            <option value="Lốp xe">Lốp xe</option>
            <option value="Phụ kiện sạc">Phụ kiện sạc</option>
            <option value="Phụ tùng hệ thống">Phụ tùng hệ thống</option>
          </select>

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="in-stock">Còn hàng</option>
            <option value="low-stock">Sắp hết</option>
            <option value="out-of-stock">Hết hàng</option>
          </select>
        </div>

        <button className="btn-add-item" onClick={handleAddPart}>
          <Plus size={20} />
          Thêm phụ tùng
        </button>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Phụ tùng</th>
              <th>Danh mục</th>
              <th>Tồn kho</th>
              <th>Tối thiểu</th>
              <th>Đơn giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="item-info">
                    <div className="item-icon">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="item-name">{item.name}</p>
                      <p className="item-id">ID: {item.id}</p>
                    </div>
                  </div>
                </td>
                <td>{item.category}</td>
                <td>
                  <span className="stock-number">{item.stockQuantity}</span>
                </td>
                <td>{item.minStockLevel}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-action btn-edit" 
                      title="Chỉnh sửa"
                      onClick={() => handleEditPart(item)}
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-action btn-order" 
                      title="Đặt hàng"
                      onClick={() => handleOrderPart(item)}
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredInventory.length === 0 && (
        <div className="no-results">
          <Package size={48} />
          <p>Không tìm thấy phụ tùng nào</p>
        </div>
      )}

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm phụ tùng mới</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Trung tâm dịch vụ <span className="required">*</span></label>
                    <select
                      name="serviceCenterId"
                      value={formData.serviceCenterId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Chọn trung tâm --</option>
                      {serviceCenters.map(center => (
                        <option key={center.id} value={center.id}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Mã phụ tùng <span className="required">*</span></label>
                    <input
                      type="text"
                      name="partCode"
                      value={formData.partCode}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: PART-001"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Tên phụ tùng <span className="required">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Ví dụ: Pin VinFast VF8"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Mô tả</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Mô tả chi tiết về phụ tùng..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Danh mục <span className="required">*</span></label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      <option value="Pin EV">Pin EV</option>
                      <option value="Lốp xe">Lốp xe</option>
                      <option value="Phụ kiện sạc">Phụ kiện sạc</option>
                      <option value="Phụ tùng hệ thống">Phụ tùng hệ thống</option>
                      <option value="Động cơ điện">Động cơ điện</option>
                      <option value="Hệ thống phanh">Hệ thống phanh</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="Tên nhà cung cấp"
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn giá (VNĐ) <span className="required">*</span></label>
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Số lượng tồn kho <span className="required">*</span></label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Tồn kho tối thiểu <span className="required">*</span></label>
                    <input
                      type="number"
                      name="minStockLevel"
                      value={formData.minStockLevel}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang thêm...' : 'Thêm phụ tùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {showEditModal && editingPart && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chỉnh sửa phụ tùng</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdatePart}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Tên phụ tùng</label>
                    <input
                      type="text"
                      value={editingPart.name}
                      onChange={(e) => setEditingPart({...editingPart, name: e.target.value})}
                      placeholder="Tên phụ tùng"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Mô tả</label>
                    <textarea
                      value={editingPart.description || ''}
                      onChange={(e) => setEditingPart({...editingPart, description: e.target.value})}
                      placeholder="Mô tả chi tiết về phụ tùng..."
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label>Danh mục</label>
                    <select
                      value={editingPart.category}
                      onChange={(e) => setEditingPart({...editingPart, category: e.target.value})}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      <option value="Pin EV">Pin EV</option>
                      <option value="Lốp xe">Lốp xe</option>
                      <option value="Phụ kiện sạc">Phụ kiện sạc</option>
                      <option value="Phụ tùng hệ thống">Phụ tùng hệ thống</option>
                      <option value="Động cơ điện">Động cơ điện</option>
                      <option value="Hệ thống phanh">Hệ thống phanh</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nhà cung cấp</label>
                    <input
                      type="text"
                      value={editingPart.supplier || ''}
                      onChange={(e) => setEditingPart({...editingPart, supplier: e.target.value})}
                      placeholder="Tên nhà cung cấp"
                    />
                  </div>

                  <div className="form-group">
                    <label>Đơn giá (VNĐ)</label>
                    <input
                      type="number"
                      value={editingPart.unitPrice}
                      onChange={(e) => setEditingPart({...editingPart, unitPrice: Number(e.target.value)})}
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Tồn kho tối thiểu</label>
                    <input
                      type="number"
                      value={editingPart.minStockLevel}
                      onChange={(e) => setEditingPart({...editingPart, minStockLevel: Number(e.target.value)})}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Part Modal */}
      {showRestockModal && restockingPart && (
        <div className="modal-overlay" onClick={() => setShowRestockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nhập kho phụ tùng</h2>
              <button className="close-btn" onClick={() => setShowRestockModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleRestockSubmit}>
              <div className="modal-body">
                <div className="info-section" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <p><strong>Phụ tùng:</strong> {restockingPart.name}</p>
                  <p><strong>Mã:</strong> {restockingPart.partCode}</p>
                  <p><strong>Tồn kho hiện tại:</strong> {restockingPart.stockQuantity}</p>
                </div>

                <div className="form-group">
                  <label>Số lượng nhập kho <span className="required">*</span></label>
                  <input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(Number(e.target.value))}
                    min="1"
                    placeholder="Nhập số lượng"
                    required
                    autoFocus
                  />
                  <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                    Tồn kho sau nhập: {restockingPart.stockQuantity + restockQuantity}
                  </small>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowRestockModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || restockQuantity <= 0}
                >
                  {submitting ? 'Đang nhập kho...' : 'Xác nhận nhập kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
