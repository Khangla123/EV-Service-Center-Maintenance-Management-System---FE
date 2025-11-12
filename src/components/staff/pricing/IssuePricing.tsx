import React, { useState, useEffect } from 'react';
import { 
  Search, AlertCircle, CheckCircle, Clock, 
  Edit2, Save, X, RefreshCw, DollarSign
} from 'lucide-react';
import serviceOrderService, { ServiceOrder } from '../../../services/serviceOrderService';
import '../invoices/InvoiceManagement.css';

interface Issue {
  id: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation?: string;
  detectedAt?: string;
  price?: number | null;
  staffSetPrice?: boolean;
}

const IssuePricing: React.FC = () => {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingIssue, setEditingIssue] = useState<{ serviceOrderId: string; issueId: string } | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [savingPrice, setSavingPrice] = useState(false);

  useEffect(() => {
    loadServiceOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, serviceOrders]);

  const loadServiceOrders = async () => {
    try {
      setLoading(true);
      const response = await serviceOrderService.getAllServiceOrders();
      
      console.log('🔍 Raw API Response:', response);
      
      // Handle both array response and paginated response
      const orders = Array.isArray(response) ? response : (response.serviceOrders || []);
      
      console.log('📦 Orders array:', orders);
      console.log('📦 First order:', orders[0]);
      console.log('👤 First order customer:', orders[0]?.customer);
      console.log('🚗 First order vehicle:', orders[0]?.vehicle);
      
      // Filter orders that have issues
      const ordersWithIssues = orders.filter((order: ServiceOrder) => {
        if (!order.issues) return false;
        const issues = parseIssues(order.issues);
        return issues.length > 0;
      });
      
      console.log('✅ Orders with issues:', ordersWithIssues.length);
      
      setServiceOrders(ordersWithIssues);
      setFilteredOrders(ordersWithIssues);
    } catch (error) {
      console.error('Error loading service orders:', error);
      setServiceOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const parseIssues = (issuesData: any): Issue[] => {
    if (!issuesData) return [];
    
    try {
      if (typeof issuesData === 'string') {
        return JSON.parse(issuesData);
      }
      if (Array.isArray(issuesData)) {
        return issuesData;
      }
      return [];
    } catch (error) {
      console.error('Error parsing issues:', error);
      return [];
    }
  };

  const filterOrders = () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(serviceOrders);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = serviceOrders.filter(order => {
      const issues = parseIssues(order.issues);
      const matchesOrder = order.orderCode?.toLowerCase().includes(term);
      const matchesIssue = issues.some(issue => 
        issue.issue?.toLowerCase().includes(term)
      );
      
      return matchesOrder || matchesIssue;
    });

    setFilteredOrders(filtered);
  };

  const handleEditClick = (serviceOrderId: string, issueId: string, currentPrice?: number | null) => {
    setEditingIssue({ serviceOrderId, issueId });
    setPriceInput(currentPrice ? currentPrice.toString() : '');
  };

  const handleCancelEdit = () => {
    setEditingIssue(null);
    setPriceInput('');
  };

  const handleSavePrice = async () => {
    if (!editingIssue) return;

    const price = parseFloat(priceInput);
    if (isNaN(price) || price < 0) {
      alert('Vui lòng nhập giá hợp lệ!');
      return;
    }

    try {
      setSavingPrice(true);
      await serviceOrderService.setIssuePrice(
        editingIssue.serviceOrderId,
        editingIssue.issueId,
        price
      );

      // Reload data
      await loadServiceOrders();
      
      handleCancelEdit();
      alert('✅ Cập nhật giá thành công!');
    } catch (error) {
      console.error('Error saving price:', error);
      alert('❌ Lỗi khi cập nhật giá!');
    } finally {
      setSavingPrice(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      critical: { label: 'Nghiêm trọng', class: 'danger' },
      high: { label: 'Cao', class: 'warning' },
      medium: { label: 'Trung bình', class: 'warning' },
      low: { label: 'Thấp', class: 'success' }
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig] || severityConfig.medium;
    return (
      <span className={`status-badge ${config.class}`} style={{ fontSize: '11px' }}>
        <AlertCircle size={12} />
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Calculate statistics
  const stats = filteredOrders.reduce((acc, order) => {
    const issues = parseIssues(order.issues);
    issues.forEach(issue => {
      acc.total++;
      if (issue.staffSetPrice && issue.price !== null && issue.price !== undefined) {
        acc.priced++;
      } else {
        acc.pending++;
      }
    });
    return acc;
  }, { total: 0, priced: 0, pending: 0 });

  return (
    <div className="invoice-management">
      {/* Statistics */}
      <div className="invoice-stats">
        <div className="stat-card blue">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng vấn đề</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">
            <Clock size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Chờ định giá</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">
            <CheckCircle size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.priced}</div>
            <div className="stat-label">Đã định giá</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="invoice-controls">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, vấn đề phát hiện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button className="refresh-btn" onClick={loadServiceOrders}>
          <RefreshCw size={18} />
          Làm mới
        </button>
      </div>

      {/* Table */}
      <div className="invoice-table-container">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-data">
            <AlertCircle size={64} />
            <p>Không có vấn đề nào cần định giá</p>
            <p className="hint">Các vấn đề phát hiện bởi kỹ thuật viên sẽ xuất hiện ở đây</p>
          </div>
        ) : (
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Thông tin xe</th>
                <th>Vấn đề phát hiện</th>
                <th>Mức độ</th>
                <th>Phát hiện lúc</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const issues = parseIssues(order.issues);
                return issues.map((issue, index) => (
                  <tr key={`${order.id}-${issue.id}-${index}`}>
                    {index === 0 && (
                      <>
                        <td rowSpan={issues.length}>
                          <span className="invoice-code">#{order.orderCode}</span>
                        </td>
                        <td rowSpan={issues.length}>
                          <div style={{ fontSize: '13px', color: '#475569' }}>
                            <div>Khách: <strong>{order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'N/A'}</strong></div>
                            <div style={{ marginTop: '4px' }}>
                              Xe: <span className="license-plate" style={{ fontSize: '12px', padding: '4px 8px' }}>
                                {order.vehicle?.licensePlate || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </td>
                      </>
                    )}
                    <td>
                      <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '600' }}>
                        {issue.issue}
                      </div>
                      {issue.recommendation && (
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          💡 {issue.recommendation}
                        </div>
                      )}
                    </td>
                    <td>{getSeverityBadge(issue.severity)}</td>
                    <td style={{ fontSize: '13px', color: '#64748b' }}>
                      {formatDate(issue.detectedAt)}
                    </td>
                    <td>
                      {editingIssue?.serviceOrderId === order.id && editingIssue?.issueId === issue.id ? (
                        <input
                          type="number"
                          value={priceInput}
                          onChange={(e) => setPriceInput(e.target.value)}
                          placeholder="Nhập giá..."
                          min="0"
                          step="10000"
                          style={{
                            width: '120px',
                            padding: '8px 12px',
                            fontSize: '13px',
                            border: '2px solid #3b82f6',
                            borderRadius: '6px',
                            fontWeight: '600'
                          }}
                          autoFocus
                        />
                      ) : (
                        <span className="amount">
                          {issue.price !== null && issue.price !== undefined 
                            ? formatCurrency(issue.price)
                            : '-'}
                        </span>
                      )}
                    </td>
                    <td>
                      {issue.staffSetPrice ? (
                        <span className="status-badge success">
                          <CheckCircle size={14} />
                          Đã định giá
                        </span>
                      ) : (
                        <span className="status-badge warning">
                          <Clock size={14} />
                          Chờ định giá
                        </span>
                      )}
                    </td>
                    <td>
                      {editingIssue?.serviceOrderId === order.id && editingIssue?.issueId === issue.id ? (
                        <div className="action-buttons">
                          <button
                            className="action-btn"
                            onClick={handleSavePrice}
                            disabled={savingPrice}
                            style={{
                              background: '#dcfce7',
                              color: '#16a34a',
                              padding: '6px 12px',
                              gap: '4px',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                            title="Lưu giá"
                          >
                            <Save size={14} />
                            {savingPrice ? 'Đang lưu...' : 'Lưu'}
                          </button>
                          <button
                            className="action-btn"
                            onClick={handleCancelEdit}
                            disabled={savingPrice}
                            style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '6px',
                            }}
                            title="Hủy"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="action-btn"
                            onClick={() => handleEditClick(order.id, issue.id, issue.price)}
                            style={{
                              background: '#dbeafe',
                              color: '#3b82f6',
                              padding: '6px 12px',
                              gap: '4px',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}
                            title={issue.staffSetPrice ? 'Chỉnh sửa giá' : 'Định giá'}
                          >
                            <Edit2 size={14} />
                            {issue.staffSetPrice ? 'Sửa' : 'Định giá'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default IssuePricing;
