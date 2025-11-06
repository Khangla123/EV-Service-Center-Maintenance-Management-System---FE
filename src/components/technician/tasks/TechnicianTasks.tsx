import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, CheckCircle, Eye, Play, X, Wrench } from 'lucide-react';
import './TechnicianTasks.css';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import staffService from '../../../services/staffService';

type TaskStatus = 'PENDING' | 'CONFIRMED' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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

interface TechnicianTasksProps {
  compact?: boolean;
}

const TechnicianTasks: React.FC<TechnicianTasksProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TaskStatus>('ASSIGNED'); // Default to ASSIGNED to show assigned tasks
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 TechnicianTasks component mounted, loading tasks...');
    loadTasks();
    
    // Cleanup function
    return () => {
      console.log('🔄 TechnicianTasks component unmounted');
    };
  }, []); // Empty dependency array - only run on mount

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('=== Starting loadTasks ===');
      
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      console.log('User from localStorage:', userStr);
      
      if (!userStr) {
        console.error('❌ No user found in localStorage');
        setError('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
        setTasks([]);
        return;
      }
      
      const user = JSON.parse(userStr);
      console.log('✓ Parsed user:', user);
      
      // Get staff ID by finding staff with matching userId
      console.log('Fetching all staff...');
      const allStaff = await staffService.getAllStaff();
      console.log('✓ Received staff list:', allStaff.length, 'staff members');
      
      const myStaff = allStaff.find(s => s.userId === user.id);
      
      if (!myStaff) {
        console.error('❌ Staff not found for userId:', user.id);
        console.log('Available staff userIds:', allStaff.map(s => s.userId));
        setError('Không tìm thấy thông tin kỹ thuật viên.');
        setTasks([]);
        return;
      }
      
      console.log('✓ Found my staff:', myStaff);
      const staffId = myStaff.id;
      
      // Load appointments assigned to this technician
      console.log('Fetching appointments for staffId:', staffId);
      const appointments = await appointmentService.getMyTasks(staffId);
      console.log('✓ Received appointments:', appointments.length, 'items');
      
      // 🧪 TEMPORARY: Add mock data for testing if no real data
      // DISABLED for now since we have real data
      if (false && appointments.length === 0) {
        console.log('⚠️ No appointments found, adding mock data for testing...');
        const mockAppointments = [
          {
            id: 'mock-apt-1',
            customerId: 'mock-customer-1',
            customerName: 'Nguyễn Văn Test',
            customerPhone: '0123456789',
            vehicleId: 'mock-vehicle-1',
            vehicleLicensePlate: '30A-12345',
            vehicleModel: 'VinFast VF8',
            serviceCenterId: 'mock-center-1',
            serviceCenterName: 'Trung tâm VinFast Hà Nội',
            servicePackageId: 'mock-package-1',
            servicePackageName: 'Bảo dưỡng định kỳ',
            technicianId: staffId,
            technicianName: user.fullName,
            appointmentDate: new Date(),
            status: 'ASSIGNED' as const,
            notes: 'Khách hàng yêu cầu kiểm tra kỹ hệ thống phanh',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: 'mock-apt-2',
            customerId: 'mock-customer-2',
            customerName: 'Trần Thị Demo',
            customerPhone: '0987654321',
            vehicleId: 'mock-vehicle-2',
            vehicleLicensePlate: '30B-67890',
            vehicleModel: 'VinFast VF9',
            serviceCenterId: 'mock-center-1',
            serviceCenterName: 'Trung tâm VinFast Hà Nội',
            servicePackageId: 'mock-package-2',
            servicePackageName: 'Sửa chữa hệ thống điện',
            technicianId: staffId,
            technicianName: user.fullName,
            appointmentDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'IN_PROGRESS' as const,
            notes: 'Đang thay thế module điều khiển',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ];
        appointments.push(...mockAppointments);
        console.log('✓ Added mock appointments:', mockAppointments.length, 'items');
      }
      
      // 🧪 TEMPORARY: Force add ASSIGNED appointment if none exist
      // DISABLED for now since we'll update real data
      const hasAssignedTasks = appointments.some(apt => apt.status === 'ASSIGNED');
      if (false && !hasAssignedTasks) {
        console.log('⚠️ No ASSIGNED tasks found, adding test ASSIGNED task...');
        const assignedAppointment = {
          id: 'test-assigned-1',
          customerId: 'test-customer-1',
          customerName: 'Khách hàng Test',
          customerPhone: '0999888777',
          vehicleId: 'test-vehicle-1',
          vehicleLicensePlate: '29A-99999',
          vehicleModel: 'VinFast VF8 Pro',
          serviceCenterId: 'test-center-1',
          serviceCenterName: 'Trung tâm Test',
          servicePackageId: 'test-package-1',
          servicePackageName: 'Kiểm tra tổng quát',
          technicianId: staffId,
          technicianName: user.fullName,
          appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          status: 'ASSIGNED' as const,
          notes: 'Task test cho tab Đã phân công',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        appointments.push(assignedAppointment);
        console.log('✓ Added test ASSIGNED appointment');
      }
      
      // Convert appointments to tasks
      const convertedTasks: Task[] = appointments.map((apt: Appointment) => {
        // Map status from backend format to display format
        let displayStatus: TaskStatus = apt.status;
        
        return {
          id: apt.id,
          vehicle: apt.vehicleModel || 'N/A',
          vehicleModel: apt.vehicleModel || 'N/A',
          licensePlate: apt.vehicleLicensePlate || 'N/A',
          customer: apt.customerName || 'N/A',
          customerPhone: apt.customerPhone || 'N/A',
          service: apt.servicePackageName || 'N/A',
          serviceDetails: apt.notes ? [apt.notes] : [],
          priority: 'Normal' as Priority, // TODO: Add priority to appointment
          status: displayStatus,
          assignedDate: apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleString('vi-VN') : 'N/A',
          startedAt: apt.status === 'IN_PROGRESS' ? new Date(apt.appointmentDate).toLocaleString('vi-VN') : undefined,
          completedAt: apt.actualCompletion ? new Date(apt.actualCompletion).toLocaleString('vi-VN') : undefined,
          notes: apt.notes
        };
      });
      
      console.log('✓ Converted tasks:', convertedTasks.length, 'tasks');
      console.log('Task statuses:', convertedTasks.map(t => t.status));
      
      // Auto-select tab based on available data
      if (convertedTasks.length > 0 && !compact) {
        const statuses = convertedTasks.map(t => t.status);
        if (statuses.includes('ASSIGNED')) {
          setActiveTab('ASSIGNED');
        } else if (statuses.includes('IN_PROGRESS')) {
          setActiveTab('IN_PROGRESS');
        } else if (statuses.includes('COMPLETED')) {
          setActiveTab('COMPLETED');
        }
        console.log('✓ Auto-selected tab based on available data');
      }
      
      setTasks(convertedTasks);
      console.log('=== loadTasks completed successfully ===');
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        setError('Không thể tải danh sách công việc: ' + error.message);
      } else {
        setError('Không thể tải danh sách công việc.');
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(task => {
    // In compact mode, show all tasks (no status filter)
    const matchStatus = compact ? true : task.status === activeTab;
    const matchSearch = 
      task.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    console.log(`🔍 Filter debug - Task ${task.id}:`, {
      status: task.status,
      activeTab,
      matchStatus,
      matchSearch,
      matchPriority,
      compact,
      willShow: matchStatus && matchSearch && matchPriority
    });
    
    return matchStatus && matchSearch && matchPriority;
  });

  // Debug log for compact mode
  if (compact) {
    console.log('🔍 COMPACT MODE DEBUG:');
    console.log('  Total tasks:', tasks.length);
    console.log('  Filtered tasks:', filteredTasks.length);
    console.log('  Tasks to display:', compact ? filteredTasks.slice(0, 5).length : filteredTasks.length);
  }

  const getStatusStats = (status: TaskStatus) => {
    return tasks.filter(t => t.status === status).length;
  };

  const handleStartTask = async (task: Task) => {
    console.log('🔄 Attempting to start task:', task);
    console.log('Task status:', task.status);
    
    if (!window.confirm(`Bắt đầu công việc: ${task.vehicle} - ${task.licensePlate}?`)) {
      return;
    }

    try {
      console.log('🔄 Starting task:', task.id);
      
      // Call API endpoint /appointments/{id}/start to change from ASSIGNED to IN_PROGRESS
      await appointmentService.startAppointment(task.id);
      
      console.log('✓ Task started successfully');
      
      // Reload tasks to update UI
      await loadTasks();
      
      // Redirect to work processing page
      navigate('/technician/work');
    } catch (error) {
      console.error('❌ Error starting task:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        response: (error as any)?.response?.data,
        status: (error as any)?.response?.status
      });
      
      let errorMessage = 'Không thể bắt đầu công việc';
      if ((error as any)?.response?.data?.message) {
        errorMessage += ': ' + (error as any)?.response?.data?.message;
      } else if ((error as any)?.message) {
        errorMessage += ': ' + (error as any)?.message;
      }
      
      alert(errorMessage);
    }
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
            {selectedTask.status === 'ASSIGNED' && (
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
      {compact && (
        <div className="compact-header">
          <h4>Công việc gần đây</h4>
          <span className="task-count">{tasks.length} công việc</span>
        </div>
      )}
      
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
              className={`tab ${activeTab === 'ASSIGNED' ? 'active' : ''}`}
              onClick={() => setActiveTab('ASSIGNED')}
            >
              <Clock size={16} />
              Đã phân công ({getStatusStats('ASSIGNED')})
            </button>
            <button
              className={`tab ${activeTab === 'IN_PROGRESS' ? 'active' : ''}`}
              onClick={() => setActiveTab('IN_PROGRESS')}
            >
              <Play size={16} />
              Đang thực hiện ({getStatusStats('IN_PROGRESS')})
            </button>
            <button
              className={`tab ${activeTab === 'COMPLETED' ? 'active' : ''}`}
              onClick={() => setActiveTab('COMPLETED')}
            >
              <CheckCircle size={16} />
              Đã hoàn thành ({getStatusStats('COMPLETED')})
            </button>
          </div>
        </>
      )}

      <div className="task-list">
        {loading ? (
          <div className="loading-state">
            <p>Đang tải danh sách công việc...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p style={{color: 'red', fontWeight: 'bold'}}>❌ {error}</p>
            <button onClick={loadTasks} style={{marginTop: '10px', padding: '8px 16px', cursor: 'pointer'}}>
              Thử lại
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>Không có công việc nào</p>
            <p style={{fontSize: '14px', color: '#666', marginTop: '8px'}}>
              Tasks: {tasks.length} | Filtered: {filteredTasks.length} | Active Tab: {activeTab}
            </p>
            <p style={{fontSize: '12px', color: '#999', marginTop: '4px'}}>
              Statuses: {tasks.map(t => t.status).join(', ')}
            </p>
          </div>
        ) : (
          (compact ? filteredTasks.slice(0, 5) : filteredTasks).map((task) => (
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

              {task.status === 'IN_PROGRESS' && task.timeSpent && (
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

              {task.status === 'COMPLETED' && (
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
                {task.status === 'ASSIGNED' && (
                  <button className="btn-start" onClick={() => handleStartTask(task)}>
                    <Play size={16} />
                    Bắt đầu
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button className="btn-process" onClick={() => navigate('/technician/work')}>
                    <Wrench size={16} />
                    Xử lý công việc
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
