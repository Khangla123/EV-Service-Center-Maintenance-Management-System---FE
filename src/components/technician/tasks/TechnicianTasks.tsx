import React, { useState } from 'react';
import { Search, Filter, Clock, CheckCircle, Eye, Play, X } from 'lucide-react';
import './TechnicianTasks.css';

type TaskStatus = 'pending' | 'in-progress' | 'done';
type Priority = 'Low' | 'Normal' | 'High' | 'Critical';

type Task = {
  id: string;
  vehicle: string;
  vehicleModel: string;
  licensePlate: string;
  customer: string;
  customerPhone: string;
  service: string;
  serviceDetails: string[];
  priority: Priority;
  status: TaskStatus;
  assignedDate: string;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: string;
  rating?: number;
  notes?: string;
  checklist?: { item: string; done: boolean }[];
};

const mockTasks: Task[] = [
  {
    id: 'T-1001',
    vehicle: 'VinFast VF8',
    vehicleModel: 'VF8 Eco',
    licensePlate: 'XV123',
    customer: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    service: 'Kiểm tra pin & bảo dưỡng định kỳ',
    serviceDetails: ['Kiểm tra dung lượng pin', 'Kiểm tra sức khỏe pin', 'Bảo dưỡng hệ thống làm mát'],
    priority: 'High',
    status: 'pending',
    assignedDate: '2025-10-16 08:00',
    checklist: [
      { item: 'Kiểm tra pin (dung lượng, sức khỏe)', done: false },
      { item: 'Kiểm tra động cơ điện', done: false },
      { item: 'Kiểm tra hệ thống điện', done: false }
    ]
  },
  {
    id: 'T-1002',
    vehicle: 'VinFast VF9',
    vehicleModel: 'VF9 Plus',
    licensePlate: 'VF456',
    customer: 'Trần Thị B',
    customerPhone: '0912345678',
    service: 'Sửa hệ thống phanh',
    serviceDetails: ['Thay má phanh trước', 'Kiểm tra dầu phanh', 'Test hệ thống ABS'],
    priority: 'Critical',
    status: 'in-progress',
    assignedDate: '2025-10-16 09:00',
    startedAt: '2025-10-16 09:15',
    timeSpent: '00:45',
    checklist: [
      { item: 'Kiểm tra pin (dung lượng, sức khỏe)', done: true },
      { item: 'Kiểm tra động cơ điện', done: true },
      { item: 'Kiểm tra hệ thống điện', done: false },
      { item: 'Kiểm tra phanh, lốp, đèn', done: false }
    ]
  },
  {
    id: 'T-1003',
    vehicle: 'VinFast VF8',
    vehicleModel: 'VF8 Plus',
    licensePlate: 'AB789',
    customer: 'Lê Văn C',
    customerPhone: '0923456789',
    service: 'Cập nhật phần mềm ECU',
    serviceDetails: ['Cập nhật firmware ECU', 'Kiểm tra hệ thống sau update', 'Test drive'],
    priority: 'Normal',
    status: 'done',
    assignedDate: '2025-10-15 10:00',
    startedAt: '2025-10-15 10:30',
    completedAt: '2025-10-15 11:45',
    timeSpent: '01:15',
    rating: 5,
    notes: 'Khách hàng hài lòng. Xe chạy êm hơn sau update.'
  },
  {
    id: 'T-1004',
    vehicle: 'VinFast VF8',
    vehicleModel: 'VF8 Eco',
    licensePlate: 'CD321',
    customer: 'Phạm Thị D',
    customerPhone: '0934567890',
    service: 'Thay lốp xe',
    serviceDetails: ['Thay 4 lốp mới', 'Cân bằng lốp', 'Kiểm tra áp suất'],
    priority: 'Normal',
    status: 'pending',
    assignedDate: '2025-10-16 10:30'
  },
  {
    id: 'T-1005',
    vehicle: 'VinFast VF9',
    vehicleModel: 'VF9 Eco',
    licensePlate: 'EF654',
    customer: 'Hoàng Văn E',
    customerPhone: '0945678901',
    service: 'Bảo dưỡng 10,000 km',
    serviceDetails: ['Kiểm tra tổng thể', 'Thay dầu phanh', 'Kiểm tra hệ thống treo'],
    priority: 'Low',
    status: 'done',
    assignedDate: '2025-10-14 14:00',
    startedAt: '2025-10-14 14:20',
    completedAt: '2025-10-14 16:00',
    timeSpent: '01:40',
    rating: 4,
    notes: 'Hoàn thành tốt.'
  }
];

interface TechnicianTasksProps {
  compact?: boolean;
}

