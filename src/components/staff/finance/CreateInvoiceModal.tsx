import React, { useState, useEffect } from 'react';
import { X, FileText, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { MDButton } from '../../ui';
import './CreateInvoiceModal.css';
import invoiceService from '../../../services/invoiceService';
import serviceOrderService from '../../../services/serviceOrderService';
import { Appointment } from '../../../services/appointmentService';

interface CreateInvoiceModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  appointment,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceOrderId, setServiceOrderId] = useState<string | null>(null);
  const [selectedPackages, setSelectedPackages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subtotal: 0,
    taxRate: 10, // 10%
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    // Lấy service order ID từ appointment
    loadServiceOrder();
    loadSelectedPackages();
    
    // Tính ngày hết hạn mặc định (7 ngày sau)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    setFormData(prev => ({
      ...prev,
      dueDate: dueDate.toISOString().split('T')[0]
    }));
  }, [appointment]);

  const loadSelectedPackages = async () => {
    try {
      console.log('📦 Loading selected packages for appointment:', appointment.id);
      const response = await fetch(`http://localhost:8080/api/appointments/${appointment.id}/packages`);
      const data = await response.json();
      
      if (data.code === 1000 && data.result) {
        console.log('✅ Selected packages:', data.result);
        setSelectedPackages(data.result);
      } else {
        console.warn('⚠️ No packages found or error:', data);
        setSelectedPackages([]);
      }
    } catch (error) {
      console.error('❌ Error loading packages:', error);
      setSelectedPackages([]);
    }
  };

  const loadServiceOrder = async () => {
    try {
      console.log('🔍 Loading service order for appointment:', appointment.id);
      console.log('📋 Appointment data:', appointment);
      
      // Lấy service order từ appointment
      const response = await serviceOrderService.getAllServiceOrders();
      console.log('📦 Service orders response:', response);
      
      // Extract serviceOrders array from response
      const orders = response.serviceOrders || [];
      console.log('📊 Total service orders:', orders.length);
      
      const order = orders.find(o => o.appointmentId === appointment.id);
      console.log('🎯 Found service order for this appointment:', order);
      
      if (order) {
        setServiceOrderId(order.id);
        console.log('✅ Service order ID:', order.id);
        console.log('💰 Total cost:', order.totalCost);
        
        // Tính toán từ service order
        const subtotal = order.totalCost || 0;
        const taxAmount = subtotal * (formData.taxRate / 100);
        const totalAmount = subtotal + taxAmount - formData.discountAmount;
        
        setFormData(prev => ({
          ...prev,
          subtotal,
          taxAmount,
          totalAmount
        }));
      } else {
        console.error('❌ No service order found for appointment:', appointment.id);
        console.log('📝 Available appointment IDs in service orders:', orders.map(o => o.appointmentId));
        console.log('💡 You need to create a Service Order first!');
        setError('Không tìm thấy Service Order cho appointment này. Appointment này chưa được tạo Service Order. Vui lòng đóng modal này và tạo Service Order trước.');
      }
    } catch (error: any) {
      console.error('❌ Error loading service order:', error);
      setError(error.response?.data?.message || 'Không thể tải thông tin Service Order');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = name !== 'notes' && name !== 'dueDate' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: numValue };
      
      // Tính lại tổng tiền khi thay đổi subtotal, tax, hoặc discount
      if (name === 'subtotal' || name === 'taxRate' || name === 'discountAmount') {
        const subtotal = name === 'subtotal' ? (numValue as number) : prev.subtotal;
        const taxRate = name === 'taxRate' ? (numValue as number) : prev.taxRate;
        const discountAmount = name === 'discountAmount' ? (numValue as number) : prev.discountAmount;
        
        updated.taxAmount = subtotal * (taxRate / 100);
        updated.totalAmount = subtotal + updated.taxAmount - discountAmount;
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!serviceOrderId) {
      setError('Không có Service Order để tạo invoice');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const createRequest = {
        serviceOrderId: serviceOrderId,
        subtotal: formData.subtotal,
        taxAmount: formData.taxAmount,
        discountAmount: formData.discountAmount,
        dueDate: new Date(formData.dueDate).toISOString(),
        notes: formData.notes
      };
      
      console.log('Creating invoice with data:', createRequest);
      await invoiceService.createInvoice(createRequest);
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      setError(error.response?.data?.message || 'Không thể tạo hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content create-invoice-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <FileText size={24} />
            <h2>Tạo hóa đơn</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-alert">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Thông tin appointment */}
            <div className="appointment-info-section">
              <h3>Thông tin dịch vụ</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{appointment.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Biển số xe:</span>
                  <span className="value">{appointment.vehicleLicensePlate}</span>
                </div>
                <div className="info-item">
                  <span className="label">Kỹ thuật viên:</span>
                  <span className="value">{appointment.technicianName || 'N/A'}</span>
                </div>
              </div>

              {/* Hiển thị danh sách các gói dịch vụ đã chọn */}
              {selectedPackages.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#495057' }}>
                    📦 Các gói dịch vụ đã chọn ({selectedPackages.length} gói):
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedPackages.map((pkg, index) => (
                      <div key={index} style={{ 
                        padding: '12px', 
                        backgroundColor: '#ffffff', 
                        borderRadius: '6px', 
                        border: '1px solid #e9ecef',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#212529' }}>
                            {pkg.packageName}
                          </div>
                        </div>
                        <div style={{ fontWeight: 600, color: '#28a745', fontSize: '16px', whiteSpace: 'nowrap', marginLeft: '20px' }}>
                          {formatCurrency(pkg.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '2px solid #dee2e6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: '#495057' }}>Tổng giá trị các gói:</span>
                    <span style={{ fontWeight: 700, color: '#28a745', fontSize: '18px' }}>
                      {formatCurrency(selectedPackages.reduce((sum, pkg) => sum + (pkg.price || 0), 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thông tin tài chính */}
            <div className="financial-section">
              <h3>Thông tin thanh toán</h3>
              
              <div className="form-group">
                <label htmlFor="subtotal">
                  <DollarSign size={18} />
                  Tổng tiền dịch vụ (VNĐ)
                </label>
                <input
                  type="number"
                  id="subtotal"
                  name="subtotal"
                  value={formData.subtotal}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="taxRate">Thuế (%)</label>
                  <input
                    type="number"
                    id="taxRate"
                    name="taxRate"
                    value={formData.taxRate}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="taxAmount">Tiền thuế (VNĐ)</label>
                  <input
                    type="number"
                    id="taxAmount"
                    name="taxAmount"
                    value={formData.taxAmount.toFixed(0)}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="discountAmount">Giảm giá (VNĐ)</label>
                <input
                  type="number"
                  id="discountAmount"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate">
                  <Calendar size={18} />
                  Hạn thanh toán
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Ghi chú</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Ghi chú thêm về hóa đơn..."
                />
              </div>

              {/* Tổng cộng */}
              <div className="total-section">
                <div className="total-row">
                  <span>Tổng tiền dịch vụ:</span>
                  <span>{formatCurrency(formData.subtotal)}</span>
                </div>
                <div className="total-row">
                  <span>Thuế ({formData.taxRate}%):</span>
                  <span>{formatCurrency(formData.taxAmount)}</span>
                </div>
                {formData.discountAmount > 0 && (
                  <div className="total-row discount">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(formData.discountAmount)}</span>
                  </div>
                )}
                <div className="total-row final">
                  <span>TỔNG CỘNG:</span>
                  <span>{formatCurrency(formData.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <MDButton
              type="button"
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </MDButton>
            <MDButton
              type="submit"
              variant="filled"
              disabled={loading || !serviceOrderId}
            >
              {loading ? 'Đang tạo...' : 'Tạo hóa đơn'}
            </MDButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceModal;
