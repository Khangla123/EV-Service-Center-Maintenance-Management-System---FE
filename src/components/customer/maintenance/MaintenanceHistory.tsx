import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceRecord, Vehicle } from '../../../types';
import { MDButton } from '../../ui';
import './MaintenanceHistory.css';

interface MaintenanceHistoryProps {
  vehicleId?: string;
  limit?: number;
  showFilters?: boolean;
}

const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({
  vehicleId,
  limit,
  showFilters = true
}) => {
  const location = useLocation();
  const { state } = useAuth();
  const { user } = state;

  // Get pre-selected vehicle ID from navigation state
  const preSelectedVehicleId = location.state?.selectedVehicleId;
  
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>(vehicleId || preSelectedVehicleId || 'all');
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, selectedVehicle]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      await Promise.all([
        loadMaintenanceRecords(),
        loadVehicles()
      ]);
    } catch (error) {
      console.error('Error loading maintenance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMaintenanceRecords = () => {
    // Mock maintenance records
    const mockRecords: ServiceRecord[] = [
      {
        id: 'record1',
        appointmentId: 'app1',
        vehicleId: 'vehicle1',
        technicianId: 'tech1',
        serviceType: {
          id: 'service1',
          name: 'Bảo dưỡng định kỳ 15000km',
          description: 'Bảo dưỡng toàn diện theo chu kỳ',
          basePrice: 1500000,
          estimatedDuration: 180,
          category: 'regular_maintenance' as any,
          isActive: true
        },
        startTime: new Date('2024-09-15T08:00:00'),
        endTime: new Date('2024-09-15T11:30:00'),
        mileageAtService: 15000,
        workPerformed: 'Thay dầu máy, kiểm tra phanh, thay lọc gió, kiểm tra hệ thống điện, cập nhật phần mềm',
        partsUsed: [
          {
            partId: 'part1',
            part: {
              id: 'part1',
              partNumber: 'VF-OIL-001',
              name: 'Dầu máy tổng hợp',
              description: 'Dầu máy chuyên dụng cho xe điện VinFast',
              manufacturer: 'VinFast',
              category: 'other' as any,
              compatibleModels: ['VF8', 'VF9'],
              unitPrice: 200000,
              currentStock: 50,
              minimumStock: 10,
              location: 'KHO-A-01',
              supplier: 'VinFast Parts',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            quantity: 2,
            unitPrice: 200000,
            totalPrice: 400000
          },
          {
            partId: 'part2',
            part: {
              id: 'part2',
              partNumber: 'VF-FILTER-002',
              name: 'Lọc gió cabin',
              description: 'Lọc gió cabin chống bụi và vi khuẩn',
              manufacturer: 'VinFast',
              category: 'other' as any,
              compatibleModels: ['VF8', 'VF9'],
              unitPrice: 150000,
              currentStock: 30,
              minimumStock: 5,
              location: 'KHO-A-02',
              supplier: 'VinFast Parts',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            quantity: 1,
            unitPrice: 150000,
            totalPrice: 150000
          }
        ],
        laborCost: 500000,
        partsCost: 550000,
        totalCost: 1050000,
        customerNotes: 'Xe chạy bình thường, không có vấn đề gì đặc biệt',
        technicianNotes: 'Xe trong tình trạng tốt. Khuyến nghị kiểm tra lại sau 5000km.',
        qualityCheckPassed: true,
        nextServiceDue: new Date('2025-03-15'),
        warrantyInfo: 'Bảo hành 6 tháng hoặc 5000km',
        images: ['/images/service1_before.jpg', '/images/service1_after.jpg'],
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-15')
      },
      {
        id: 'record2',
        appointmentId: 'app2',
        vehicleId: 'vehicle1',
        technicianId: 'tech2',
        serviceType: {
          id: 'service2',
          name: 'Kiểm tra và bảo dưỡng pin',
          description: 'Kiểm tra tình trạng pin và hệ thống sạc',
          basePrice: 800000,
          estimatedDuration: 120,
          category: 'battery_service' as any,
          isActive: true
        },
        startTime: new Date('2024-08-20T09:00:00'),
        endTime: new Date('2024-08-20T11:00:00'),
        mileageAtService: 12500,
        workPerformed: 'Kiểm tra dung lượng pin, cân bằng cell, kiểm tra hệ thống quản lý pin (BMS)',
        partsUsed: [],
        laborCost: 800000,
        partsCost: 0,
        totalCost: 800000,
        customerNotes: 'Pin có dấu hiệu sụt giảm dung lượng',
        technicianNotes: 'Pin trong tình trạng bình thường. Dung lượng còn 95% so với ban đầu.',
        qualityCheckPassed: true,
        nextServiceDue: new Date('2025-02-20'),
        warrantyInfo: 'Bảo hành 3 tháng',
        createdAt: new Date('2024-08-20'),
        updatedAt: new Date('2024-08-20')
      },
      {
        id: 'record3',
        appointmentId: 'app3',
        vehicleId: 'vehicle2',
        technicianId: 'tech1',
        serviceType: {
          id: 'service3',
          name: 'Sửa chữa hệ thống phanh',
          description: 'Thay má phanh và kiểm tra hệ thống phanh',
          basePrice: 1200000,
          estimatedDuration: 150,
          category: 'repair' as any,
          isActive: true
        },
        startTime: new Date('2024-07-10T13:00:00'),
        endTime: new Date('2024-07-10T15:30:00'),
        mileageAtService: 8000,
        workPerformed: 'Thay má phanh trước và sau, thay dầu phanh, kiểm tra đĩa phanh',
        partsUsed: [
          {
            partId: 'part3',
            part: {
              id: 'part3',
              partNumber: 'VF-BRAKE-003',
              name: 'Má phanh trước',
              description: 'Má phanh ceramic cao cấp',
              manufacturer: 'Brembo',
              category: 'brake' as any,
              compatibleModels: ['VF9'],
              unitPrice: 300000,
              currentStock: 20,
              minimumStock: 5,
              location: 'KHO-B-01',
              supplier: 'Brembo Vietnam',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            },
            quantity: 4,
            unitPrice: 300000,
            totalPrice: 1200000
          }
        ],
        laborCost: 400000,
        partsCost: 1200000,
        totalCost: 1600000,
        customerNotes: 'Phanh kêu và rung khi dừng xe',
        technicianNotes: 'Má phanh đã mòn hết. Đĩa phanh còn tốt. Đã thay má phanh mới.',
        qualityCheckPassed: true,
        nextServiceDue: new Date('2025-01-10'),
        warrantyInfo: 'Bảo hành 12 tháng hoặc 10000km',
        createdAt: new Date('2024-07-10'),
        updatedAt: new Date('2024-07-10')
      }
    ];

    // Filter by vehicle if specified
    let filteredRecords = selectedVehicle === 'all' 
      ? mockRecords 
      : mockRecords.filter(r => r.vehicleId === selectedVehicle);

    // Filter by date range
    if (dateRange.from) {
      filteredRecords = filteredRecords.filter(r => 
        new Date(r.startTime) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      filteredRecords = filteredRecords.filter(r => 
        new Date(r.startTime) <= new Date(dateRange.to)
      );
    }

    // Sort by date (newest first)
    filteredRecords.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    // Apply limit if specified
    if (limit) {
      filteredRecords = filteredRecords.slice(0, limit);
    }

    setRecords(filteredRecords);
  };

  const loadVehicles = () => {
    // Mock vehicles
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle1',
        customerId: user?.id || '',
        make: 'VinFast',
        model: 'VF8',
        year: 2023,
        vin: 'VF8ABC123456789',
        licensePlate: '30A-123.45',
        color: 'Đen',
        batteryCapacity: 87.7,
        mileage: 15200,
        purchaseDate: new Date('2023-05-15'),
        warrantyExpiration: new Date('2026-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vehicle2',
        customerId: user?.id || '',
        make: 'VinFast',
        model: 'VF9',
        year: 2023,
        vin: 'VF9XYZ987654321',
        licensePlate: '30B-678.90',
        color: 'Trắng',
        batteryCapacity: 123,
        mileage: 8200,
        purchaseDate: new Date('2023-08-10'),
        warrantyExpiration: new Date('2026-08-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    setVehicles(mockVehicles);
  };

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  };

  const calculateTotalCost = () => {
    return records.reduce((total, record) => total + record.totalCost, 0);
  };

  const exportToCSV = () => {
    const csvData = records.map(record => {
      const vehicle = getVehicleInfo(record.vehicleId);
      return {
        'Ngày': formatDate(record.startTime),
        'Xe': `${vehicle?.make} ${vehicle?.model} - ${vehicle?.licensePlate}`,
        'Dịch vụ': record.serviceType.name,
        'Số km': record.mileageAtService,
        'Chi phí': record.totalCost,
        'Ghi chú': record.customerNotes || ''
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `lich_su_bao_duong_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="maintenance-history loading">
        <div className="loading-spinner">Đang tải lịch sử bảo dưỡng...</div>
      </div>
    );
  }

  return (
    <div className="maintenance-history">
      <div className="history-header">
        <h2>Lịch sử bảo dưỡng</h2>
        <div className="header-actions">
          {records.length > 0 && (
            <MDButton variant="outlined" onClick={exportToCSV}>
              Xuất CSV
            </MDButton>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="filters-section">
          <div className="filter-group">
            <label>Xe:</label>
            <select 
              value={selectedVehicle} 
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="all">Tất cả xe</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Từ ngày:</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div className="filter-group">
            <label>Đến ngày:</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-item">
              <span className="label">Tổng số lần bảo dưỡng:</span>
              <span className="value">{records.length}</span>
            </div>
            <div className="summary-item">
              <span className="label">Tổng chi phí:</span>
              <span className="value">{formatCurrency(calculateTotalCost())}</span>
            </div>
            <div className="summary-item">
              <span className="label">Chi phí trung bình:</span>
              <span className="value">{formatCurrency(calculateTotalCost() / records.length)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="records-section">
        {records.length === 0 ? (
          <div className="no-records">
            <p>Chưa có lịch sử bảo dưỡng nào.</p>
          </div>
        ) : (
          <div className="records-grid">
            {records.map(record => (
              <RecordCard
                key={record.id}
                record={record}
                vehicle={getVehicleInfo(record.vehicleId)}
                onClick={() => setSelectedRecord(record)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <RecordDetailModal
          record={selectedRecord}
          vehicle={getVehicleInfo(selectedRecord.vehicleId)}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );

  // Record Card Component
  function RecordCard({
    record,
    vehicle,
    onClick
  }: {
    record: ServiceRecord;
    vehicle?: Vehicle;
    onClick: () => void;
  }) {
    return (
      <div className="record-card" onClick={onClick}>
        <div className="card-header">
          <div className="service-name">{record.serviceType.name}</div>
          <div className="record-date">{formatDate(record.startTime)}</div>
        </div>
        
        <div className="card-content">
          <div className="vehicle-info">
            <strong>{vehicle?.make} {vehicle?.model}</strong>
            <span>{vehicle?.licensePlate}</span>
          </div>
          <div className="mileage-info">
            Số km: {record.mileageAtService.toLocaleString()}
          </div>
          <div className="cost-info">
            <span className="cost">{formatCurrency(record.totalCost)}</span>
          </div>
        </div>

        <div className="card-footer">
          <span className={`quality-check ${record.qualityCheckPassed ? 'passed' : 'failed'}`}>
            {record.qualityCheckPassed ? '✓ Đạt kiểm tra' : '✗ Không đạt'}
          </span>
          {record.nextServiceDue && (
            <span className="next-service">
              Bảo dưỡng tiếp theo: {formatDate(record.nextServiceDue)}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Record Detail Modal Component
  function RecordDetailModal({
    record,
    vehicle,
    onClose
  }: {
    record: ServiceRecord;
    vehicle?: Vehicle;
    onClose: () => void;
  }) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Chi tiết bảo dưỡng</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            <div className="detail-section">
              <h4>Thông tin chung</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <strong>Xe:</strong> {vehicle?.make} {vehicle?.model} - {vehicle?.licensePlate}
                </div>
                <div className="detail-item">
                  <strong>Dịch vụ:</strong> {record.serviceType.name}
                </div>
                <div className="detail-item">
                  <strong>Thời gian bắt đầu:</strong> {formatDateTime(record.startTime)}
                </div>
                <div className="detail-item">
                  <strong>Thời gian kết thúc:</strong> {record.endTime ? formatDateTime(record.endTime) : 'Chưa hoàn thành'}
                </div>
                <div className="detail-item">
                  <strong>Số km khi bảo dưỡng:</strong> {record.mileageAtService.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Công việc thực hiện</h4>
              <p>{record.workPerformed}</p>
            </div>

            {record.partsUsed.length > 0 && (
              <div className="detail-section">
                <h4>Phụ tùng sử dụng</h4>
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
                      {record.partsUsed.map((partUsage, index) => (
                        <tr key={index}>
                          <td>{partUsage.part.name}</td>
                          <td>{partUsage.quantity}</td>
                          <td>{formatCurrency(partUsage.unitPrice)}</td>
                          <td>{formatCurrency(partUsage.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Chi phí</h4>
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Chi phí công:</span>
                  <span>{formatCurrency(record.laborCost)}</span>
                </div>
                <div className="cost-item">
                  <span>Chi phí phụ tùng:</span>
                  <span>{formatCurrency(record.partsCost)}</span>
                </div>
                <div className="cost-item total">
                  <span>Tổng chi phí:</span>
                  <span>{formatCurrency(record.totalCost)}</span>
                </div>
              </div>
            </div>

            {record.customerNotes && (
              <div className="detail-section">
                <h4>Ghi chú của khách hàng</h4>
                <p>{record.customerNotes}</p>
              </div>
            )}

            {record.technicianNotes && (
              <div className="detail-section">
                <h4>Ghi chú của kỹ thuật viên</h4>
                <p>{record.technicianNotes}</p>
              </div>
            )}

            <div className="detail-section">
              <h4>Thông tin bảo hành</h4>
              <div className="warranty-info">
                <p><strong>Bảo hành:</strong> {record.warrantyInfo}</p>
                {record.nextServiceDue && (
                  <p><strong>Bảo dưỡng tiếp theo:</strong> {formatDate(record.nextServiceDue)}</p>
                )}
                <p><strong>Kiểm tra chất lượng:</strong> 
                  <span className={`quality-status ${record.qualityCheckPassed ? 'passed' : 'failed'}`}>
                    {record.qualityCheckPassed ? ' ✓ Đạt' : ' ✗ Không đạt'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default MaintenanceHistory;