import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import vehicleService from '../../../services/vehicleService';
import vehicleModelService, { VehicleModel } from '../../../services/vehicleModelService';
import './AddVehicleModal.css';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vehicleModelId: '',
    licensePlate: '',
    vin: '',
    color: '',
    mileage: 0,
    purchaseDate: '',
    warrantyExpiration: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vehicleModels, setVehicleModels] = useState<VehicleModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<VehicleModel[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');

  // Load danh sách VehicleModel khi modal mở
  useEffect(() => {
    if (isOpen) {
      loadVehicleModels();
    }
  }, [isOpen]);

  const loadVehicleModels = async () => {
    try {
      const models = await vehicleModelService.getAllVehicleModels();
      setVehicleModels(models);
    } catch (err) {
      console.error('Error loading vehicle models:', err);
    }
  };

  // Lấy danh sách hãng xe unique
  const manufacturers = Array.from(new Set(vehicleModels.map(m => m.manufacturer))).sort();

  // Filter models khi chọn manufacturer
  useEffect(() => {
    if (selectedManufacturer) {
      const filtered = vehicleModels.filter(m => m.manufacturer === selectedManufacturer);
      setFilteredModels(filtered);
    } else {
      setFilteredModels([]);
    }
  }, [selectedManufacturer, vehicleModels]);

  const handleManufacturerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const manufacturer = e.target.value;
    setSelectedManufacturer(manufacturer);
    setFormData(prev => ({ ...prev, vehicleModelId: '' })); // Reset model selection
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mileage' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.vehicleModelId) {
        throw new Error('Vui lòng chọn mẫu xe');
      }
      if (!formData.licensePlate || !formData.vin || !formData.color) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Convert dates
      const vehicleData = {
        vehicleModelId: formData.vehicleModelId,
        vin: formData.vin,
        licensePlate: formData.licensePlate,
        color: formData.color,
        mileage: formData.mileage || 0,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : new Date(),
        warrantyExpiration: formData.warrantyExpiration ? new Date(formData.warrantyExpiration) : undefined
      };

      await vehicleService.registerMyVehicle(vehicleData);
      
      // Success
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        vehicleModelId: '',
        licensePlate: '',
        vin: '',
        color: '',
        mileage: 0,
        purchaseDate: '',
        warrantyExpiration: ''
      });
      setSelectedManufacturer('');
    } catch (err: any) {
      console.error('Error creating vehicle:', err);
      console.error('Error response:', err.response);
      
      // Xử lý các lỗi cụ thể
      let errorMessage = 'Không thể thêm xe. Vui lòng thử lại.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
        
        // Customize message cho các trường hợp đặc biệt
        if (errorMessage.includes('Người dùng đã tồn tại') || errorMessage.includes('USER_EXISTED')) {
          errorMessage = 'Xe đã tồn tại trong hệ thống (VIN hoặc biển số trùng lặp)';
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="manufacturer">Hãng xe *</label>
              <select
                id="manufacturer"
                value={selectedManufacturer}
                onChange={handleManufacturerChange}
                required
              >
                <option value="">-- Chọn hãng xe --</option>
                {manufacturers.map(manufacturer => (
                  <option key={manufacturer} value={manufacturer}>{manufacturer}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="vehicleModelId">Model *</label>
              <select
                id="vehicleModelId"
                name="vehicleModelId"
                value={formData.vehicleModelId}
                onChange={handleChange}
                disabled={!selectedManufacturer}
                required
              >
                <option value="">-- Chọn model --</option>
                {filteredModels.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.model} ({model.year}) - {model.batteryCapacity} kWh
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color">Màu sắc *</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="VD: Trắng, Đen, Xanh"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="mileage">Số km đã đi</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                placeholder="VD: 5000"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="licensePlate">Biển số xe *</label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="VD: 51A-12345"
                required
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="vin">Số VIN (Vehicle Identification Number) *</label>
              <input
                type="text"
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                placeholder="17 ký tự"
                maxLength={17}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">Ngày mua</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="warrantyExpiration">Ngày hết hạn bảo hành</label>
              <input
                type="date"
                id="warrantyExpiration"
                name="warrantyExpiration"
                value={formData.warrantyExpiration}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Hủy
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Đang thêm...' : 'Thêm xe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;
