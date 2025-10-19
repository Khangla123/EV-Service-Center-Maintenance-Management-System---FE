import React, { useState } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import './PartsPersonal.css';

type PartsView = 'inventory' | 'requests' | 'usage';

type PartRequest = {
  id: string;
  partName: string;
  partCode: string;
  quantity: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  vehicleId: string;
  notes?: string;
};

type PartUsage = {
  id: string;
  partName: string;
  partCode: string;
  quantity: number;
  usedDate: string;
  vehicleId: string;
  workOrderId: string;
};

type InventoryPart = {
  code: string;
  name: string;
  category: string;
  inStock: number;
  minStock: number;
  unit: string;
};

const mockRequests: PartRequest[] = [
  { id: 'REQ-001', partName: 'Pin Lithium-ion 12V', partCode: 'BAT-001', quantity: 2, requestDate: '2025-10-16 09:30', status: 'pending', vehicleId: 'VF8-XV123' },
  { id: 'REQ-002', partName: 'Má phanh trước', partCode: 'BRK-045', quantity: 4, requestDate: '2025-10-15 14:20', status: 'approved', vehicleId: 'VF9-VF456' },
  { id: 'REQ-003', partName: 'Dầu phanh DOT 4', partCode: 'OIL-012', quantity: 1, requestDate: '2025-10-15 10:15', status: 'delivered', vehicleId: 'VF8-AB789' },
];

const mockUsage: PartUsage[] = [
  { id: 'USE-001', partName: 'Má phanh trước', partCode: 'BRK-045', quantity: 4, usedDate: '2025-10-16 11:00', vehicleId: 'VF9-VF456', workOrderId: 'WO-1002' },
  { id: 'USE-002', partName: 'Lốp xe 20"', partCode: 'TIR-089', quantity: 1, usedDate: '2025-10-15 16:30', vehicleId: 'VF8-CD321', workOrderId: 'WO-0998' },
];

const mockInventory: InventoryPart[] = [
  { code: 'BAT-001', name: 'Pin Lithium-ion 12V', category: 'Pin', inStock: 15, minStock: 10, unit: 'cái' },
  { code: 'BRK-045', name: 'Má phanh trước', category: 'Phanh', inStock: 8, minStock: 12, unit: 'bộ' },
  { code: 'TIR-089', name: 'Lốp xe 20"', category: 'Lốp', inStock: 24, minStock: 8, unit: 'cái' },
  { code: 'OIL-012', name: 'Dầu phanh DOT 4', category: 'Dầu nhớt', inStock: 5, minStock: 10, unit: 'lít' },
  { code: 'FIL-023', name: 'Lọc gió cabin', category: 'Lọc', inStock: 18, minStock: 15, unit: 'cái' },
];

