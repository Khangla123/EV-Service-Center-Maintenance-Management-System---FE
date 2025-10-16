import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Vehicle } from '../../../types';
import { Car, Calendar, Battery, Gauge, Plus, Edit, Trash2 } from 'lucide-react';
import './VehicleManagement.css';
import vehicleService from '../../../services/vehicleService';

const VehicleManagement: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    make: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    color: '',
    batteryCapacity: 0,
    mileage: 0,
    purchaseDate: '',
    warrantyExpiration: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await vehicleService.getMyVehicles();
        setVehicles(data);
      } catch (err: any) {
        console.error('Error loading vehicles:', err);
        setError(err.response?.data?.message || 'Không thể tải danh sách xe');
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getBatteryStatusColor = (capacity: number) => {
    if (capacity >= 100) return '#10b981'; // green
    if (capacity >= 80) return '#3b82f6'; // blue
    if (capacity >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const getWarrantyStatus = (warrantyExpiration: Date | null | undefined) => {
    if (!warrantyExpiration) {
      return { status: 'Không có thông tin', color: '#6b7280' };
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

  const getVehicleImage = (make: string, model: string) => {
    // Map vehicle model to image path
    if (make === 'VinFast') {
      if (model === 'VF8') {
        return '/assets/images/VinFast VF8.png';
      }
      if (model === 'VF9') {
        return '/assets/images/VinFast VF9.png';
      }
    }
    return null; // Return null if no image available
  };

  const handleBookService = (vehicleId: string) => {
    // Navigate to appointment booking with pre-selected vehicle
    navigate('/customer/booking', { state: { selectedVehicleId: vehicleId } });
  };

  const handleViewHistory = (vehicleId: string) => {
    // Navigate to maintenance history with vehicle filter
    navigate('/customer/history', { state: { selectedVehicleId: vehicleId } });
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

  if (error) {
    return (
      <div className="vehicle-management">
        <div className="error-state">
          <Car className="error-icon" />
          <h2>Không thể tải danh sách xe</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const handleAddVehicle = () => {
    setShowAddModal(true);
    setFormError(null);
    // Reset form
    setFormData({
      model: '',
      make: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
      color: '',
      batteryCapacity: 0,
      mileage: 0,
      purchaseDate: '',
      warrantyExpiration: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'batteryCapacity' || name === 'mileage' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const vehicleData = {
        ...formData,
        purchaseDate: new Date(formData.purchaseDate),
        warrantyExpiration: new Date(formData.warrantyExpiration)
      };

      await vehicleService.registerMyVehicle(vehicleData);
      
      // Reload vehicles list
      const data = await vehicleService.getMyVehicles();
      setVehicles(data);
      
      // Close modal
      setShowAddModal(false);
      
      // Show success message (you can add a toast notification here)
      alert('Thêm xe thành công!');
    } catch (err: any) {
      console.error('Error adding vehicle:', err);
      setFormError(err.response?.data?.message || 'Không thể thêm xe. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

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
            const vehicleImageSrc = getVehicleImage(vehicle.make, vehicle.model);
            
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
                    <span className="detail-value">{vehicle.mileage ? vehicle.mileage.toLocaleString() : 'N/A'} km</span>
                  </div>

                  <div className="detail-row">
                    <Battery size={16} style={{ color: getBatteryStatusColor(vehicle.batteryCapacity || 0) }} />
                    <span className="detail-label">Pin:</span>
                    <span className="detail-value">{vehicle.batteryCapacity || 'N/A'} kWh</span>
                  </div>

                  <div className="detail-row">
                    <Calendar size={16} />
                    <span className="detail-label">Mua:</span>
                    <span className="detail-value">{vehicle.purchaseDate ? formatDate(new Date(vehicle.purchaseDate)) : 'N/A'}</span>
                  </div>

                  <div className="detail-row warranty-row">
                    <span className="detail-label">Bảo hành:</span>
                    <span className="warranty-status" style={{ color: warrantyStatus.color }}>
                      {warrantyStatus.status}
                    </span>
                  </div>
                  
                  {vehicle.warrantyExpiration && (
                    <div className="warranty-date">
                      Hết hạn: {formatDate(new Date(vehicle.warrantyExpiration))}
                    </div>
                  )}
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
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content add-vehicle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm xe mới</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitVehicle}>
              <div className="modal-body">
                {formError && (
                  <div className="form-error">
                    {formError}
                  </div>
                )}
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="make">Hãng xe *</label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      placeholder="VD: VinFast"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="model">Dòng xe *</label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="VD: VF9"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Năm sản xuất *</label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="color">Màu sắc *</label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="VD: Đen, Trắng"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="licensePlate">Biển số xe *</label>
                    <input
                      type="text"
                      id="licensePlate"
                      name="licensePlate"
                      value={formData.licensePlate}
                      onChange={handleInputChange}
                      placeholder="VD: 30A-123.45"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="vin">Số VIN *</label>
                    <input
                      type="text"
                      id="vin"
                      name="vin"
                      value={formData.vin}
                      onChange={handleInputChange}
                      placeholder="VD: VF9ABC123456789"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="batteryCapacity">Dung lượng pin (kWh) *</label>
                    <input
                      type="number"
                      id="batteryCapacity"
                      name="batteryCapacity"
                      value={formData.batteryCapacity}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="VD: 100"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mileage">Số km đã chạy *</label>
                    <input
                      type="number"
                      id="mileage"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="VD: 14800"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="purchaseDate">Ngày mua *</label>
                    <input
                      type="date"
                      id="purchaseDate"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="warrantyExpiration">Ngày hết hạn bảo hành *</label>
                    <input
                      type="date"
                      id="warrantyExpiration"
                      name="warrantyExpiration"
                      value={formData.warrantyExpiration}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Đang thêm...' : 'Thêm xe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleManagement;