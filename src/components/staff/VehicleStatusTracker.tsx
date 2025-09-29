import React, { useState, useEffect } from 'react';
import { Car, Clock, CheckCircle, AlertTriangle, User, Camera, FileText, MessageSquare, RefreshCw } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface VehicleStatus {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  technicianId: string;
  technicianName: string;
  currentStatus: 'checked-in' | 'in-progress' | 'waiting-parts' | 'quality-check' | 'completed' | 'ready-pickup';
  progress: number; // 0-100
  estimatedCompletion: Date;
  actualStartTime?: Date;
  issues: VehicleIssue[];
  updates: StatusUpdate[];
  images: VehicleImage[];
  createdAt: Date;
  updatedAt: Date;
}

interface VehicleIssue {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'in-progress' | 'resolved' | 'requires-approval';
  estimatedCost?: number;
  estimatedTime?: number; // in hours
  createdAt: Date;
  resolvedAt?: Date;
}

interface StatusUpdate {
  id: string;
  message: string;
  timestamp: Date;
  technicianName: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

interface VehicleImage {
  id: string;
  url: string;
  description: string;
  type: 'before' | 'during' | 'after' | 'issue';
  uploadedAt: Date;
  uploadedBy: string;
}

const VehicleStatusTracker: React.FC = () => {
  const [vehicleStatuses, setVehicleStatuses] = useState<VehicleStatus[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleStatus | null>(null);
  const [newUpdate, setNewUpdate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockStatuses: VehicleStatus[] = [
      {
        id: 'vs1',
        appointmentId: 'apt1',
        customerId: 'cust1',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0987654321',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF8',
        licensePlate: '30A-12345',
        serviceType: 'Bảo dưỡng định kỳ',
        technicianId: 'tech1',
        technicianName: 'Lê Văn C',
        currentStatus: 'in-progress',
        progress: 65,
        estimatedCompletion: new Date('2025-01-20T16:00:00'),
        actualStartTime: new Date('2025-01-20T09:15:00'),
        issues: [
          {
            id: 'issue1',
            description: 'Má phanh mòn cần thay thế',
            severity: 'medium',
            status: 'requires-approval',
            estimatedCost: 800000,
            estimatedTime: 1,
            createdAt: new Date('2025-01-20T10:30:00')
          }
        ],
        updates: [
          {
            id: 'update1',
            message: 'Bắt đầu kiểm tra hệ thống phanh',
            timestamp: new Date('2025-01-20T09:15:00'),
            technicianName: 'Lê Văn C',
            type: 'info'
          },
          {
            id: 'update2',
            message: 'Phát hiện má phanh mòn, cần thay thế',
            timestamp: new Date('2025-01-20T10:30:00'),
            technicianName: 'Lê Văn C',
            type: 'warning'
          }
        ],
        images: [
          {
            id: 'img1',
            url: '/api/images/brake-pad-before.jpg',
            description: 'Tình trạng má phanh trước khi thay',
            type: 'issue',
            uploadedAt: new Date('2025-01-20T10:35:00'),
            uploadedBy: 'Lê Văn C'
          }
        ],
        createdAt: new Date('2025-01-20T09:00:00'),
        updatedAt: new Date('2025-01-20T10:30:00')
      },
      {
        id: 'vs2',
        appointmentId: 'apt2',
        customerId: 'cust2',
        customerName: 'Trần Thị B',
        customerPhone: '0976543210',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF5',
        licensePlate: '51G-98765',
        serviceType: 'Kiểm tra pin',
        technicianId: 'tech1',
        technicianName: 'Lê Văn C',
        currentStatus: 'quality-check',
        progress: 90,
        estimatedCompletion: new Date('2025-01-20T11:30:00'),
        actualStartTime: new Date('2025-01-20T10:30:00'),
        issues: [],
        updates: [
          {
            id: 'update3',
            message: 'Kiểm tra pin hoàn tất, tất cả thông số bình thường',
            timestamp: new Date('2025-01-20T11:15:00'),
            technicianName: 'Lê Văn C',
            type: 'success'
          }
        ],
        images: [],
        createdAt: new Date('2025-01-20T10:30:00'),
        updatedAt: new Date('2025-01-20T11:15:00')
      }
    ];

    setVehicleStatuses(mockStatuses);
  }, []);

  const handleStatusUpdate = (vehicleId: string, newStatus: VehicleStatus['currentStatus']) => {
    setVehicleStatuses(prev =>
      prev.map(vehicle =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              currentStatus: newStatus,
              progress: getProgressByStatus(newStatus),
              updatedAt: new Date(),
              updates: [
                ...vehicle.updates,
                {
                  id: `update_${Date.now()}`,
                  message: getStatusMessage(newStatus),
                  timestamp: new Date(),
                  technicianName: vehicle.technicianName,
                  type: 'info'
                }
              ]
            }
          : vehicle
      )
    );
  };

  const handleAddUpdate = (vehicleId: string, message: string) => {
    if (!message.trim()) return;

    setVehicleStatuses(prev =>
      prev.map(vehicle =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              updatedAt: new Date(),
              updates: [
                ...vehicle.updates,
                {
                  id: `update_${Date.now()}`,
                  message: message.trim(),
                  timestamp: new Date(),
                  technicianName: vehicle.technicianName,
                  type: 'info'
                }
              ]
            }
          : vehicle
      )
    );

    setNewUpdate('');
    setShowUpdateModal(false);
  };

  const handleIssueStatusUpdate = (vehicleId: string, issueId: string, newStatus: VehicleIssue['status']) => {
    setVehicleStatuses(prev =>
      prev.map(vehicle =>
        vehicle.id === vehicleId
          ? {
              ...vehicle,
              issues: vehicle.issues.map(issue =>
                issue.id === issueId
                  ? {
                      ...issue,
                      status: newStatus,
                      resolvedAt: newStatus === 'resolved' ? new Date() : undefined
                    }
                  : issue
              ),
              updatedAt: new Date()
            }
          : vehicle
      )
    );
  };

  const getProgressByStatus = (status: VehicleStatus['currentStatus']): number => {
    switch (status) {
      case 'checked-in': return 10;
      case 'in-progress': return 50;
      case 'waiting-parts': return 40;
      case 'quality-check': return 80;
      case 'completed': return 95;
      case 'ready-pickup': return 100;
      default: return 0;
    }
  };

  const getStatusMessage = (status: VehicleStatus['currentStatus']): string => {
    switch (status) {
      case 'checked-in': return 'Xe đã được tiếp nhận';
      case 'in-progress': return 'Bắt đầu thực hiện dịch vụ';
      case 'waiting-parts': return 'Chờ linh kiện';
      case 'quality-check': return 'Đang kiểm tra chất lượng';
      case 'completed': return 'Hoàn thành dịch vụ';
      case 'ready-pickup': return 'Sẵn sàng giao xe';
      default: return 'Cập nhật trạng thái';
    }
  };

  const getStatusColor = (status: VehicleStatus['currentStatus']) => {
    switch (status) {
      case 'checked-in': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-purple-600 bg-purple-100';
      case 'waiting-parts': return 'text-orange-600 bg-orange-100';
      case 'quality-check': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'ready-pickup': return 'text-emerald-600 bg-emerald-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIssueColor = (severity: VehicleIssue['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredVehicles = vehicleStatuses.filter(vehicle => 
    filterStatus === 'all' || vehicle.currentStatus === filterStatus
  );

  return (
    <div className="vehicle-status-tracker p-6">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Theo dõi trạng thái xe</h1>
        <p className="text-gray-600">Cập nhật và theo dõi tiến độ bảo dưỡng xe khách hàng</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="checked-in">Đã tiếp nhận</option>
          <option value="in-progress">Đang thực hiện</option>
          <option value="waiting-parts">Chờ linh kiện</option>
          <option value="quality-check">Kiểm tra chất lượng</option>
          <option value="completed">Hoàn thành</option>
          <option value="ready-pickup">Sẵn sàng giao xe</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle List */}
        <div className="space-y-4">
          {filteredVehicles.map((vehicle) => (
            <MDCard 
              key={vehicle.id} 
              className={`p-4 cursor-pointer transition-all ${
                selectedVehicle?.id === vehicle.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {vehicle.vehicleBrand} {vehicle.vehicleModel}
                  </h3>
                  <p className="text-sm text-gray-600">{vehicle.licensePlate} - {vehicle.customerName}</p>
                  <p className="text-sm text-gray-500">{vehicle.serviceType}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.currentStatus)}`}>
                  {vehicle.currentStatus === 'checked-in' && 'Đã tiếp nhận'}
                  {vehicle.currentStatus === 'in-progress' && 'Đang thực hiện'}
                  {vehicle.currentStatus === 'waiting-parts' && 'Chờ linh kiện'}
                  {vehicle.currentStatus === 'quality-check' && 'Kiểm tra chất lượng'}
                  {vehicle.currentStatus === 'completed' && 'Hoàn thành'}
                  {vehicle.currentStatus === 'ready-pickup' && 'Sẵn sàng giao xe'}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600">Tiến độ</span>
                  <span className="text-sm font-medium">{vehicle.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${vehicle.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <User className="h-4 w-4 mr-2" />
                {vehicle.technicianName}
                <Clock className="h-4 w-4 ml-4 mr-2" />
                Dự kiến: {vehicle.estimatedCompletion.toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>

              {vehicle.issues.length > 0 && (
                <div className="flex items-center text-sm text-orange-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {vehicle.issues.length} vấn đề cần xử lý
                </div>
              )}
            </MDCard>
          ))}
        </div>

        {/* Vehicle Details */}
        {selectedVehicle && (
          <div className="space-y-4">
            <MDCard className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {selectedVehicle.vehicleBrand} {selectedVehicle.vehicleModel}
                  </h2>
                  <p className="text-gray-600">{selectedVehicle.licensePlate}</p>
                  <p className="text-sm text-gray-500">{selectedVehicle.serviceType}</p>
                </div>
                <MDButton
                  onClick={() => setShowUpdateModal(true)}
                  size="small"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Thêm cập nhật
                </MDButton>
              </div>

              {/* Status Controls */}
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Cập nhật trạng thái</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(['checked-in', 'in-progress', 'waiting-parts', 'quality-check', 'completed', 'ready-pickup'] as const).map((status) => (
                    <MDButton
                      key={status}
                      onClick={() => handleStatusUpdate(selectedVehicle.id, status)}
                      variant={selectedVehicle.currentStatus === status ? "filled" : "outlined"}
                      size="small"
                      className={selectedVehicle.currentStatus === status ? "bg-blue-500" : ""}
                    >
                      {status === 'checked-in' && 'Tiếp nhận'}
                      {status === 'in-progress' && 'Thực hiện'}
                      {status === 'waiting-parts' && 'Chờ linh kiện'}
                      {status === 'quality-check' && 'Kiểm tra'}
                      {status === 'completed' && 'Hoàn thành'}
                      {status === 'ready-pickup' && 'Giao xe'}
                    </MDButton>
                  ))}
                </div>
              </div>
            </MDCard>

            {/* Issues */}
            {selectedVehicle.issues.length > 0 && (
              <MDCard className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Vấn đề phát hiện</h3>
                <div className="space-y-3">
                  {selectedVehicle.issues.map((issue) => (
                    <div key={issue.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-gray-900">{issue.description}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIssueColor(issue.severity)}`}>
                          {issue.severity === 'critical' && 'Nghiêm trọng'}
                          {issue.severity === 'high' && 'Cao'}
                          {issue.severity === 'medium' && 'Trung bình'}
                          {issue.severity === 'low' && 'Thấp'}
                        </span>
                      </div>
                      {issue.estimatedCost && (
                        <p className="text-sm text-gray-600 mb-2">
                          Chi phí ước tính: {issue.estimatedCost.toLocaleString('vi-VN')}đ
                        </p>
                      )}
                      <div className="flex gap-2">
                        <MDButton
                          onClick={() => handleIssueStatusUpdate(selectedVehicle.id, issue.id, 'resolved')}
                          disabled={issue.status === 'resolved'}
                          size="small"
                          className="bg-green-500 hover:bg-green-600"
                        >
                          Đã xử lý
                        </MDButton>
                        {issue.status === 'requires-approval' && (
                          <MDButton
                            onClick={() => handleIssueStatusUpdate(selectedVehicle.id, issue.id, 'in-progress')}
                            size="small"
                            variant="outlined"
                          >
                            Tiến hành sửa
                          </MDButton>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </MDCard>
            )}

            {/* Updates Timeline */}
            <MDCard className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Lịch sử cập nhật</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {selectedVehicle.updates.reverse().map((update) => (
                  <div key={update.id} className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      update.type === 'success' ? 'bg-green-500' :
                      update.type === 'warning' ? 'bg-yellow-500' :
                      update.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{update.message}</p>
                      <p className="text-xs text-gray-500">
                        {update.technicianName} - {update.timestamp.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </MDCard>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thêm cập nhật</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Nhập thông tin cập nhật..."
              value={newUpdate}
              onChange={(e) => setNewUpdate(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <MDButton
                onClick={() => handleAddUpdate(selectedVehicle.id, newUpdate)}
                className="bg-blue-500 hover:bg-blue-600"
                size="small"
              >
                Thêm cập nhật
              </MDButton>
              <MDButton
                onClick={() => {
                  setShowUpdateModal(false);
                  setNewUpdate('');
                }}
                variant="outlined"
                size="small"
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

export default VehicleStatusTracker;