import React, { useState, useEffect } from 'react';
import { MDButton } from '../../ui';
import './CostManagement.css';

export interface CostRecord {
  id: string;
  date: Date;
  vehicleId: string;
  vehicleName: string;
  serviceType: string;
  serviceName: string;
  serviceCenter: string;
  laborCost: number;
  partsCost: number;
  additionalCosts: number;
  discount: number;
  tax: number;
  totalCost: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  category: 'maintenance' | 'repair' | 'inspection' | 'emergency';
  warrantyExpiry?: Date;
  parts: Array<{
    name: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }>;
  notes?: string;
}

export interface CostSummary {
  totalCosts: number;
  avgCostPerService: number;
  monthlyCosts: Record<string, number>;
  yearlyComparison: Record<string, number>;
  categoryBreakdown: Record<string, number>;
  vehicleBreakdown: Record<string, number>;
}

interface CostManagementProps {
  className?: string;
}

const CostManagement: React.FC<CostManagementProps> = ({ className }) => {
  const [costRecords, setCostRecords] = useState<CostRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<CostRecord[]>([]);
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<CostRecord | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  // Mock data
  useEffect(() => {
    const loadCostData = async () => {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecords: CostRecord[] = [
        {
          id: 'cost-001',
          date: new Date('2024-01-15'),
          vehicleId: 'vehicle-001',
          vehicleName: 'VinFast VF8 - 29A-12345',
          serviceType: 'Bảo dưỡng định kỳ',
          serviceName: 'Bảo dưỡng 10,000km',
          serviceCenter: 'VinFast Thảo Điền',
          laborCost: 500000,
          partsCost: 1200000,
          additionalCosts: 0,
          discount: 100000,
          tax: 160000,
          totalCost: 1760000,
          paymentMethod: 'Thẻ tín dụng',
          paymentStatus: 'paid',
          category: 'maintenance',
          warrantyExpiry: new Date('2025-01-15'),
          parts: [
            { name: 'Dầu động cơ', quantity: 4, unitCost: 150000, totalCost: 600000 },
            { name: 'Lọc dầu', quantity: 1, unitCost: 200000, totalCost: 200000 },
            { name: 'Lọc gió', quantity: 1, unitCost: 180000, totalCost: 180000 },
            { name: 'Phanh sau', quantity: 2, unitCost: 110000, totalCost: 220000 }
          ],
          notes: 'Bảo dưỡng đúng lịch, xe hoạt động tốt'
        },
        {
          id: 'cost-002',
          date: new Date('2024-02-20'),
          vehicleId: 'vehicle-002',
          vehicleName: 'VinFast VF9 - 30B-67890',
          serviceType: 'Sửa chữa',
          serviceName: 'Thay pin sạc',
          serviceCenter: 'VinFast Quận 7',
          laborCost: 800000,
          partsCost: 15000000,
          additionalCosts: 500000,
          discount: 0,
          tax: 1630000,
          totalCost: 17930000,
          paymentMethod: 'Chuyển khoản',
          paymentStatus: 'paid',
          category: 'repair',
          warrantyExpiry: new Date('2026-02-20'),
          parts: [
            { name: 'Pin lithium 75kWh', quantity: 1, unitCost: 15000000, totalCost: 15000000 }
          ],
          notes: 'Thay pin do hỏng cell, bảo hành 2 năm'
        },
        {
          id: 'cost-003',
          date: new Date('2024-03-10'),
          vehicleId: 'vehicle-001',
          vehicleName: 'VinFast VF8 - 29A-12345',
          serviceType: 'Kiểm tra',
          serviceName: 'Kiểm tra an toàn định kỳ',
          serviceCenter: 'VinFast Thảo Điền',
          laborCost: 200000,
          partsCost: 0,
          additionalCosts: 50000,
          discount: 0,
          tax: 25000,
          totalCost: 275000,
          paymentMethod: 'Tiền mặt',
          paymentStatus: 'paid',
          category: 'inspection',
          parts: [],
          notes: 'Kiểm tra định kỳ, mọi thứ bình thường'
        },
        {
          id: 'cost-004',
          date: new Date('2024-03-25'),
          vehicleId: 'vehicle-003',
          vehicleName: 'VinFast VF5 - 51C-11111',
          serviceType: 'Cứu hộ khẩn cấp',
          serviceName: 'Sửa hệ thống sạc',
          serviceCenter: 'VinFast Bình Dương',
          laborCost: 1200000,
          partsCost: 3500000,
          additionalCosts: 200000,
          discount: 0,
          tax: 490000,
          totalCost: 5390000,
          paymentMethod: 'Ví điện tử',
          paymentStatus: 'pending',
          category: 'emergency',
          warrantyExpiry: new Date('2024-09-25'),
          parts: [
            { name: 'Bộ sạc onboard', quantity: 1, unitCost: 2500000, totalCost: 2500000 },
            { name: 'Cáp sạc DC', quantity: 1, unitCost: 1000000, totalCost: 1000000 }
          ],
          notes: 'Sự cố hệ thống sạc, cần theo dõi'
        }
      ];

      setCostRecords(mockRecords);
      setFilteredRecords(mockRecords);
      
      // Calculate summary
      const totalCosts = mockRecords.reduce((sum, record) => sum + record.totalCost, 0);
      const avgCostPerService = totalCosts / mockRecords.length;
      
      const monthlyCosts: Record<string, number> = {};
      const categoryBreakdown: Record<string, number> = {};
      const vehicleBreakdown: Record<string, number> = {};
      
      mockRecords.forEach(record => {
        const monthKey = `${record.date.getFullYear()}-${(record.date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyCosts[monthKey] = (monthlyCosts[monthKey] || 0) + record.totalCost;
        
        categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + record.totalCost;
        vehicleBreakdown[record.vehicleName] = (vehicleBreakdown[record.vehicleName] || 0) + record.totalCost;
      });
      
      setSummary({
        totalCosts,
        avgCostPerService,
        monthlyCosts,
        yearlyComparison: { '2024': totalCosts },
        categoryBreakdown,
        vehicleBreakdown
      });
      
      setLoading(false);
    };

    loadCostData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...costRecords];

    if (dateRange.start) {
      filtered = filtered.filter(record => record.date >= new Date(dateRange.start));
    }
    
    if (dateRange.end) {
      filtered = filtered.filter(record => record.date <= new Date(dateRange.end));
    }
    
    if (selectedVehicle) {
      filtered = filtered.filter(record => record.vehicleId === selectedVehicle);
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(record => record.paymentStatus === selectedStatus);
    }

    setFilteredRecords(filtered);
  }, [costRecords, dateRange, selectedVehicle, selectedCategory, selectedStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN').format(date);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      maintenance: 'Bảo dưỡng',
      repair: 'Sửa chữa',
      inspection: 'Kiểm tra',
      emergency: 'Khẩn cấp'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      paid: 'Đã thanh toán',
      pending: 'Chờ thanh toán',
      overdue: 'Quá hạn'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const exportToCSV = () => {
    const headers = [
      'Ngày',
      'Xe',
      'Dịch vụ',
      'Trung tâm',
      'Chi phí nhân công',
      'Chi phí phụ tùng',
      'Chi phí khác',
      'Giảm giá',
      'Thuế',
      'Tổng cộng',
      'Trạng thái'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredRecords.map(record => [
        formatDate(record.date),
        record.vehicleName,
        record.serviceName,
        record.serviceCenter,
        record.laborCost,
        record.partsCost,
        record.additionalCosts,
        record.discount,
        record.tax,
        record.totalCost,
        getStatusLabel(record.paymentStatus)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chi-phi-bao-duong-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openRecordDetail = (record: CostRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <div className={`cost-management loading ${className || ''}`}>
        <div className="loading-spinner">Đang tải dữ liệu chi phí bảo dưỡng...</div>
      </div>
    );
  }

  return (
    <div className={`cost-management ${className || ''}`}>
      {/* Header */}
      <div className="cost-header">
        <h2>Quản lý chi phí bảo dưỡng</h2>
        <div className="header-actions">
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as 'table' | 'chart')}
            className="view-selector"
          >
            <option value="table">Dạng bảng</option>
            <option value="chart">Dạng biểu đồ</option>
          </select>
          <MDButton variant="outlined" onClick={exportToCSV}>
            Xuất CSV
          </MDButton>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="summary-section">
          <div className="summary-grid">
            <div className="summary-card total">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-title">Tổng chi phí</div>
                <div className="card-value">{formatCurrency(summary.totalCosts)}</div>
              </div>
            </div>
            <div className="summary-card average">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-title">Trung bình/lần</div>
                <div className="card-value">{formatCurrency(summary.avgCostPerService)}</div>
              </div>
            </div>
            <div className="summary-card monthly">
              <div className="card-icon">📅</div>
              <div className="card-content">
                <div className="card-title">Chi phí tháng này</div>
                <div className="card-value">
                  {formatCurrency(summary.monthlyCosts[`${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`] || 0)}
                </div>
              </div>
            </div>
            <div className="summary-card records">
              <div className="card-icon">📝</div>
              <div className="card-content">
                <div className="card-title">Số lần dịch vụ</div>
                <div className="card-value">{filteredRecords.length}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Xe:</label>
            <select 
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="vehicle-001">VinFast VF8 - 29A-12345</option>
              <option value="vehicle-002">VinFast VF9 - 30B-67890</option>
              <option value="vehicle-003">VinFast VF5 - 51C-11111</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Loại dịch vụ:</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="maintenance">Bảo dưỡng</option>
              <option value="repair">Sửa chữa</option>
              <option value="inspection">Kiểm tra</option>
              <option value="emergency">Khẩn cấp</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Trạng thái:</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cost Records */}
      <div className="records-section">
        {viewMode === 'table' ? (
          <div className="records-table">
            {filteredRecords.length === 0 ? (
              <div className="no-records">
                <p>Không có dữ liệu chi phí nào</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Xe</th>
                    <th>Dịch vụ</th>
                    <th>Trung tâm</th>
                    <th>Loại</th>
                    <th>Tổng cộng</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.vehicleName}</td>
                      <td>{record.serviceName}</td>
                      <td>{record.serviceCenter}</td>
                      <td>
                        <span className={`category-badge ${record.category}`}>
                          {getCategoryLabel(record.category)}
                        </span>
                      </td>
                      <td className="cost-cell">{formatCurrency(record.totalCost)}</td>
                      <td>
                        <span className={`status-badge ${record.paymentStatus}`}>
                          {getStatusLabel(record.paymentStatus)}
                        </span>
                      </td>
                      <td>
                        <MDButton 
                          variant="text" 
                          onClick={() => openRecordDetail(record)}
                        >
                          Chi tiết
                        </MDButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="chart-view">
            {/* Chart components would go here */}
            <div className="chart-placeholder">
              <p>Biểu đồ chi phí sẽ được hiển thị ở đây</p>
              <p>Cần tích hợp thư viện biểu đồ như Chart.js hoặc Recharts</p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedRecord && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết Chi phí</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Thông tin Dịch vụ</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Ngày thực hiện:</strong>
                    <span>{formatDate(selectedRecord.date)}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Xe:</strong>
                    <span>{selectedRecord.vehicleName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Dịch vụ:</strong>
                    <span>{selectedRecord.serviceName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Trung tâm:</strong>
                    <span>{selectedRecord.serviceCenter}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Loại dịch vụ:</strong>
                    <span className={`category-badge ${selectedRecord.category}`}>
                      {getCategoryLabel(selectedRecord.category)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Phương thức thanh toán:</strong>
                    <span>{selectedRecord.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Chi phí Chi tiết</h4>
                <div className="cost-breakdown">
                  <div className="cost-item">
                    <span>Chi phí nhân công:</span>
                    <span>{formatCurrency(selectedRecord.laborCost)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Chi phí phụ tùng:</span>
                    <span>{formatCurrency(selectedRecord.partsCost)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Chi phí khác:</span>
                    <span>{formatCurrency(selectedRecord.additionalCosts)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(selectedRecord.discount)}</span>
                  </div>
                  <div className="cost-item">
                    <span>Thuế:</span>
                    <span>{formatCurrency(selectedRecord.tax)}</span>
                  </div>
                  <div className="cost-item total">
                    <span>Tổng cộng:</span>
                    <span>{formatCurrency(selectedRecord.totalCost)}</span>
                  </div>
                </div>
              </div>

              {selectedRecord.parts.length > 0 && (
                <div className="detail-section">
                  <h4>Phụ tùng Sử dụng</h4>
                  <div className="parts-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Tên phụ tùng</th>
                          <th>Số lượng</th>
                          <th>Đơn giá</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRecord.parts.map((part, index) => (
                          <tr key={index}>
                            <td>{part.name}</td>
                            <td>{part.quantity}</td>
                            <td>{formatCurrency(part.unitCost)}</td>
                            <td>{formatCurrency(part.totalCost)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {selectedRecord.warrantyExpiry && (
                <div className="detail-section">
                  <h4>Bảo hành</h4>
                  <p>Hết hạn: {formatDate(selectedRecord.warrantyExpiry)}</p>
                </div>
              )}

              {selectedRecord.notes && (
                <div className="detail-section">
                  <h4>Ghi chú</h4>
                  <p>{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostManagement;