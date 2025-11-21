import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import vehicleService from '../../../services/vehicleService';
import { Vehicle } from '../../../types';
import './AddVehicleModal.css';

interface EditVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicle: Vehicle;
}

const EditVehicleModal: React.FC<EditVehicleModalProps> = ({ isOpen, onClose, onSuccess, vehicle }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    color: '',
    mileage: 0,
    purchaseDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load vehicle data when modal opens
  useEffect(() => {
    if (isOpen && vehicle) {
      setFormData({
        licensePlate: vehicle.licensePlate || '',
        color: vehicle.color || '',
        mileage: vehicle.mileage || 0,
        purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : ''
      });
      setError(null);
    }
  }, [isOpen, vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (!formData.licensePlate || !formData.color) {
        throw new Error('Vui lòng điền đầy đủ thông tin bắt buộc');
      }

      // Prepare update data
      const updateData = {
        licensePlate: formData.licensePlate,
        color: formData.color,
        mileage: formData.mileage || 0,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : undefined
      };

      await vehicleService.updateMyVehicle(vehicle.id, updateData);
      
      // Success
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error updating vehicle:', err);
      console.error('Error response:', err.response);
      
      let errorMessage = 'Không thể cập nhật xe. Vui lòng thử lại.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
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
          <h2>Chỉnh sửa thông tin xe</h2>
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

          <div className="form-section">
            <h3>Thông tin xe</h3>
            
            {/* Vehicle Model - Read only */}
            <div className="form-group">
              <label>Mẫu xe</label>
              <input
                type="text"
                value={`${vehicle.make || ''} ${vehicle.model || ''}`}
                disabled
                className="read-only"
              />
              <small className="form-hint">Không thể thay đổi mẫu xe</small>
            </div>

            {/* VIN - Read only */}
            <div className="form-group">
              <label>VIN (Số khung)</label>
              <input
                type="text"
                value={vehicle.vin || ''}
                disabled
                className="read-only"
              />
              <small className="form-hint">Không thể thay đổi VIN</small>
            </div>

            {/* License Plate */}
            <div className="form-group">
              <label htmlFor="licensePlate">
                Biển số xe <span className="required">*</span>
              </label>
              <input
                type="text"
                id="licensePlate"
                name="licensePlate"
                value={formData.licensePlate}
                onChange={handleChange}
                placeholder="Ví dụ: 51A-12345"
                required
              />
            </div>

            {/* Color */}
            <div className="form-group">
              <label htmlFor="color">
                Màu sắc <span className="required">*</span>
              </label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Ví dụ: Đen, Trắng, Xanh"
                required
              />
            </div>

            {/* Mileage */}
            <div className="form-group">
              <label htmlFor="mileage">Số km đã đi</label>
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>

            {/* Purchase Date */}
            <div className="form-group">
              <label htmlFor="purchaseDate">Ngày mua xe</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;
