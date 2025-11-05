import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import partService, { PartResponse } from '../../../services/partService';
import './PartsPersonal.css';

type PartsView = 'inventory' | 'requests' | 'usage';

interface InventoryPart extends PartResponse {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

const PartsPersonal: React.FC = () => {
  const [activeView, setActiveView] = useState<PartsView>('inventory');
  const [searchTerm, setSearchTerm] = useState('');
  const [parts, setParts] = useState<InventoryPart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadParts();
  }, []);

  const loadParts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await partService.getAllParts();
      
      // Transform API response to include status
      const partsWithStatus: InventoryPart[] = response.map(part => ({
        ...part,
        status: part.stockQuantity === 0 
          ? 'out-of-stock' 
          : part.stockQuantity < part.minStockLevel 
          ? 'low-stock' 
          : 'in-stock'
      }));
      
      setParts(partsWithStatus);
    } catch (err: any) {
      console.error('Error loading parts:', err);
      setError(err.response?.data?.message || 'Không thể tải danh sách phụ tùng');
    } finally {
      setLoading(false);
    }
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

      {loading && <div className="loading-message">Đang tải danh sách phụ tùng...</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="inventory-grid">
        {parts
          .filter(part => 
            part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.partCode.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(part => (
            <div key={part.id} className={`inventory-card ${part.status}`}>
              <div className="part-header">
                <Package size={20} />
                <span className="part-code">{part.partCode}</span>
              </div>
              <h4>{part.name}</h4>
              <div className="part-category">{part.category}</div>
              <div className="stock-info">
                <div className="stock-level">
                  <span className="label">Tồn kho:</span>
                  <span className={`value ${part.stockQuantity < part.minStockLevel ? 'low' : ''}`}>
                    {part.stockQuantity} cái
                  </span>
                </div>
                {part.stockQuantity < part.minStockLevel && (
                  <div className="stock-warning">
                    <AlertTriangle size={14} />
                    <span>Dưới mức tối thiểu ({part.minStockLevel})</span>
                  </div>
                )}
                {part.supplier && (
                  <div className="supplier-info">
                    <span className="label">NCC:</span>
                    <span>{part.supplier}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      
      {!loading && parts.length === 0 && (
        <div className="empty-message">Không có phụ tùng nào trong kho</div>
      )}
    </div>
  );

  const renderRequests = () => (
    <div className="parts-section">
      <div className="section-header">
        <h3>Yêu cầu Phụ tùng</h3>
      </div>

      <div className="coming-soon-message" style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
      }}>
        <Clock size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
        <h3>Tính năng đang được phát triển</h3>
        <p>Chức năng yêu cầu phụ tùng sẽ sớm được cập nhật</p>
      </div>
    </div>
  );

  const renderUsage = () => (
    <div className="parts-section">
      <div className="section-header">
        <h3>Lịch sử Sử dụng</h3>
      </div>

      <div className="coming-soon-message" style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: '#666'
      }}>
        <CheckCircle size={48} style={{ margin: '0 auto 20px', opacity: 0.5 }} />
        <h3>Tính năng đang được phát triển</h3>
        <p>Lịch sử sử dụng phụ tùng sẽ sớm được cập nhật</p>
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
