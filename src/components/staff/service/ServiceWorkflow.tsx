import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, Play, Pause, 
  FileText, Wrench, User, Car, Package
} from 'lucide-react';
import { MDButton } from '../../ui';
import './ServiceWorkflow.css';

interface ServiceJob {
  id: string;
  vehicleModel: string;
  licensePlate: string;
  customerName: string;
  serviceType: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'on-hold';
  technicianName?: string;
  startTime?: Date;
  estimatedTime: number;
  elapsedTime?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  checklist: {
    item: string;
    completed: boolean;
  }[];
  parts?: {
    name: string;
    quantity: number;
    status: 'available' | 'ordered' | 'installing';
  }[];
  notes?: string;
}

const ServiceWorkflow: React.FC = () => {
  const [jobs, setJobs] = useState<ServiceJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockJobs: ServiceJob[] = [
      {
        id: 'job-001',
        vehicleModel: 'VinFast VF8',
        licensePlate: '30A-123.45',
        customerName: 'Nguyễn Văn A',
        serviceType: 'Bảo dưỡng định kỳ',
        status: 'waiting',
        priority: 'medium',
        estimatedTime: 120,
        checklist: [
          { item: 'Kiểm tra pin', completed: false },
          { item: 'Kiểm tra phanh', completed: false },
          { item: 'Kiểm tra lốp xe', completed: false },
          { item: 'Thay dầu phanh', completed: false }
        ],
        parts: [
          { name: 'Dầu phanh', quantity: 1, status: 'available' }
        ]
      },
      {
        id: 'job-002',
        vehicleModel: 'VinFast VF9',
        licensePlate: '30B-678.90',
        customerName: 'Trần Thị B',
        serviceType: 'Kiểm tra pin',
        status: 'in-progress',
        technicianName: 'Trần Văn B',
        startTime: new Date(Date.now() - 45 * 60000),
        estimatedTime: 90,
        elapsedTime: 45,
        priority: 'high',
        checklist: [
          { item: 'Kiểm tra điện áp pin', completed: true },
          { item: 'Kiểm tra dung lượng pin', completed: true },
          { item: 'Kiểm tra hệ thống làm mát', completed: false },
          { item: 'Cập nhật phần mềm BMS', completed: false }
        ],
        parts: []
      },
      {
        id: 'job-003',
        vehicleModel: 'VinFast VF5',
        licensePlate: '51F-111.11',
        customerName: 'Lê Văn C',
        serviceType: 'Sửa chữa khẩn cấp',
        status: 'in-progress',
        technicianName: 'Phạm Văn D',
        startTime: new Date(Date.now() - 30 * 60000),
        estimatedTime: 60,
        elapsedTime: 30,
        priority: 'urgent',
        checklist: [
          { item: 'Chẩn đoán lỗi', completed: true },
          { item: 'Thay relay điều hòa', completed: false },
          { item: 'Test hệ thống', completed: false }
        ],
        parts: [
          { name: 'Relay điều hòa', quantity: 1, status: 'installing' }
        ],
        notes: 'Lỗi hệ thống điều hòa - cần xử lý khẩn cấp'
      },
      {
        id: 'job-004',
        vehicleModel: 'VinFast VF8',
        licensePlate: '29B-222.22',
        customerName: 'Phạm Thị D',
        serviceType: 'Thay lốp xe',
        status: 'completed',
        technicianName: 'Trần Văn B',
        startTime: new Date(Date.now() - 90 * 60000),
        estimatedTime: 60,
        elapsedTime: 55,
        priority: 'low',
        checklist: [
          { item: 'Tháo lốp cũ', completed: true },
          { item: 'Lắp lốp mới', completed: true },
          { item: 'Cân bằng lốp', completed: true },
          { item: 'Kiểm tra áp suất', completed: true }
        ],
        parts: [
          { name: 'Lốp xe 255/45R20', quantity: 4, status: 'available' }
        ]
      }
    ];

    setJobs(mockJobs);
    setLoading(false);
  };

  const getPriorityColor = (priority: ServiceJob['priority']) => {
    const colors = {
      low: '#10b981',
      medium: '#3b82f6',
      high: '#f59e0b',
      urgent: '#ef4444'
    };
    return colors[priority];
  };

  const getPriorityLabel = (priority: ServiceJob['priority']) => {
    const labels = {
      low: 'Thấp',
      medium: 'Trung bình',
      high: 'Cao',
      urgent: 'Khẩn cấp'
    };
    return labels[priority];
  };

  const getStatusLabel = (status: ServiceJob['status']) => {
    const labels = {
      waiting: 'Đang chờ',
      'in-progress': 'Đang xử lý',
      completed: 'Hoàn thành',
      'on-hold': 'Tạm dừng'
    };
    return labels[status];
  };

  const viewJobDetails = (job: ServiceJob) => {
    setSelectedJob(job);
    setShowDetails(true);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedJob(null);
  };

  const calculateProgress = (checklist: ServiceJob['checklist']) => {
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  if (loading) {
    return (
      <div className="service-workflow loading">
        <div className="loading-spinner">Đang tải quy trình bảo dưỡng...</div>
      </div>
    );
  }

  return (
    <div className="service-workflow">
      {/* Statistics */}
      <div className="workflow-stats">
        <div className="stat-box waiting">
          <div className="stat-icon"><Clock /></div>
          <div className="stat-content">
            <div className="stat-value">{jobs.filter(j => j.status === 'waiting').length}</div>
            <div className="stat-label">Đang chờ</div>
          </div>
        </div>
        <div className="stat-box in-progress">
          <div className="stat-icon"><Wrench /></div>
          <div className="stat-content">
            <div className="stat-value">{jobs.filter(j => j.status === 'in-progress').length}</div>
            <div className="stat-label">Đang xử lý</div>
          </div>
        </div>
        <div className="stat-box completed">
          <div className="stat-icon"><CheckCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{jobs.filter(j => j.status === 'completed').length}</div>
            <div className="stat-label">Hoàn thành</div>
          </div>
        </div>
        <div className="stat-box on-hold">
          <div className="stat-icon"><Pause /></div>
          <div className="stat-content">
            <div className="stat-value">{jobs.filter(j => j.status === 'on-hold').length}</div>
            <div className="stat-label">Tạm dừng</div>
          </div>
        </div>
      </div>

      {/* Service Columns */}
      <div className="service-columns">
        {/* Waiting */}
        <div className="service-column waiting">
          <div className="column-header">
            <h3>Đang chờ</h3>
            <span className="count">{jobs.filter(j => j.status === 'waiting').length}</span>
          </div>
          <div className="job-list">
            {jobs.filter(j => j.status === 'waiting').map(job => (
              <div key={job.id} className="job-card" onClick={() => viewJobDetails(job)}>
                <div className="job-header">
                  <span className="job-id">#{job.id}</span>
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(job.priority) }}
                  >
                    {getPriorityLabel(job.priority)}
                  </span>
                </div>
                <div className="job-vehicle">
                  <Car size={16} />
                  <span>{job.vehicleModel}</span>
                </div>
                <div className="job-plate">{job.licensePlate}</div>
                <div className="job-service">{job.serviceType}</div>
                <div className="job-customer">
                  <User size={14} />
                  <span>{job.customerName}</span>
                </div>
                <div className="job-time">
                  <Clock size={14} />
                  <span>Ước tính: {job.estimatedTime} phút</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="service-column in-progress">
          <div className="column-header">
            <h3>Đang xử lý</h3>
            <span className="count">{jobs.filter(j => j.status === 'in-progress').length}</span>
          </div>
          <div className="job-list">
            {jobs.filter(j => j.status === 'in-progress').map(job => (
              <div key={job.id} className="job-card" onClick={() => viewJobDetails(job)}>
                <div className="job-header">
                  <span className="job-id">#{job.id}</span>
                  <span 
                    className="priority-badge" 
                    style={{ backgroundColor: getPriorityColor(job.priority) }}
                  >
                    {getPriorityLabel(job.priority)}
                  </span>
                </div>
                <div className="job-vehicle">
                  <Car size={16} />
                  <span>{job.vehicleModel}</span>
                </div>
                <div className="job-plate">{job.licensePlate}</div>
                <div className="job-service">{job.serviceType}</div>
                <div className="job-technician">
                  <Wrench size={14} />
                  <span>{job.technicianName}</span>
                </div>
                <div className="job-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateProgress(job.checklist)}%` }}
                    />
                  </div>
                  <span className="progress-text">{calculateProgress(job.checklist)}%</span>
                </div>
                <div className="job-time">
                  <Clock size={14} />
                  <span>{job.elapsedTime}/{job.estimatedTime} phút</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed */}
        <div className="service-column completed">
          <div className="column-header">
            <h3>Hoàn thành</h3>
            <span className="count">{jobs.filter(j => j.status === 'completed').length}</span>
          </div>
          <div className="job-list">
            {jobs.filter(j => j.status === 'completed').map(job => (
              <div key={job.id} className="job-card" onClick={() => viewJobDetails(job)}>
                <div className="job-header">
                  <span className="job-id">#{job.id}</span>
                  <CheckCircle size={20} className="completed-icon" />
                </div>
                <div className="job-vehicle">
                  <Car size={16} />
                  <span>{job.vehicleModel}</span>
                </div>
                <div className="job-plate">{job.licensePlate}</div>
                <div className="job-service">{job.serviceType}</div>
                <div className="job-technician">
                  <Wrench size={14} />
                  <span>{job.technicianName}</span>
                </div>
                <div className="job-time completed-time">
                  ✓ Hoàn thành trong {job.elapsedTime} phút
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      {showDetails && selectedJob && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết Công việc - #{selectedJob.id}</h3>
              <button className="close-btn" onClick={closeDetails}>×</button>
            </div>
            <div className="modal-body">
              <div className="job-details">
                {/* Basic Info */}
                <div className="details-section">
                  <h4>Thông tin cơ bản</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <strong>Xe:</strong>
                      <span>{selectedJob.vehicleModel} - {selectedJob.licensePlate}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Khách hàng:</strong>
                      <span>{selectedJob.customerName}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Dịch vụ:</strong>
                      <span>{selectedJob.serviceType}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Trạng thái:</strong>
                      <span className="status-text">{getStatusLabel(selectedJob.status)}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Ưu tiên:</strong>
                      <span 
                        className="priority-text"
                        style={{ color: getPriorityColor(selectedJob.priority) }}
                      >
                        {getPriorityLabel(selectedJob.priority)}
                      </span>
                    </div>
                    {selectedJob.technicianName && (
                      <div className="detail-item">
                        <strong>Kỹ thuật viên:</strong>
                        <span>{selectedJob.technicianName}</span>
                      </div>
                    )}
                  </div>
                  {selectedJob.notes && (
                    <div className="notes-box">
                      <strong>Ghi chú:</strong>
                      <p>{selectedJob.notes}</p>
                    </div>
                  )}
                </div>

                {/* Checklist */}
                <div className="details-section">
                  <h4>Danh sách Kiểm tra ({selectedJob.checklist.filter(c => c.completed).length}/{selectedJob.checklist.length})</h4>
                  <div className="checklist">
                    {selectedJob.checklist.map((item, index) => (
                      <div key={index} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                        <div className="checkbox">
                          {item.completed && <CheckCircle size={18} />}
                        </div>
                        <span>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Parts */}
                {selectedJob.parts && selectedJob.parts.length > 0 && (
                  <div className="details-section">
                    <h4>Phụ tùng sử dụng</h4>
                    <div className="parts-list">
                      {selectedJob.parts.map((part, index) => (
                        <div key={index} className="part-item">
                          <Package size={16} />
                          <span className="part-name">{part.name}</span>
                          <span className="part-quantity">x{part.quantity}</span>
                          <span className={`part-status ${part.status}`}>
                            {part.status === 'available' && 'Sẵn có'}
                            {part.status === 'ordered' && 'Đã đặt'}
                            {part.status === 'installing' && 'Đang lắp'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="details-actions">
                  {selectedJob.status === 'waiting' && (
                    <MDButton variant="filled" startIcon={<Play />}>
                      Bắt đầu công việc
                    </MDButton>
                  )}
                  {selectedJob.status === 'in-progress' && (
                    <>
                      <MDButton variant="outlined" startIcon={<Pause />}>
                        Tạm dừng
                      </MDButton>
                      <MDButton variant="filled" startIcon={<CheckCircle />}>
                        Hoàn thành
                      </MDButton>
                    </>
                  )}
                  {selectedJob.status === 'completed' && (
                    <MDButton variant="filled" startIcon={<FileText />}>
                      Tạo hóa đơn
                    </MDButton>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceWorkflow;
