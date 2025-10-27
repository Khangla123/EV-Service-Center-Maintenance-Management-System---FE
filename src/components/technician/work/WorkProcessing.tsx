import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Upload, Plus, Trash2, Clock, AlertCircle, CheckCircle2, X, Package } from 'lucide-react';
import './WorkProcessing.css';
import appointmentService, { Appointment } from '../../../services/appointmentService';

type ChecklistItem = {
  id: number;
  title: string;
  done: boolean;
};

type Issue = {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  images: File[];
};

type PartUsed = {
  id: string;
  partCode: string;
  partName: string;
  quantity: number;
  unit: string;
};

type ServiceSuggestion = {
  service: string;
  reason: string;
  estimatedCost: string;
};

const WorkProcessing: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState('00:00');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: 1, title: 'Kiểm tra pin (dung lượng, sức khỏe)', done: true },
    { id: 2, title: 'Kiểm tra động cơ điện', done: true },
    { id: 3, title: 'Kiểm tra hệ thống điện', done: false },
    { id: 4, title: 'Kiểm tra phanh, lốp, đèn', done: false }
  ]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [newIssue, setNewIssue] = useState({ description: '', severity: 'medium' as const });
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [showPartForm, setShowPartForm] = useState(false);
  const [newPart, setNewPart] = useState({ partCode: '', partName: '', quantity: 1, unit: 'cái' });
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestion, setSuggestion] = useState<ServiceSuggestion>({ service: '', reason: '', estimatedCost: '' });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');

  // Load appointments for current technician
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        console.log('🔄 Loading appointments for work processing...');
        
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          console.error('❌ No user found');
          navigate('/login');
          return;
        }
        
        const user = JSON.parse(userStr);
        
        // Get staff info
        const staffService = await import('../../../services/staffService');
        const allStaff = await staffService.default.getAllStaff();
        const myStaff = allStaff.find(s => s.userId === user.id);
        
        if (!myStaff) {
          console.error('❌ Staff not found');
          return;
        }
        
        // Load all appointments
        const allAppointments = await appointmentService.getMyTasks(myStaff.id);
        console.log('✓ Loaded appointments:', allAppointments);
        
        // Filter only IN_PROGRESS appointments (đang xử lý thực sự)
        const inProgressAppts = allAppointments.filter(
          apt => apt.status === 'IN_PROGRESS'
        );
        console.log('✓ In-progress appointments:', inProgressAppts.length);
        
        setAppointments(inProgressAppts);
        
        // If appointmentId provided, select that one
        if (appointmentId) {
          const selected = inProgressAppts.find(apt => apt.id === appointmentId);
          if (selected) {
            setSelectedAppointment(selected);
            setAppointment(selected);
            initializeChecklist(selected);
          }
        } else if (inProgressAppts.length > 0) {
          // Auto-select first appointment
          setSelectedAppointment(inProgressAppts[0]);
          setAppointment(inProgressAppts[0]);
          initializeChecklist(inProgressAppts[0]);
        }
        
      } catch (error) {
        console.error('❌ Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [appointmentId, navigate]);

  const initializeChecklist = (appt: Appointment) => {
    if (appt.servicePackageName?.includes('Bảo dưỡng')) {
      setChecklist([
        { id: 1, title: 'Kiểm tra pin (dung lượng, sức khỏe)', done: false },
        { id: 2, title: 'Kiểm tra động cơ điện', done: false },
        { id: 3, title: 'Kiểm tra hệ thống điện', done: false },
        { id: 4, title: 'Kiểm tra phanh, lốp, đèn', done: false },
        { id: 5, title: 'Kiểm tra hệ thống làm mát', done: false }
      ]);
    }
  };

  const selectAppointment = (appt: Appointment) => {
    setSelectedAppointment(appt);
    setAppointment(appt);
    initializeChecklist(appt);
    // Reset states
    setIssues([]);
    setPartsUsed([]);
    setSuggestion({ service: '', reason: '', estimatedCost: '' });
  };

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      setCurrentTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklist(prev => [...prev, {
        id: Date.now(),
        title: newChecklistItem,
        done: false
      }]);
      setNewChecklistItem('');
    }
  };

  const removeChecklistItem = (id: number) => {
    setChecklist(prev => prev.filter(item => item.id !== id));
  };

  const addIssue = () => {
    if (newIssue.description.trim()) {
      setIssues(prev => [...prev, {
        id: `ISS-${Date.now()}`,
        description: newIssue.description,
        severity: newIssue.severity,
        images: []
      }]);
      setNewIssue({ description: '', severity: 'medium' });
      setShowIssueForm(false);
    }
  };

  const removeIssue = (id: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const addPart = () => {
    if (newPart.partCode && newPart.partName) {
      setPartsUsed(prev => [...prev, {
        id: `PART-${Date.now()}`,
        ...newPart
      }]);
      setNewPart({ partCode: '', partName: '', quantity: 1, unit: 'cái' });
      setShowPartForm(false);
    }
  };

  const removePart = (id: string) => {
    setPartsUsed(prev => prev.filter(part => part.id !== id));
  };

  const submitSuggestion = () => {
    console.log('Submitting suggestion:', suggestion);
    alert('Đã gửi đề xuất đến Staff!');
    setSuggestion({ service: '', reason: '', estimatedCost: '' });
    setShowSuggestionForm(false);
  };

  const completeWork = async () => {
    if (!appointment) return;

    try {
      await appointmentService.updateAppointment(appointment.id, {
        status: 'COMPLETED',
        notes: completionNotes
      });
      alert('Công việc đã được hoàn thành!');
      setShowCompleteModal(false);
      navigate('/technician/tasks');
    } catch (error) {
      console.error('Error completing work:', error);
      alert('Lỗi khi hoàn thành công việc. Vui lòng thử lại!');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      low: { label: 'Nhẹ', class: 'severity-low' },
      medium: { label: 'Trung bình', class: 'severity-medium' },
      high: { label: 'Cao', class: 'severity-high' },
      critical: { label: 'Nghiêm trọng', class: 'severity-critical' }
    };
    const badge = badges[severity as keyof typeof badges];
    return <span className={`severity-badge ${badge.class}`}>{badge.label}</span>;
  };

  const completedCount = checklist.filter(item => item.done).length;
  const progressPercentage = Math.round((completedCount / checklist.length) * 100);

  if (loading) {
    return (
      <div className="work-processing">
        <div className="empty-work">
          <Clock size={48} />
          <h3>Đang tải thông tin công việc...</h3>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="work-processing">
        <div className="empty-work">
          <Clock size={48} />
          <h3>Không có công việc nào đang thực hiện</h3>
          <p>Vui lòng bắt đầu công việc từ danh sách trước</p>
          <button className="btn-primary" onClick={() => navigate('/technician/tasks')}>
            Quay lại danh sách công việc
          </button>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="work-processing">
        <div className="empty-work">
          <Clock size={48} />
          <h3>Vui lòng chọn công việc để xử lý</h3>
          <button className="btn-primary" onClick={() => navigate('/technician/tasks')}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (appointment.status !== 'IN_PROGRESS') {
    return (
      <div className="work-processing">
        <div className="empty-work">
          <AlertCircle size={48} />
          <h3>Công việc chưa được bắt đầu hoặc đã hoàn thành</h3>
          <p>Status hiện tại: {appointment.status}</p>
          <p>Vui lòng bắt đầu công việc từ danh sách trước</p>
          <button className="btn-primary" onClick={() => navigate('/technician/tasks')}>
            Quay lại danh sách công việc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="work-processing">
      {/* Sidebar: List of appointments */}
      {appointments.length > 1 && (
        <div className="work-sidebar">
          <h4>Công việc đang xử lý ({appointments.length})</h4>
          <div className="appointment-list">
            {appointments.map(apt => (
              <div
                key={apt.id}
                className={`appointment-item ${selectedAppointment?.id === apt.id ? 'selected' : ''}`}
                onClick={() => selectAppointment(apt)}
              >
                <div className="apt-header">
                  <span className="apt-id">{apt.id.substring(0, 8)}</span>
                  <span className={`apt-status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                </div>
                <div className="apt-vehicle">{apt.vehicleModel} - {apt.vehicleLicensePlate}</div>
                <div className="apt-customer">{apt.customerName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="work-header">
        <div className="work-info">
          <h2>Xử lý Công việc</h2>
          <div className="task-summary">
            <span className="task-id">{appointment.id.substring(0, 8)}</span>
            <span className="separator">•</span>
            <span>{appointment.vehicleModel} - {appointment.vehicleLicensePlate}</span>
            <span className="separator">•</span>
            <span>Khách: {appointment.customerName}</span>
            {appointment.customerPhone && (
              <>
                <span className="separator">•</span>
                <span>{appointment.customerPhone}</span>
              </>
            )}
          </div>
          <div className="service-info" style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
            Dịch vụ: <strong>{appointment.servicePackageName}</strong>
          </div>
        </div>
        <div className="timer">
          <Clock size={20} />
          <span className="time">{currentTime}</span>
        </div>
      </div>

      <div className="work-content">
        {/* Checklist Section */}
        <section className="work-section">
          <div className="section-header">
            <h3>
              <CheckCircle2 size={20} />
              Checklist Kỹ thuật EV
            </h3>
            <div className="progress-info">
              <span>{completedCount}/{checklist.length} hoàn thành</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
              <span className="progress-percent">{progressPercentage}%</span>
            </div>
          </div>

          <ul className="checklist">
            {checklist.map(item => (
              <li key={item.id} className={item.done ? 'done' : ''}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={() => toggleChecklistItem(item.id)}
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-text">{item.title}</span>
                </label>
                <button
                  className="btn-remove-small"
                  onClick={() => removeChecklistItem(item.id)}
                  title="Xóa"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>

          <div className="add-checklist">
            <input
              type="text"
              placeholder="Thêm hạng mục kiểm tra..."
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addChecklistItem()}
            />
            <button className="btn-add" onClick={addChecklistItem}>
              <Plus size={16} />
              Thêm
            </button>
          </div>
        </section>

        {/* Issues Section */}
        <section className="work-section">
          <div className="section-header">
            <h3>
              <AlertCircle size={20} />
              Vấn đề phát hiện ({issues.length})
            </h3>
            <button className="btn-primary-small" onClick={() => setShowIssueForm(true)}>
              <Plus size={16} />
              Ghi nhận vấn đề
            </button>
          </div>

          {showIssueForm && (
            <div className="issue-form">
              <textarea
                placeholder="Mô tả vấn đề phát hiện..."
                value={newIssue.description}
                onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                rows={3}
              />
              <div className="form-row">
                <select
                  value={newIssue.severity}
                  onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value as any })}
                >
                  <option value="low">Nhẹ</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                  <option value="critical">Nghiêm trọng</option>
                </select>
                <div className="upload-stub">
                  <Upload size={16} />
                  <span>Upload ảnh (tùy chọn)</span>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowIssueForm(false)}>Hủy</button>
                <button className="btn-primary" onClick={addIssue}>Thêm vấn đề</button>
              </div>
            </div>
          )}

          {issues.length > 0 ? (
            <div className="issues-list">
              {issues.map(issue => (
                <div key={issue.id} className="issue-item">
                  <div className="issue-header">
                    <span className="issue-id">{issue.id}</span>
                    {getSeverityBadge(issue.severity)}
                    <button className="btn-remove-small" onClick={() => removeIssue(issue.id)}>
                      <X size={14} />
                    </button>
                  </div>
                  <p className="issue-description">{issue.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Chưa có vấn đề nào được ghi nhận</p>
          )}
        </section>

        {/* Parts Used Section */}
        <section className="work-section">
          <div className="section-header">
            <h3>
              <Package size={20} />
              Phụ tùng đã sử dụng ({partsUsed.length})
            </h3>
            <button className="btn-primary-small" onClick={() => setShowPartForm(true)}>
              <Plus size={16} />
              Thêm phụ tùng
            </button>
          </div>

          {showPartForm && (
            <div className="part-form">
              <div className="form-grid">
                <input
                  type="text"
                  placeholder="Mã phụ tùng"
                  value={newPart.partCode}
                  onChange={(e) => setNewPart({ ...newPart, partCode: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tên phụ tùng"
                  value={newPart.partName}
                  onChange={(e) => setNewPart({ ...newPart, partName: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Số lượng"
                  min="1"
                  value={newPart.quantity}
                  onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                />
                <input
                  type="text"
                  placeholder="Đơn vị"
                  value={newPart.unit}
                  onChange={(e) => setNewPart({ ...newPart, unit: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowPartForm(false)}>Hủy</button>
                <button className="btn-primary" onClick={addPart}>Thêm</button>
              </div>
            </div>
          )}

          {partsUsed.length > 0 ? (
            <div className="parts-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã PT</th>
                    <th>Tên phụ tùng</th>
                    <th>Số lượng</th>
                    <th>Đơn vị</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {partsUsed.map(part => (
                    <tr key={part.id}>
                      <td className="part-code">{part.partCode}</td>
                      <td>{part.partName}</td>
                      <td className="quantity">{part.quantity}</td>
                      <td>{part.unit}</td>
                      <td>
                        <button className="btn-remove-small" onClick={() => removePart(part.id)}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-message">Chưa sử dụng phụ tùng nào</p>
          )}
        </section>

        {/* Service Suggestion Section */}
        <section className="work-section">
          <div className="section-header">
            <h3>Đề xuất Dịch vụ thêm</h3>
            {!showSuggestionForm && (
              <button className="btn-primary-small" onClick={() => setShowSuggestionForm(true)}>
                <Plus size={16} />
                Tạo đề xuất
              </button>
            )}
          </div>

          {showSuggestionForm && (
            <div className="suggestion-form">
              <input
                type="text"
                placeholder="Tên dịch vụ đề xuất"
                value={suggestion.service}
                onChange={(e) => setSuggestion({ ...suggestion, service: e.target.value })}
              />
              <textarea
                placeholder="Lý do đề xuất..."
                value={suggestion.reason}
                onChange={(e) => setSuggestion({ ...suggestion, reason: e.target.value })}
                rows={3}
              />
              <input
                type="text"
                placeholder="Ước tính chi phí (VD: 500,000 VNĐ)"
                value={suggestion.estimatedCost}
                onChange={(e) => setSuggestion({ ...suggestion, estimatedCost: e.target.value })}
              />
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => setShowSuggestionForm(false)}>Hủy</button>
                <button className="btn-primary" onClick={submitSuggestion}>Gửi đề xuất</button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Complete Work Button */}
      <div className="work-footer">
        <button className="btn-complete" onClick={() => setShowCompleteModal(true)}>
          <CheckCircle2 size={20} />
          Hoàn tất Công việc & Báo cáo
        </button>
      </div>

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Hoàn tất Công việc</h3>
              <button className="close-btn" onClick={() => setShowCompleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="summary-section">
                <h4>Tóm tắt công việc</h4>
                <div className="summary-item">
                  <span className="label">Checklist:</span>
                  <span className="value">{completedCount}/{checklist.length} hoàn thành</span>
                </div>
                <div className="summary-item">
                  <span className="label">Vấn đề phát hiện:</span>
                  <span className="value">{issues.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Phụ tùng đã thay:</span>
                  <span className="value">{partsUsed.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Thời gian thực tế:</span>
                  <span className="value">{currentTime}</span>
                </div>
              </div>

              <div className="notes-section">
                <h4>Ghi chú kỹ thuật</h4>
                <textarea
                  placeholder="Ghi chú về công việc đã thực hiện, tình trạng xe, khuyến nghị cho khách hàng..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="upload-section">
                <h4>Hình ảnh xe sau sửa chữa</h4>
                <div className="upload-placeholder">
                  <Upload size={32} />
                  <p>Click để upload ảnh (tùy chọn)</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCompleteModal(false)}>Hủy</button>
              <button className="btn-complete" onClick={completeWork}>
                <CheckCircle2 size={16} />
                Xác nhận hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkProcessing;
