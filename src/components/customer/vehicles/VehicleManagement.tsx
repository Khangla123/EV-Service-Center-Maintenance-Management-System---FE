import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Vehicle } from '../../../types';
import vehicleService from '../../../services/vehicleService';
import { Car, Calendar, Battery, Gauge, Plus, Edit, Trash2, X } from 'lucide-react';
import './VehicleManagement.css';

const VehicleManagement: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
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

  const handleSubmitVehicle = async (vehicleData: any) => {
    try {
      await vehicleService.registerMyVehicle(vehicleData);
      setShowAddModal(false);
      // Reload vehicles
      const vehiclesList = await vehicleService.getMyVehicles();
      setVehicles(vehiclesList);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      alert('Có lỗi xảy ra khi thêm xe. Vui lòng thử lại.');
    }
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
      {showAddModal && <AddVehicleModal onClose={handleCloseModal} onSubmit={handleSubmitVehicle} />}
    </div>
  );
};

// Add Vehicle Modal Component
const AddVehicleModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    make: 'VinFast',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    color: '',
    batteryCapacity: 0,
    mileage: 0,
    purchaseDate: '',
    warrantyExpiration: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'batteryCapacity' || name === 'mileage' 
        ? Number(value) 
        : value
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.model.trim()) newErrors.model = 'Vui lòng nhập model xe';
    if (!formData.licensePlate.trim()) newErrors.licensePlate = 'Vui lòng nhập biển số';
    if (!formData.vin.trim()) newErrors.vin = 'Vui lòng nhập VIN';
    if (!formData.color.trim()) newErrors.color = 'Vui lòng nhập màu xe';
    if (formData.batteryCapacity <= 0) newErrors.batteryCapacity = 'Dung lượng pin phải lớn hơn 0';
    if (formData.mileage < 0) newErrors.mileage = 'Số km phải lớn hơn hoặc bằng 0';
    if (!formData.purchaseDate) newErrors.purchaseDate = 'Vui lòng chọn ngày mua';
    if (!formData.warrantyExpiration) newErrors.warrantyExpiration = 'Vui lòng chọn ngày hết hạn bảo hành';

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      ...formData,
      purchaseDate: new Date(formData.purchaseDate),
      warrantyExpiration: new Date(formData.warrantyExpiration),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content add-vehicle-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm xe mới</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="vehicle-form">
          <div className="form-row">
            <div className="form-group">
              <label>Hãng xe *</label>
              <select name="make" value={formData.make} onChange={handleChange}>
                <option value="VinFast">VinFast</option>
                <option value="Tesla">Tesla</option>
                <option value="BYD">BYD</option>
                <option value="Hyundai">Hyundai</option>
                <option value="Kia">Kia</option>
              </select>
            </div>

            <div className="form-group">
              <label>Model *</label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="VD: VF8, VF9"
              />
              {errors.model && <span className="error-text">{errors.model}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Năm sản xuất *</label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                min="2020"
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="form-group">
              <label>Biển số *</label>
              <input
                type="text"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="VD: 30A-12345"
              />
              {errors.licensePlate && <span className="error-text">{errors.licensePlate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>VIN (Số khung) *</label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleChange}
              placeholder="VD: VF8ABC123XYZ456789"
            />
            {errors.vin && <span className="error-text">{errors.vin}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Màu sắc *</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="VD: Xanh dương"
              />
              {errors.color && <span className="error-text">{errors.color}</span>}
            </div>

            <div className="form-group">
              <label>Dung lượng pin (kWh) *</label>
              <input
                type="number"
                name="batteryCapacity"
                value={formData.batteryCapacity}
                onChange={handleChange}
                min="0"
                step="0.1"
              />
              {errors.batteryCapacity && <span className="error-text">{errors.batteryCapacity}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số km đã đi *</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
              />
              {errors.mileage && <span className="error-text">{errors.mileage}</span>}
            </div>

            <div className="form-group">
              <label>Ngày mua xe *</label>
              <input
                type="date"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.purchaseDate && <span className="error-text">{errors.purchaseDate}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Ngày hết hạn bảo hành *</label>
            <input
              type="date"
              name="warrantyExpiration"
              value={formData.warrantyExpiration}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.warrantyExpiration && <span className="error-text">{errors.warrantyExpiration}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              <Plus size={20} />
              Thêm xe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleManagement;