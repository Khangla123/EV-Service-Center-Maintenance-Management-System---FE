import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Plus,
  Edit,
  Box,
  ShoppingCart
} from 'lucide-react';
import './InventoryManagement.css';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const InventoryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [inventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Pin VinFast VF8',
      category: 'Pin EV',
      currentStock: 3,
      minStock: 5,
      maxStock: 20,
      unitPrice: 150000000,
      status: 'low-stock'
    },
    {
      id: '2',
      name: 'Pin VinFast VF9',
      category: 'Pin EV',
      currentStock: 8,
      minStock: 5,
      maxStock: 15,
      unitPrice: 180000000,
      status: 'in-stock'
    },
    {
      id: '3',
      name: 'Lốp Michelin EV',
      category: 'Lốp xe',
      currentStock: 0,
      minStock: 10,
      maxStock: 50,
      unitPrice: 3500000,
      status: 'out-of-stock'
    },
    {
      id: '4',
      name: 'Bộ sạc nhanh DC',
      category: 'Phụ kiện sạc',
      currentStock: 12,
      minStock: 8,
      maxStock: 25,
      unitPrice: 25000000,
      status: 'in-stock'
    },
    {
      id: '5',
      name: 'Hệ thống làm mát pin',
      category: 'Phụ tùng hệ thống',
      currentStock: 4,
      minStock: 5,
      maxStock: 15,
      unitPrice: 45000000,
      status: 'low-stock'
    }
  ]);

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
        <button className="btn-add-item">
          <Plus size={20} />
          Thêm phụ tùng
        </button>
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
                  <span className="stock-number">{item.currentStock}</span>
                </td>
                <td>{item.minStock}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.status)}`}>
                    {getStatusText(item.status)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-action btn-edit" title="Chỉnh sửa">
                      <Edit size={16} />
                    </button>
                    <button className="btn-action btn-order" title="Đặt hàng">
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
    </div>
  );
};

export default InventoryManagement;
