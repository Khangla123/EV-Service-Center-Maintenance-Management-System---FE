import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, ShoppingCart, Search, Filter, Plus, Minus, Edit, Eye, BarChart3 } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  category: 'engine' | 'battery' | 'brake' | 'tire' | 'electrical' | 'body' | 'other';
  brand: string;
  description?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  location: string; // Vị trí trong kho
  supplier: string;
  lastRestocked: Date;
  usageCount: number; // Số lần sử dụng
  avgUsagePerMonth: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'discontinued';
  imageUrl?: string;
}

interface StockTransaction {
  id: string;
  partId: string;
  partName: string;
  type: 'inbound' | 'outbound' | 'adjustment';
  quantity: number;
  unitPrice?: number;
  reason: string;
  performedBy: string;
  appointmentId?: string; // Nếu là xuất kho cho đơn dịch vụ
  createdAt: Date;
}

interface StockAlert {
  id: string;
  partId: string;
  partName: string;
  alertType: 'low-stock' | 'out-of-stock' | 'overstock' | 'expired';
  currentStock: number;
  minStock?: number;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const SparePartsManagement: React.FC = () => {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [showAddPartModal, setShowAddPartModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [transactionType, setTransactionType] = useState<'inbound' | 'outbound'>('inbound');
  const [transactionQuantity, setTransactionQuantity] = useState(0);
  const [transactionReason, setTransactionReason] = useState('');

  // Mock data
  useEffect(() => {
    const mockSpareParts: SparePart[] = [
      {
        id: 'part1',
        name: 'Má phanh trước VF8',
        partNumber: 'VF8-BRAKE-001',
        category: 'brake',
        brand: 'VinFast',
        description: 'Má phanh trước cho VinFast VF8, chất liệu ceramic',
        currentStock: 5,
        minStock: 10,
        maxStock: 50,
        unitPrice: 800000,
        location: 'A1-01',
        supplier: 'VinFast Parts',
        lastRestocked: new Date('2025-01-10'),
        usageCount: 25,
        avgUsagePerMonth: 8,
        status: 'low-stock'
      },
      {
        id: 'part2',
        name: 'Pin Li-ion 87.7kWh',
        partNumber: 'VF8-BAT-877',
        category: 'battery',
        brand: 'CATL',
        description: 'Pin lithium-ion 87.7kWh cho VinFast VF8',
        currentStock: 2,
        minStock: 3,
        maxStock: 10,
        unitPrice: 250000000,
        location: 'B2-05',
        supplier: 'CATL Vietnam',
        lastRestocked: new Date('2024-12-15'),
        usageCount: 3,
        avgUsagePerMonth: 1,
        status: 'low-stock'
      },
      {
        id: 'part3',
        name: 'Dầu phanh DOT4',
        partNumber: 'BRAKE-FLUID-DOT4',
        category: 'brake',
        brand: 'Bosch',
        description: 'Dầu phanh DOT4 cho hệ thống phanh ABS',
        currentStock: 25,
        minStock: 15,
        maxStock: 100,
        unitPrice: 150000,
        location: 'C3-12',
        supplier: 'Bosch Vietnam',
        lastRestocked: new Date('2025-01-15'),
        usageCount: 45,
        avgUsagePerMonth: 12,
        status: 'in-stock'
      },
      {
        id: 'part4',
        name: 'Lốp Michelin 255/50R20',
        partNumber: 'TIRE-MICH-255-50-20',
        category: 'tire',
        brand: 'Michelin',
        description: 'Lốp xe điện Michelin 255/50R20 cho VF8/VF9',
        currentStock: 0,
        minStock: 8,
        maxStock: 40,
        unitPrice: 3500000,
        location: 'D1-08',
        supplier: 'Michelin Vietnam',
        lastRestocked: new Date('2024-12-20'),
        usageCount: 16,
        avgUsagePerMonth: 4,
        status: 'out-of-stock'
      }
    ];

    const mockTransactions: StockTransaction[] = [
      {
        id: 'trans1',
        partId: 'part1',
        partName: 'Má phanh trước VF8',
        type: 'outbound',
        quantity: 2,
        reason: 'Sử dụng cho dịch vụ bảo dưỡng khách hàng Nguyễn Văn A',
        performedBy: 'Lê Văn C',
        appointmentId: 'apt1',
        createdAt: new Date('2025-01-20T14:30:00')
      },
      {
        id: 'trans2',
        partId: 'part3',
        partName: 'Dầu phanh DOT4',
        type: 'outbound',
        quantity: 1,
        reason: 'Thay dầu phanh định kỳ',
        performedBy: 'Lê Văn C',
        appointmentId: 'apt1',
        createdAt: new Date('2025-01-20T10:15:00')
      },
      {
        id: 'trans3',
        partId: 'part2',
        partName: 'Pin Li-ion 87.7kWh',
        type: 'inbound',
        quantity: 2,
        unitPrice: 250000000,
        reason: 'Nhập hàng định kỳ',
        performedBy: 'Admin',
        createdAt: new Date('2024-12-15T09:00:00')
      }
    ];

    const mockAlerts: StockAlert[] = [
      {
        id: 'alert1',
        partId: 'part1',
        partName: 'Má phanh trước VF8',
        alertType: 'low-stock',
        currentStock: 5,
        minStock: 10,
        message: 'Má phanh trước VF8 sắp hết hàng (5/10)',
        isRead: false,
        createdAt: new Date('2025-01-20T15:00:00')
      },
      {
        id: 'alert2',
        partId: 'part4',
        partName: 'Lốp Michelin 255/50R20',
        alertType: 'out-of-stock',
        currentStock: 0,
        message: 'Lốp Michelin 255/50R20 đã hết hàng',
        isRead: false,
        createdAt: new Date('2025-01-18T10:30:00')
      },
      {
        id: 'alert3',
        partId: 'part2',
        partName: 'Pin Li-ion 87.7kWh',
        alertType: 'low-stock',
        currentStock: 2,
        minStock: 3,
        message: 'Pin Li-ion 87.7kWh dưới mức tối thiểu (2/3)',
        isRead: true,
        createdAt: new Date('2025-01-15T14:20:00')
      }
    ];

    setSpareParts(mockSpareParts);
    setTransactions(mockTransactions);
    setAlerts(mockAlerts);
  }, []);

  const filteredParts = spareParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || part.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleStockTransaction = () => {
    if (!selectedPart || transactionQuantity <= 0) return;

    const newTransaction: StockTransaction = {
      id: `trans${Date.now()}`,
      partId: selectedPart.id,
      partName: selectedPart.name,
      type: transactionType,
      quantity: transactionQuantity,
      reason: transactionReason,
      performedBy: 'Current User',
      createdAt: new Date()
    };

    setTransactions(prev => [newTransaction, ...prev]);

    // Update stock
    setSpareParts(prev =>
      prev.map(part =>
        part.id === selectedPart.id
          ? {
              ...part,
              currentStock: transactionType === 'inbound' 
                ? part.currentStock + transactionQuantity
                : Math.max(0, part.currentStock - transactionQuantity),
              lastRestocked: transactionType === 'inbound' ? new Date() : part.lastRestocked,
              usageCount: transactionType === 'outbound' 
                ? part.usageCount + transactionQuantity
                : part.usageCount
            }
          : part
      )
    );

    setShowTransactionModal(false);
    setTransactionQuantity(0);
    setTransactionReason('');
  };

  const getStatusColor = (status: SparePart['status']) => {
    switch (status) {
      case 'in-stock': return 'text-green-600 bg-green-100';
      case 'low-stock': return 'text-yellow-600 bg-yellow-100';
      case 'out-of-stock': return 'text-red-600 bg-red-100';
      case 'discontinued': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: SparePart['category']) => {
    switch (category) {
      case 'engine': return '🔧';
      case 'battery': return '🔋';
      case 'brake': return '🛑';
      case 'tire': return '🛞';
      case 'electrical': return '⚡';
      case 'body': return '🚗';
      default: return '⚙️';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;

  return (
    <div className="spare-parts-management p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý phụ tùng</h1>
          <p className="text-gray-600">Theo dõi kho hàng và quản lý xuất nhập phụ tùng</p>
        </div>
        <div className="flex gap-2">
          {unreadAlerts > 0 && (
            <div className="flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {unreadAlerts} cảnh báo mới
            </div>
          )}
          <MDButton
            onClick={() => setShowAddPartModal(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm phụ tùng
          </MDButton>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng phụ tùng</p>
              <p className="text-2xl font-bold text-gray-900">{spareParts.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-yellow-600">
                {spareParts.filter(p => p.status === 'low-stock').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600">
                {spareParts.filter(p => p.status === 'out-of-stock').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Giá trị kho</p>
              <p className="text-2xl font-bold text-green-600">
                {(spareParts.reduce((sum, part) => sum + (part.currentStock * part.unitPrice), 0) / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm phụ tùng..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          <option value="engine">Động cơ</option>
          <option value="battery">Pin</option>
          <option value="brake">Phanh</option>
          <option value="tire">Lốp</option>
          <option value="electrical">Điện</option>
          <option value="body">Thân xe</option>
          <option value="other">Khác</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="in-stock">Còn hàng</option>
          <option value="low-stock">Sắp hết</option>
          <option value="out-of-stock">Hết hàng</option>
          <option value="discontinued">Ngừng kinh doanh</option>
        </select>

        <MDButton
          onClick={() => {/* Export functionality */}}
          variant="outlined"
          className="flex items-center justify-center"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Xuất báo cáo
        </MDButton>
      </div>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredParts.map((part) => (
          <MDCard key={part.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getCategoryIcon(part.category)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{part.name}</h3>
                  <p className="text-sm text-gray-500">{part.partNumber}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(part.status)}`}>
                {part.status === 'in-stock' && 'Còn hàng'}
                {part.status === 'low-stock' && 'Sắp hết'}
                {part.status === 'out-of-stock' && 'Hết hàng'}
                {part.status === 'discontinued' && 'Ngừng KD'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tồn kho:</span>
                <span className={`font-medium ${part.currentStock <= part.minStock ? 'text-red-600' : 'text-gray-900'}`}>
                  {part.currentStock} / {part.maxStock}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vị trí:</span>
                <span className="text-gray-900">{part.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Đơn giá:</span>
                <span className="text-gray-900 font-medium">
                  {part.unitPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sử dụng/tháng:</span>
                <span className="text-gray-900">{part.avgUsagePerMonth}</span>
              </div>
            </div>

            {/* Stock Level Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Mức tồn</span>
                <span>{((part.currentStock / part.maxStock) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    part.currentStock <= part.minStock 
                      ? 'bg-red-500' 
                      : part.currentStock <= part.minStock * 1.5
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((part.currentStock / part.maxStock) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <MDButton
                onClick={() => {
                  setSelectedPart(part);
                  setTransactionType('inbound');
                  setShowTransactionModal(true);
                }}
                size="small"
                className="bg-green-500 hover:bg-green-600"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nhập
              </MDButton>
              <MDButton
                onClick={() => {
                  setSelectedPart(part);
                  setTransactionType('outbound');
                  setShowTransactionModal(true);
                }}
                size="small"
                className="bg-red-500 hover:bg-red-600"
                disabled={part.currentStock === 0}
              >
                <Minus className="h-4 w-4 mr-1" />
                Xuất
              </MDButton>
              <MDButton
                onClick={() => setSelectedPart(part)}
                size="small"
                variant="outlined"
              >
                <Eye className="h-4 w-4 mr-1" />
                Chi tiết
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>

      {/* Stock Transaction Modal */}
      {showTransactionModal && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {transactionType === 'inbound' ? 'Nhập kho' : 'Xuất kho'} - {selectedPart.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  max={transactionType === 'outbound' ? selectedPart.currentStock : 999}
                  value={transactionQuantity}
                  onChange={(e) => setTransactionQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do
                </label>
                <textarea
                  value={transactionReason}
                  onChange={(e) => setTransactionReason(e.target.value)}
                  placeholder="Nhập lý do xuất/nhập kho..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <MDButton
                onClick={handleStockTransaction}
                disabled={transactionQuantity <= 0 || !transactionReason.trim()}
                className={`${
                  transactionType === 'inbound' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Xác nhận {transactionType === 'inbound' ? 'nhập' : 'xuất'}
              </MDButton>
              <MDButton
                onClick={() => {
                  setShowTransactionModal(false);
                  setTransactionQuantity(0);
                  setTransactionReason('');
                }}
                variant="outlined"
              >
                Hủy
              </MDButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsManagement;