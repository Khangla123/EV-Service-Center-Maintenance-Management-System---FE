import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TaskStatus>('ASSIGNED'); // Default to ASSIGNED - tasks assigned but not started
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictTask, setConflictTask] = useState<Task | null>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 TechnicianTasks component mounted, loading tasks...');
    loadTasks();
    
    // Xử lý highlight task từ navigation state
    const state = location.state as { highlightTaskId?: string; message?: string } | null;
    if (state?.highlightTaskId) {
      setHighlightedTaskId(state.highlightTaskId);
      if (state.message) {
        alert(state.message);
      }
      // Clear state sau khi xử lý
      navigate(location.pathname, { replace: true, state: {} });
      
      // Auto scroll to highlighted task sau 500ms
      setTimeout(() => {
        const element = document.getElementById(`task-${state.highlightTaskId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
      
      // Remove highlight sau 3s
      setTimeout(() => setHighlightedTaskId(null), 3000);
    }
    
    // Cleanup function
    return () => {
      console.log('🔄 TechnicianTasks component unmounted');
    };
  }, []); // Empty dependency array - only run on mount

  // Lock/unlock body scroll khi modal mở/đóng
  useEffect(() => {
    if (showDetail || showConflictModal) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup - đảm bảo unlock khi component unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showDetail, showConflictModal]);

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
      
      // Convert appointments to tasks with checklist preview
      const convertedTasks: Task[] = await Promise.all(appointments.map(async (apt: Appointment) => {
        // Map status from backend format to display format
        let displayStatus: TaskStatus = apt.status;
        
        // Load checklist from service_order if appointment has service order
        let checklistPreview: { item: string; done: boolean }[] | undefined;
        if (apt.status === 'ASSIGNED' || apt.status === 'IN_PROGRESS') {
          try {
            const serviceOrderModule = await import('../../../services/serviceOrderService');
            const serviceOrder = await serviceOrderModule.default.getServiceOrderByAppointmentId(apt.id);
            if (serviceOrder.checklist) {
              const parsed = serviceOrderModule.default.parseChecklist(serviceOrder.checklist);
              if (parsed && parsed.items) {
                checklistPreview = parsed.items.slice(0, 5).map((item: any) => ({
                  item: item.title,
                  done: item.isCompleted || false
                }));
                console.log(`✓ Loaded checklist for ${apt.id.substring(0, 8)}: ${parsed.items.length} items`);
              }
            }
          } catch (error: any) {
            // Silently ignore 404 errors (service order not created yet)
            if (error?.response?.status !== 404) {
              console.warn('Could not load checklist for appointment:', apt.id, error);
            }
            // For 404, service order will be created when staff assigns the task
          }
        }
        
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
          notes: apt.notes,
          checklist: checklistPreview
        };
      }));
      
      console.log('✓ Converted tasks:', convertedTasks.length, 'tasks');
      console.log('Task statuses:', convertedTasks.map(t => t.status));
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
    
    // Kiểm tra xem có công việc nào đang IN_PROGRESS không
    const inProgressTask = tasks.find(t => t.status === 'IN_PROGRESS');
    
    if (inProgressTask) {
      console.log('⚠️ Found task in progress:', inProgressTask);
      setConflictTask(inProgressTask);
      setShowConflictModal(true);
      return;
    }
    
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
              {(() => {
                const notesText = selectedTask.notes || '';
                const servicesMatch = notesText.match(/📋 Các dịch vụ đã chọn \((\d+)\): (.+?)(?:\n|$)/);
                
                if (servicesMatch) {
                  const serviceCount = servicesMatch[1];
                  const servicesList = servicesMatch[2].split(', ').map(s => s.trim());
                  
                  return (
                    <div style={{
                      backgroundColor: '#f0f9ff',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        marginBottom: '12px',
                        color: '#0369a1',
                        fontWeight: '600'
                      }}>
                        📋 Các dịch vụ đã đặt ({serviceCount})
                      </div>
                      <ul style={{ 
                        listStyle: 'none', 
                        padding: 0, 
                        margin: 0 
                      }}>
                        {servicesList.map((serviceName, index) => (
                          <li key={index} style={{
                            padding: '10px 12px',
                            borderBottom: index < servicesList.length - 1 ? '1px dashed #bae6fd' : 'none',
                            color: '#0c4a6e',
                            fontSize: '14px'
                          }}>
                            <strong>{index + 1}.</strong> {serviceName}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                } else {
                  return (
                    <>
                      <p className="service-main">{selectedTask.service}</p>
                      <ul className="service-details">
                        {selectedTask.serviceDetails.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </>
                  );
                }
              })()}
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
            {selectedTask.status === 'CONFIRMED' && (
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
              Tasks: {tasks.length} | Filtered: {filteredTasks.length}
            </p>
          </div>
        ) : (
          (compact ? filteredTasks.slice(0, 5) : filteredTasks).map((task) => (
            <div 
              key={task.id} 
              id={`task-${task.id}`}
              className={`task-card ${task.status} ${highlightedTaskId === task.id ? 'highlighted' : ''}`}
            >
              <div className="task-row">
                <div className="task-meta">
                  <div className="task-id">{task.id}</div>
                  <div className="task-title">
                    {task.vehicle} - {task.licensePlate}
                  </div>
                  
                  {/* Parse and display all services from notes */}
                  {(() => {
                    const notesText = task.notes || '';
                    const servicesMatch = notesText.match(/📋 Các dịch vụ đã chọn \((\d+)\): (.+?)(?:\n|$)/);
                    
                    if (servicesMatch) {
                      const serviceCount = servicesMatch[1];
                      const servicesList = servicesMatch[2].split(', ').map(s => s.trim());
                      
                      return (
                        <div style={{
                          backgroundColor: '#f0f9ff',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          border: '1px solid #bae6fd',
                          marginTop: '8px'
                        }}>
                          <div style={{ 
                            fontSize: '13px',
                            color: '#0369a1',
                            fontWeight: '600',
                            marginBottom: '6px'
                          }}>
                            📋 Các dịch vụ ({serviceCount})
                          </div>
                          <div style={{ 
                            fontSize: '13px',
                            color: '#0c4a6e'
                          }}>
                            {servicesList.join(' • ')}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div style={{ marginTop: '4px', fontSize: '14px', color: '#333' }}>
                          — {task.service}
                        </div>
                      );
                    }
                  })()}
                  
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
                {(task.status === 'CONFIRMED' || task.status === 'ASSIGNED') && (
                  <button 
                    className="btn-start" 
                    onClick={() => handleStartTask(task)}
                    disabled={tasks.some(t => t.status === 'IN_PROGRESS')}
                    title={tasks.some(t => t.status === 'IN_PROGRESS') ? 'Bạn đang có công việc đang xử lý' : ''}
                  >
                    <Play size={16} />
                    Bắt đầu
                  </button>
                )}
                {task.status === 'IN_PROGRESS' && (
                  <button className="btn-process" onClick={() => navigate(`/technician/work-processing/${task.id}`)}>
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
      
      {/* Modal cảnh báo công việc đang xử lý */}
      {showConflictModal && conflictTask && (
        <div className="modal-overlay" onClick={() => setShowConflictModal(false)}>
          <div className="modal-content conflict-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowConflictModal(false)}>
              <X size={24} />
            </button>
            
            <div className="conflict-icon">
              <Wrench size={48} />
            </div>
            
            <h2 className="conflict-title">Bạn đang có công việc đang xử lý!</h2>
            
            <div className="conflict-current-work">
              <h3>Công việc hiện tại:</h3>
              <div className="conflict-work-info">
                <div className="info-row">
                  <span className="label">Xe:</span>
                  <span className="value">{conflictTask.vehicle} - {conflictTask.licensePlate}</span>
                </div>
                <div className="info-row">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{conflictTask.customer}</span>
                </div>
                <div className="info-row">
                  <span className="label">Dịch vụ:</span>
                  <span className="value">{conflictTask.service}</span>
                </div>
                {conflictTask.startedAt && (
                  <div className="info-row">
                    <span className="label">Bắt đầu:</span>
                    <span className="value">{conflictTask.startedAt}</span>
                  </div>
                )}
              </div>
            </div>
            
            <p className="conflict-message">
              Vui lòng hoàn thành công việc hiện tại trước khi bắt đầu công việc mới.
            </p>
            
            <div className="conflict-actions">
              <button 
                className="btn-secondary" 
                onClick={() => setShowConflictModal(false)}
              >
                Đóng
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setShowConflictModal(false);
                  navigate('/technician/work');
                }}
              >
                Tiếp tục công việc hiện tại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianTasks;
