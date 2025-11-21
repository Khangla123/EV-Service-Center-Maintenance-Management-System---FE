import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { ServiceRecord, Vehicle } from '../../../types';
import { MDButton } from '../../ui';
import maintenanceHistoryService from '../../../services/maintenanceHistoryService';
import vehicleService from '../../../services/vehicleService';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import servicePackageService, { ServicePackage } from '../../../services/servicePackageService';
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
  const [servicePackages, setServicePackages] = useState<ServicePackage[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<Appointment | null>(null);

  useEffect(() => {
    console.log('=== MaintenanceHistory useEffect ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('User Role:', user?.role);
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

  const loadMaintenanceRecords = async () => {
    try {
      console.log('=== LOADING MAINTENANCE RECORDS ===');
      console.log('Current user:', user);
      console.log('Selected vehicle:', selectedVehicle);
      
      const params: any = {};
      if (selectedVehicle && selectedVehicle !== 'all') {
        params.vehicleId = selectedVehicle;
      }
      if (dateRange.from) {
        params.fromDate = dateRange.from;
      }
      if (dateRange.to) {
        params.toDate = dateRange.to;
      }
      if (limit) {
        params.size = limit;
      }

      console.log('API request params:', params);
      console.log('Token from localStorage:', localStorage.getItem('accessToken')?.substring(0, 20) + '...');
      
      const response = await maintenanceHistoryService.getMaintenanceHistory(params);
      console.log('Maintenance records response:', response);
      console.log('Number of records:', response.maintenanceRecords?.length || 0);
      
      // Backend returns MaintenanceRecord[], need to map to ServiceRecord[]
      const fetchedRecords = response.maintenanceRecords || [];
      
      // Map MaintenanceRecord to ServiceRecord format
      const mappedRecords = fetchedRecords.map((record: any) => {
        // Combine main service and selected packages
        let serviceName = record.serviceTitle || 'Bảo dưỡng';
        if (record.selectedPackageNames) {
          serviceName = `${serviceName}, ${record.selectedPackageNames}`;
        }
        
        return {
          id: record.appointmentId,
          appointmentId: record.appointmentId,
          vehicleId: selectedVehicle || '',
          technicianId: '',
          serviceType: {
            id: '',
            name: serviceName,
            description: serviceName,
            basePrice: Number(record.totalAmount) || 0,
            estimatedDuration: 60,
            category: 'REGULAR_MAINTENANCE' as any,
            isActive: true
          },
          startTime: new Date(record.serviceDate),
          endTime: record.serviceDate ? new Date(record.serviceDate) : undefined,
          mileageAtService: record.mileage || 0,
          workPerformed: serviceName,
          partsUsed: [],
          laborCost: 0,
          partsCost: 0,
          totalCost: Number(record.totalAmount) || 0,
          customerNotes: '',
          technicianNotes: '',
          qualityCheckPassed: record.inspectionPassed || false,
          nextServiceDue: record.nextMaintenanceDate ? new Date(record.nextMaintenanceDate) : undefined,
          warrantyInfo: 'Bảo hành theo chính sách',
          images: [],
          createdAt: new Date(record.serviceDate),
          updatedAt: new Date(record.serviceDate)
        };
      });
      
      console.log('Mapped records:', mappedRecords);
      setRecords(mappedRecords);
    } catch (error: any) {
      console.error('Error loading maintenance records:', error);
      
      // Show user-friendly error message
      if (error?.message) {
        console.warn(error.message);
      }
      
      setRecords([]);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await vehicleService.getMyVehicles();
      setVehicles(response || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    }
  };

  const loadServicePackages = async () => {
    try {
      const packages = await servicePackageService.getAllServicePackages();
      setServicePackages(packages || []);
    } catch (error) {
      console.error('Error loading service packages:', error);
      setServicePackages([]);
    }
  };

  const loadAppointmentDetails = async (appointmentId: string) => {
    try {
      setLoadingDetails(true);
      const details = await appointmentService.getAppointmentById(appointmentId);
      setAppointmentDetails(details);
      
      // Load service packages if not already loaded
      if (servicePackages.length === 0) {
        await loadServicePackages();
      }
    } catch (error) {
      console.error('Error loading appointment details:', error);
      setAppointmentDetails(null);
    } finally {
      setLoadingDetails(false);
    }
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
                onClick={() => {
                  setSelectedRecord(record);
                  loadAppointmentDetails(record.appointmentId);
                }}
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
          <span className={`quality-check ${
            record.qualityCheckPassed === null ? 'pending' : 
            record.qualityCheckPassed ? 'passed' : 'pending'
          }`}>
            {record.qualityCheckPassed === null ? '🔄 Đang kiểm tra' :
             record.qualityCheckPassed ? '✓ Đạt kiểm tra' : '🔄 Đang kiểm tra'}
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
    // Parse selected packages and calculate costs
    const selectedPackageNames = appointmentDetails?.selectedPackageNames 
      ? appointmentDetails.selectedPackageNames.split(',').map(name => name.trim()).filter(name => name)
      : [];
    
    // Find main service package
    const mainPackage = servicePackages.find(pkg => pkg.name === appointmentDetails?.servicePackageName);
    const mainPackagePrice = mainPackage?.price || 0;
    
    // Find prices for selected packages
    const selectedPackagesWithPrices = selectedPackageNames.map(name => {
      const pkg = servicePackages.find(p => p.name === name);
      return {
        name: name,
        price: pkg?.price || 0
      };
    });
    
    // Calculate total
    const selectedPackagesTotal = selectedPackagesWithPrices.reduce((sum, pkg) => sum + pkg.price, 0);
    const calculatedTotal = mainPackagePrice + selectedPackagesTotal;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Chi tiết bảo dưỡng</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            {loadingDetails && (
              <div className="loading-details">
                <p>Đang tải chi tiết...</p>
              </div>
            )}
            
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
              <div className="work-details">
                <div className="service-item">
                  <strong>Dịch vụ chính:</strong> 
                  <span>{appointmentDetails?.servicePackageName || record.serviceType.name}</span>
                </div>
                {selectedPackageNames.length > 0 && (
                  <div className="selected-packages">
                    <strong>Các gói dịch vụ đã chọn:</strong>
                    <ul className="packages-list">
                      {selectedPackageNames.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                {!loadingDetails && appointmentDetails && (
                  <>
                    {/* Hiển thị tất cả các gói dịch vụ trong một dòng */}
                    <div className="cost-item">
                      <span>
                        Gói dịch vụ: {appointmentDetails.servicePackageName}
                        {selectedPackageNames.length > 0 && ` + ${selectedPackageNames.join(', ')}`}
                      </span>
                      <span>{formatCurrency(calculatedTotal)}</span>
                    </div>
                    <div className="cost-item total">
                      <span>Tổng chi phí:</span>
                      <span>{formatCurrency(calculatedTotal)}</span>
                    </div>
                  </>
                )}
                {(loadingDetails || !appointmentDetails) && (
                  <div className="cost-item total">
                    <span>Tổng chi phí:</span>
                    <span>{formatCurrency(record.totalCost)}</span>
                  </div>
                )}
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
                  <span className={`quality-status ${
                    record.qualityCheckPassed === null ? 'pending' :
                    record.qualityCheckPassed ? 'passed' : 'pending'
                  }`}>
                    {record.qualityCheckPassed === null ? ' 🔄 Đang kiểm tra' :
                     record.qualityCheckPassed ? ' ✓ Đạt' : ' 🔄 Đang kiểm tra'}
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