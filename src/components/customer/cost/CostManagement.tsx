import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MDButton } from '../../ui';
import './CostManagement.css';
import maintenanceHistoryService, { MaintenanceRecord } from '../../../services/maintenanceHistoryService';
import invoiceService, { InvoiceResponse } from '../../../services/invoiceService';

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
  serviceStatus?: string; // Add this to track service completion status
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
  const navigate = useNavigate();
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

  // Load data from API
  useEffect(() => {
    const loadCostData = async () => {
      setLoading(true);
      
      try {
        const data = await maintenanceHistoryService.getMaintenanceHistory();
        console.log('📋 Maintenance records:', data.maintenanceRecords);
        
        // Lấy invoices để xác định payment status
        const invoices = await invoiceService.getMyInvoices();
        console.log('💰 My invoices:', invoices);
        console.log('💰 First invoice full object:', JSON.stringify(invoices[0], null, 2));
        
        // Tạo map từ ID invoice -> invoice status
        // Invoice có thể link với appointment qua nhiều cách khác nhau
        const invoiceStatusMap = new Map<string, 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE'>();
        
        invoices.forEach((invoice: any) => {
          console.log(`🔍 Invoice:`, invoice);
          // Map bằng appointmentId (KEY CHÍNH!)
          if (invoice.appointmentId) {
            invoiceStatusMap.set(invoice.appointmentId, invoice.status);
            console.log(`✅ Mapped appointmentId ${invoice.appointmentId} -> ${invoice.status}`);
          }
          // Backup: Map bằng serviceOrderId
          if (invoice.serviceOrderId) {
            invoiceStatusMap.set(invoice.serviceOrderId, invoice.status);
          }
          // Backup: Map bằng invoice ID
          if (invoice.id) {
            invoiceStatusMap.set(invoice.id, invoice.status);
          }
        });
        
        console.log('🗺️ Invoice status map:', Array.from(invoiceStatusMap.entries()));
        
        // Tạo map từ appointmentId -> invoice để lấy finalAmount
        const invoiceAmountMap = new Map<string, number>();
        invoices.forEach((invoice: any) => {
          if (invoice.appointmentId) {
            invoiceAmountMap.set(invoice.appointmentId, invoice.finalAmount || invoice.totalAmount);
          }
        });
        
        // Transform API data to CostRecord format
        const records: CostRecord[] = data.maintenanceRecords.map((record: MaintenanceRecord) => {
          // Lấy invoice status từ map
          const invoiceStatus = invoiceStatusMap.get(record.appointmentId);
          console.log(`📝 Record ${record.appointmentId}: invoiceStatus=${invoiceStatus}`);
          
          // Map invoice status sang payment status
          let paymentStatus: 'paid' | 'pending' | 'overdue' = 'pending';
          if (invoiceStatus === 'PAID') {
            paymentStatus = 'paid';
          } else if (invoiceStatus === 'OVERDUE') {
            paymentStatus = 'overdue';
          } else if (invoiceStatus === 'PENDING') {
            paymentStatus = 'pending';
          }
          
          console.log(`✅ Final paymentStatus for ${record.appointmentId}: ${paymentStatus}`);
          
          // Lấy finalAmount từ invoice (bao gồm thuế), fallback về totalAmount từ record
          const finalAmount = invoiceAmountMap.get(record.appointmentId) || record.totalAmount;
          console.log(`💰 Final amount for ${record.appointmentId}: ${finalAmount}`);
          
          return {
            id: record.appointmentId,
            date: new Date(record.serviceDate),
            vehicleId: record.appointmentId, // Using appointmentId as fallback
            vehicleName: `${record.vehicleModel} - ${record.licensePlate}`,
            serviceType: record.serviceTitle,
            serviceName: record.serviceTitle,
            serviceCenter: 'VinFast Service Center',
            laborCost: 0,
            partsCost: 0,
            additionalCosts: 0,
            discount: 0,
            tax: 0,
            totalCost: finalAmount,
            paymentMethod: 'N/A',
            paymentStatus: paymentStatus,
            serviceStatus: record.status, // Preserve the service completion status
            category: 'maintenance' as const,
            parts: [],
            notes: record.nextMaintenanceDate ? `Next maintenance: ${record.nextMaintenanceDate}` : undefined
          };
        });
        
        setCostRecords(records);
        setFilteredRecords(records);
        
        // Calculate summary from records (đã bao gồm finalAmount với thuế)
        const totalCosts = records.reduce((sum, record) => sum + record.totalCost, 0);
        const avgCostPerService = records.length > 0 ? totalCosts / records.length : 0;
        
        console.log('💵 Recalculated total costs from records:', totalCosts);
        console.log('💵 Recalculated average cost:', avgCostPerService);
        
        const monthlyCosts: Record<string, number> = {};
        const categoryBreakdown: Record<string, number> = {};
        const vehicleBreakdown: Record<string, number> = {};
        
        records.forEach(record => {
          const monthKey = `${record.date.getFullYear()}-${(record.date.getMonth() + 1).toString().padStart(2, '0')}`;
          monthlyCosts[monthKey] = (monthlyCosts[monthKey] || 0) + record.totalCost;
          console.log(`📆 Record date: ${record.date}, monthKey: ${monthKey}, totalCost: ${record.totalCost}`);
          
          categoryBreakdown[record.category] = (categoryBreakdown[record.category] || 0) + record.totalCost;
          vehicleBreakdown[record.vehicleName] = (vehicleBreakdown[record.vehicleName] || 0) + record.totalCost;
        });
        
        console.log('📊 Monthly costs calculated:', monthlyCosts);
        console.log('📊 Total costs:', totalCosts);
        console.log('📊 Average cost per service:', avgCostPerService);
        
        setSummary({
          totalCosts,
          avgCostPerService,
          monthlyCosts,
          yearlyComparison: { '2024': totalCosts },
          categoryBreakdown,
          vehicleBreakdown
        });
        
      } catch (error) {
        console.error('Failed to load cost data:', error);
        setCostRecords([]);
        setFilteredRecords([]);
      } finally {
        setLoading(false);
      }
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

  const handlePayment = (record: CostRecord) => {
    // Navigate to payment page with the record data using React Router
    navigate('/customer/payment', { 
      state: { 
        recordId: record.id, 
        amount: record.totalCost,
        serviceName: record.serviceName,
        vehicleName: record.vehicleName,
        date: record.date
      } 
    });
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
                  {(() => {
                    const currentMonthKey = `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
                    const monthlyCost = summary.monthlyCosts[currentMonthKey] || 0;
                    console.log('💵 Current month key:', currentMonthKey);
                    console.log('💵 Monthly costs map:', summary.monthlyCosts);
                    console.log('💵 Current month cost:', monthlyCost);
                    return formatCurrency(monthlyCost);
                  })()}
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
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <MDButton 
                            variant="text" 
                            onClick={() => openRecordDetail(record)}
                          >
                            Chi tiết
                          </MDButton>
                          {record.paymentStatus === 'pending' && record.serviceStatus === 'COMPLETED' && (
                            <MDButton 
                              variant="filled"
                              onClick={() => handlePayment(record)}
                            >
                              Thanh toán
                            </MDButton>
                          )}
                        </div>
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