const PartsPersonal: React.FC = () => {
  const [activeView, setActiveView] = useState<PartsView>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    partCode: '',
    partName: '',
    quantity: 1,
    vehicleId: '',
    notes: ''
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { label: 'Chờ duyệt', icon: <Clock size={14} />, class: 'status-pending' },
      approved: { label: 'Đã duyệt', icon: <CheckCircle size={14} />, class: 'status-approved' },
      rejected: { label: 'Từ chối', icon: <XCircle size={14} />, class: 'status-rejected' },
      delivered: { label: 'Đã giao', icon: <CheckCircle size={14} />, class: 'status-delivered' }
    };
    const badge = badges[status as keyof typeof badges];
    return (
      <span className={`status-badge ${badge.class}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const handleSubmitRequest = () => {
    console.log('Submitting request:', newRequest);
    setShowRequestForm(false);
    setNewRequest({ partCode: '', partName: '', quantity: 1, vehicleId: '', notes: '' });
  };

  const renderInventory = () => (
    <div className="parts-section">
      <div className="section-header">
        <h3>Kiểm tra Tồn kho</h3>
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm phụ tùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="inventory-grid">
        {mockInventory
          .filter(part => 
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.code.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(part => (
            <div key={part.code} className={`inventory-card ${part.inStock < part.minStock ? 'low-stock' : ''}`}>
              <div className="part-header">
                <Package size={20} />
                <span className="part-code">{part.code}</span>
              </div>
              <h4>{part.name}</h4>
              <div className="part-category">{part.category}</div>
              <div className="stock-info">
                <div className="stock-level">
                  <span className="label">Tồn kho:</span>
                  <span className={`value ${part.inStock < part.minStock ? 'low' : ''}`}>
                    {part.inStock} {part.unit}
                  </span>
                </div>
                {part.inStock < part.minStock && (
                  <div className="stock-warning">
                    <AlertTriangle size={14} />
                    <span>Dưới mức tối thiểu</span>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="parts-section">
      <div className="section-header">
        <h3>Yêu cầu Phụ tùng</h3>
        <button className="btn-primary" onClick={() => setShowRequestForm(true)}>
          + Tạo yêu cầu mới
        </button>
      </div>

      {showRequestForm && (
        <div className="request-form">
          <h4>Tạo yêu cầu xuất kho</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Mã phụ tùng</label>
              <input
                type="text"
                placeholder="Nhập mã phụ tùng"
                value={newRequest.partCode}
                onChange={(e) => setNewRequest({...newRequest, partCode: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Tên phụ tùng</label>
              <input
                type="text"
                placeholder="Nhập tên phụ tùng"
                value={newRequest.partName}
                onChange={(e) => setNewRequest({...newRequest, partName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Số lượng</label>
              <input
                type="number"
                min="1"
                value={newRequest.quantity}
                onChange={(e) => setNewRequest({...newRequest, quantity: parseInt(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label>Mã xe</label>
              <input
                type="text"
                placeholder="VF8-XXXXX"
                value={newRequest.vehicleId}
                onChange={(e) => setNewRequest({...newRequest, vehicleId: e.target.value})}
              />
            </div>
            <div className="form-group full-width">
              <label>Ghi chú</label>
              <textarea
                placeholder="Ghi chú thêm (tùy chọn)"
                value={newRequest.notes}
                onChange={(e) => setNewRequest({...newRequest, notes: e.target.value})}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setShowRequestForm(false)}>Hủy</button>
            <button className="btn-primary" onClick={handleSubmitRequest}>Gửi yêu cầu</button>
          </div>
        </div>
      )}

      <div className="requests-list">
        {mockRequests.map(req => (
          <div key={req.id} className="request-card">
            <div className="request-header">
              <div className="request-id">{req.id}</div>
              {getStatusBadge(req.status)}
            </div>
            <div className="request-body">
              <h4>{req.partName}</h4>
              <div className="request-details">
                <span className="detail-item">Mã: {req.partCode}</span>
                <span className="detail-item">Số lượng: {req.quantity}</span>
                <span className="detail-item">Xe: {req.vehicleId}</span>
              </div>
              <div className="request-date">Yêu cầu lúc: {req.requestDate}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="parts-section">
      <div className="section-header">
        <h3>Lịch sử Sử dụng</h3>
      </div>

      <div className="usage-table">
        <table>
          <thead>
            <tr>
              <th>Mã PT</th>
              <th>Tên phụ tùng</th>
              <th>Số lượng</th>
              <th>Ngày sử dụng</th>
              <th>Mã xe</th>
              <th>Phiếu công việc</th>
            </tr>
          </thead>
          <tbody>
            {mockUsage.map(usage => (
              <tr key={usage.id}>
                <td className="code">{usage.partCode}</td>
                <td>{usage.partName}</td>
                <td className="quantity">{usage.quantity}</td>
                <td>{usage.usedDate}</td>
                <td className="vehicle">{usage.vehicleId}</td>
                <td className="work-order">{usage.workOrderId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="parts-personal">
      <div className="parts-header">
        <h2>Quản lý Phụ tùng</h2>
        <p>Yêu cầu phụ tùng, theo dõi trạng thái và ghi nhận sử dụng</p>
      </div>

      <div className="parts-tabs">
        <button
          className={`tab ${activeView === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveView('inventory')}
        >
          <Package size={18} />
          Tồn kho
        </button>
        <button
          className={`tab ${activeView === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveView('requests')}
        >
          <Clock size={18} />
          Yêu cầu của tôi
        </button>
        <button
          className={`tab ${activeView === 'usage' ? 'active' : ''}`}
          onClick={() => setActiveView('usage')}
        >
          <CheckCircle size={18} />
          Lịch sử sử dụng
        </button>
      </div>

      <div className="parts-content">
        {activeView === 'inventory' && renderInventory()}
        {activeView === 'requests' && renderRequests()}
        {activeView === 'usage' && renderUsage()}
      </div>
    </div>
  );
};

export default PartsPersonal;
