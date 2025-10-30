import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Vehicle } from '../../../types';
import vehicleService from '../../../services/vehicleService';
import AddVehicleModal from './AddVehicleModal';
import { Car, Calendar, Battery, Gauge, Plus, Edit, Trash2 } from 'lucide-react';
import './VehicleManagement.css';

const VehicleManagement: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const vehiclesList = await vehicleService.getMyVehicles();
      console.log('🚗 Vehicles loaded:', vehiclesList); // Debug log
      console.log('🖼️ First vehicle imageUrl:', vehiclesList[0]?.imageUrl); // Debug imageUrl
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Chưa cập nhật';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return 'Không hợp lệ';
      
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(dateObj);
    } catch {
      return 'Không hợp lệ';
    }
  };

  const getBatteryStatusColor = (capacity: number) => {
    if (capacity >= 100) return '#10b981'; // green
    if (capacity >= 80) return '#3b82f6'; // blue
    if (capacity >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getWarrantyStatus = (warrantyExpiration: Date | null) => {
    if (!warrantyExpiration) {
      return { status: 'Không xác định', color: '#6b7280' };
    }
    
    const today = new Date();
    const expirationDate = new Date(warrantyExpiration);
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff > 365) return { status: 'Còn hạn', color: '#10b981' };
    if (daysDiff > 90) return { status: 'Sắp hết hạn', color: '#f59e0b' };
    if (daysDiff > 0) return { status: 'Gần hết hạn', color: '#ef4444' };
    return { status: 'Hết hạn', color: '#6b7280' };
  };

  const getVehicleImage = (vehicle: Vehicle) => {
    console.log(`🔍 Getting image for ${vehicle.make} ${vehicle.model}:`, vehicle.imageUrl); // Debug
    
    // Ưu tiên lấy ảnh từ database (imageUrl)
    if (vehicle.imageUrl) {
      console.log('✅ Using imageUrl from database:', vehicle.imageUrl);
      return vehicle.imageUrl;
    }
    
    // Fallback: Map vehicle model to image path (legacy code)
    if (vehicle.make === 'VinFast') {
      if (vehicle.model === 'VF8' || vehicle.model === 'VF 8') {
        console.log('⚠️ Fallback to legacy VF8 path');
        return '/assets/images/vehicles/vinfast-vf8.png'; // Updated path
      }
      if (vehicle.model === 'VF9' || vehicle.model === 'VF 9') {
        console.log('⚠️ Fallback to legacy VF9 path');
        return '/assets/images/vehicles/vinfast-vf9.png'; // Updated path
      }
    }
    
    // Default placeholder nếu không có ảnh
    console.log('⚠️ No image found, using default');
    return null; // Return null để hiển thị placeholder icon
  };

  const handleBookService = (vehicleId: string) => {
    // Navigate to appointment booking with pre-selected vehicle
    navigate('/customer/booking', { state: { selectedVehicleId: vehicleId } });
  };

  const handleViewHistory = (vehicleId: string) => {
    // Navigate to maintenance history with vehicle filter
    navigate('/customer/history', { state: { selectedVehicleId: vehicleId } });
  };

  const handleAddVehicle = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
  };

  const handleVehicleAdded = () => {
    // Reload vehicles list
    loadVehicles();
    // Show success message (optional)
    alert('✅ Thêm xe thành công!');
  };

  if (loading) {
    return (
      <div className="vehicle-management">
        <div className="loading-state">
          <Car className="loading-icon" />
          <p>Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-management">
      <div className="vehicle-header">
        <div className="vehicle-title">
          <h1>Quản lý xe</h1>
        </div>
        <button className="add-vehicle-btn" onClick={handleAddVehicle}>
          <Plus size={20} />
          THÊM XE MỚI
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <Car className="empty-icon" />
          <h2>Chưa có xe nào</h2>
          <p>Thêm xe đầu tiên để bắt đầu quản lý dịch vụ bảo trì</p>
          <button className="add-first-vehicle-btn" onClick={handleAddVehicle}>
            <Plus size={20} />
            Thêm xe đầu tiên
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle) => {
            const warrantyStatus = getWarrantyStatus(vehicle.warrantyExpiration);
            const vehicleImageSrc = getVehicleImage(vehicle); // Truyền toàn bộ vehicle object
            
            return (
              <div key={vehicle.id} className="vehicle-card">
                <div className="vehicle-card-header">
                  <div className="vehicle-info">
                    <h3>{vehicle.make} {vehicle.model}</h3>
                    <span className="vehicle-year">{vehicle.year}</span>
                  </div>
                  <div className="vehicle-actions">
                    <button className="action-btn edit-btn" title="Chỉnh sửa">
                      <Edit size={18} />
                    </button>
                    <button className="action-btn delete-btn" title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="vehicle-image">
                  {vehicleImageSrc ? (
                    <div className="car-image-container">
                      <img 
                        src={vehicleImageSrc} 
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="vehicle-img"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="car-placeholder fallback-placeholder" style={{ display: 'none' }}>
                        <Car size={48} />
                        <span className="vehicle-color">{vehicle.color}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="car-placeholder">
                      <Car size={48} />
                      <span className="vehicle-color">{vehicle.color}</span>
                    </div>
                  )}
                </div>

                <div className="vehicle-details">
                  <div className="detail-row">
                    <span className="detail-label">Biển số:</span>
                    <span className="detail-value">{vehicle.licensePlate}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">VIN:</span>
                    <span className="detail-value vin-code">{vehicle.vin}</span>
                  </div>

                  <div className="detail-row">
                    <Gauge size={16} />
                    <span className="detail-label">Số km:</span>
                    <span className="detail-value">{vehicle.mileage.toLocaleString()} km</span>
                  </div>

                  <div className="detail-row">
                    <Battery size={16} style={{ color: getBatteryStatusColor(vehicle.batteryCapacity) }} />
                    <span className="detail-label">Pin:</span>
                    <span className="detail-value">{vehicle.batteryCapacity} kWh</span>
                  </div>

                  <div className="detail-row">
                    <Calendar size={16} />
                    <span className="detail-label">Mua:</span>
                    <span className="detail-value">{formatDate(vehicle.purchaseDate)}</span>
                  </div>

                  <div className="detail-row warranty-row">
                    <span className="detail-label">Bảo hành:</span>
                    <span className="warranty-status" style={{ color: warrantyStatus.color }}>
                      {warrantyStatus.status}
                    </span>
                  </div>
                  
                  <div className="warranty-date">
                    Hết hạn: {formatDate(vehicle.warrantyExpiration)}
                  </div>
                </div>

                <div className="vehicle-card-footer">
                  <button 
                    className="service-history-btn"
                    onClick={() => handleViewHistory(vehicle.id)}
                  >
                    Lịch sử bảo dưỡng
                  </button>
                  <button 
                    className="book-service-btn"
                    onClick={() => handleBookService(vehicle.id)}
                  >
                    Đặt lịch dịch vụ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="vehicle-stats">
        <div className="stat-card">
          <div className="stat-number">{vehicles.length}</div>
          <div className="stat-label">Tổng số xe</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">
            {vehicles.filter(v => getWarrantyStatus(v.warrantyExpiration).status === 'Còn hạn').length}
          </div>
          <div className="stat-label">Xe còn bảo hành</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-number">
            {Math.round(vehicles.reduce((sum, v) => sum + v.mileage, 0) / vehicles.length || 0).toLocaleString()}
          </div>
          <div className="stat-label">Km trung bình</div>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      <AddVehicleModal 
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSuccess={handleVehicleAdded}
      />
    </div>
  );
};

export default VehicleManagement;