const TechnicianTasks: React.FC<TechnicianTasksProps> = ({ compact = false }) => {
  const [activeTab, setActiveTab] = useState<TaskStatus>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filteredTasks = mockTasks.filter(task => {
    const matchStatus = task.status === activeTab;
    const matchSearch = 
      task.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchStatus && matchSearch && matchPriority;
  });

  const getStatusStats = (status: TaskStatus) => {
    return mockTasks.filter(t => t.status === status).length;
  };

  const handleStartTask = (task: Task) => {
    console.log('Starting task:', task.id);
    // Logic to start task
  };

  const handleViewDetail = (task: Task) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      Critical: 'critical',
      High: 'high',
      Normal: 'normal',
      Low: 'low'
    };
    return colors[priority];
  };

  const renderDetailModal = () => {
    if (!selectedTask) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowDetail(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Chi tiết công việc - {selectedTask.id}</h3>
            <button className="close-btn" onClick={() => setShowDetail(false)}>
              <X size={20} />
            </button>
          </div>

          <div className="modal-body">
            <div className="detail-section">
              <h4>Thông tin xe</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Loại xe:</span>
                  <span className="value">{selectedTask.vehicle} - {selectedTask.vehicleModel}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Biển số:</span>
                  <span className="value">{selectedTask.licensePlate}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Thông tin khách hàng</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Tên:</span>
                  <span className="value">{selectedTask.customer}</span>
                </div>
                <div className="detail-item">
                  <span className="label">SĐT:</span>
                  <span className="value">{selectedTask.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Dịch vụ yêu cầu</h4>
              <p className="service-main">{selectedTask.service}</p>
              <ul className="service-details">
                {selectedTask.serviceDetails.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>

            {selectedTask.checklist && (
              <div className="detail-section">
                <h4>Checklist công việc</h4>
                <ul className="checklist-modal">
                  {selectedTask.checklist.map((item, idx) => (
                    <li key={idx} className={item.done ? 'done' : ''}>
                      <CheckCircle size={16} />
                      <span>{item.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detail-section">
              <h4>Thông tin thời gian</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Phân công:</span>
                  <span className="value">{selectedTask.assignedDate}</span>
                </div>
                {selectedTask.startedAt && (
                  <div className="detail-item">
                    <span className="label">Bắt đầu:</span>
                    <span className="value">{selectedTask.startedAt}</span>
                  </div>
                )}
                {selectedTask.completedAt && (
                  <div className="detail-item">
                    <span className="label">Hoàn thành:</span>
                    <span className="value">{selectedTask.completedAt}</span>
                  </div>
                )}
                {selectedTask.timeSpent && (
                  <div className="detail-item">
                    <span className="label">Thời gian:</span>
                    <span className="value">{selectedTask.timeSpent}</span>
                  </div>
                )}
              </div>
            </div>

            {selectedTask.rating && (
              <div className="detail-section">
                <h4>Đánh giá</h4>
                <div className="rating-display">
                  {'⭐'.repeat(selectedTask.rating)} ({selectedTask.rating}/5)
                </div>
              </div>
            )}

            {selectedTask.notes && (
              <div className="detail-section">
                <h4>Ghi chú</h4>
                <p className="notes">{selectedTask.notes}</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            {selectedTask.status === 'pending' && (
              <button className="btn-start" onClick={() => handleStartTask(selectedTask)}>
                <Play size={16} />
                Bắt đầu công việc
              </button>
            )}
            <button className="btn-close" onClick={() => setShowDetail(false)}>Đóng</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`tech-tasks ${compact ? 'compact' : ''}`}>
      {!compact && (
        <>
          <div className="tasks-header">
            <h3>Danh sách Công việc</h3>
            <div className="header-actions">
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Tìm xe, khách hàng, mã công việc..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-box">
                <Filter size={16} />
                <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}>
                  <option value="all">Tất cả độ ưu tiên</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Normal">Normal</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <Clock size={16} />
              Chờ xử lý ({getStatusStats('pending')})
            </button>
            <button
              className={`tab ${activeTab === 'in-progress' ? 'active' : ''}`}
              onClick={() => setActiveTab('in-progress')}
            >
              <Play size={16} />
              Đang thực hiện ({getStatusStats('in-progress')})
            </button>
            <button
              className={`tab ${activeTab === 'done' ? 'active' : ''}`}
              onClick={() => setActiveTab('done')}
            >
              <CheckCircle size={16} />
              Đã hoàn thành ({getStatusStats('done')})
            </button>
          </div>
        </>
      )}

      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>Không có công việc nào</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className={`task-card ${task.status}`}>
              <div className="task-row">
                <div className="task-meta">
                  <div className="task-id">{task.id}</div>
                  <div className="task-title">
                    {task.vehicle} - {task.licensePlate} — {task.service}
                  </div>
                  <div className="task-customer">Khách: {task.customer} • {task.customerPhone}</div>
                </div>
                <div className="task-right">
                  <div className={`priority ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                </div>
              </div>

              {task.status === 'in-progress' && task.timeSpent && (
                <div className="progress-info">
                  <Clock size={14} />
                  <span>Đã làm: {task.timeSpent}</span>
                  {task.checklist && (
                    <span className="checklist-progress">
                      • Checklist: {task.checklist.filter(c => c.done).length}/{task.checklist.length}
                    </span>
                  )}
                </div>
              )}

              {task.status === 'done' && (
                <div className="done-info">
                  <CheckCircle size={14} />
                  <span>Hoàn thành • Thời gian: {task.timeSpent}</span>
                  {task.rating && <span> • Đánh giá: {task.rating}/5 ⭐</span>}
                </div>
              )}

              <div className="task-actions">
                <button className="btn-view" onClick={() => handleViewDetail(task)}>
                  <Eye size={16} />
                  Xem chi tiết
                </button>
                {task.status === 'pending' && (
                  <button className="btn-start" onClick={() => handleStartTask(task)}>
                    <Play size={16} />
                    Bắt đầu
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showDetail && renderDetailModal()}
    </div>
  );
};

export default TechnicianTasks;
