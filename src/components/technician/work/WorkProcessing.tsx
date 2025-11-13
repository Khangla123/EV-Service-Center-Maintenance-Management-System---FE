import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Upload, Plus, Trash2, Clock, AlertCircle, CheckCircle2, X, Package, Car, User, Phone, Search } from 'lucide-react';
import './WorkProcessing.css';
import appointmentService, { Appointment } from '../../../services/appointmentService';
import serviceOrderService from '../../../services/serviceOrderService';
import staffService from '../../../services/staffService';
import partService, { PartResponse } from '../../../services/partService';

type ChecklistItem = {
  id: number;
  title: string;
  done: boolean;
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
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>([]);
  const [showPartForm, setShowPartForm] = useState(false);
  const [newPart, setNewPart] = useState({ partCode: '', partName: '', quantity: 1, unit: 'cái' });
  const [allParts, setAllParts] = useState<PartResponse[]>([]);
  const [filteredParts, setFilteredParts] = useState<PartResponse[]>([]);
  const [partSearchQuery, setPartSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<PartResponse | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestion, setSuggestion] = useState<ServiceSuggestion>({ service: '', reason: '', estimatedCost: '' });
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showNextTaskModal, setShowNextTaskModal] = useState(false);
  const [nextTask, setNextTask] = useState<Appointment | null>(null);
  const [showContinueWorkModal, setShowContinueWorkModal] = useState(false);

  // Load danh sách phụ tùng khi component mount
  useEffect(() => {
    const loadParts = async () => {
      try {
        const parts = await partService.getAllParts();
        console.log('🔧 Loaded parts:', parts);
        setAllParts(parts);
      } catch (error) {
        console.error('Error loading parts:', error);
      }
    };
    
    loadParts();
  }, []);

  // Filter parts khi search query thay đổi
  useEffect(() => {
    if (partSearchQuery.trim() === '') {
      setFilteredParts([]);
    } else {
      const query = partSearchQuery.toLowerCase();
      const filtered = allParts.filter(part => 
        part.name.toLowerCase().includes(query) || 
        part.partCode.toLowerCase().includes(query) ||
        part.category.toLowerCase().includes(query)
      );
      setFilteredParts(filtered.slice(0, 10)); // Giới hạn 10 kết quả
    }
  }, [partSearchQuery, allParts]);

  // Lock/unlock body scroll khi modal mở/đóng
  useEffect(() => {
    if (showCompleteModal || showPartForm || showSuggestionForm || showContinueWorkModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCompleteModal, showPartForm, showSuggestionForm, showContinueWorkModal]);

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
        
        // Nếu có appointmentId từ URL, tìm appointment đó
        if (appointmentId) {
          const targetAppointment = allAppointments.find(apt => apt.id === appointmentId);
          
          if (targetAppointment) {
            console.log('✓ Found target appointment:', targetAppointment.id, 'Status:', targetAppointment.status);
            setAppointments([targetAppointment]);
            setSelectedAppointment(targetAppointment);
            setAppointment(targetAppointment);
            await initializeChecklist(targetAppointment);
          } else {
            console.warn('⚠️ Appointment not found:', appointmentId);
            setAppointments([]);
          }
        } else {
          // Không có appointmentId, lọc chỉ IN_PROGRESS appointments
          const inProgressAppts = allAppointments.filter(
            apt => apt.status === 'IN_PROGRESS'
          );
          console.log('✓ In-progress appointments:', inProgressAppts.length);
          
          // ⚠️ CHỈ CHO PHÉP 1 CÔNG VIỆC DUY NHẤT
          const currentWork = inProgressAppts.length > 0 ? [inProgressAppts[0]] : [];
          
          if (inProgressAppts.length > 1) {
            console.warn(`⚠️ Technician có ${inProgressAppts.length} công việc IN_PROGRESS! Chỉ hiển thị công việc đầu tiên.`);
          }
          
          setAppointments(currentWork);
          
          if (currentWork.length > 0) {
            setSelectedAppointment(currentWork[0]);
            setAppointment(currentWork[0]);
            await initializeChecklist(currentWork[0]);
          }
        }
        
      } catch (error) {
        console.error('❌ Error loading appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [appointmentId, navigate]);

  const initializeChecklist = async (appt: Appointment) => {
    try {
      // Load checklist from service_order
      const serviceOrderModule = await import('../../../services/serviceOrderService');
      const serviceOrder = await serviceOrderModule.default.getServiceOrderByAppointmentId(appt.id);
      
      console.log('🔍 Service Order ID:', serviceOrder.id);
      console.log('🔍 Raw checklist from DB:', serviceOrder.checklist);
      
      // Load checklist
      if (serviceOrder.checklist) {
        const parsed = serviceOrderModule.default.parseChecklist(serviceOrder.checklist);
        console.log('🔍 Parsed checklist:', parsed);
        
        if (parsed) {
          let checklistItems: any[] = [];
          
          // Check if it's the new format {items: [...]} or old format [...]
          if (parsed.items && Array.isArray(parsed.items)) {
            checklistItems = parsed.items;
            console.log('✅ Using new format with .items property');
          } else if (Array.isArray(parsed)) {
            checklistItems = parsed;
            console.log('✅ Using old array format');
          }
          
          if (checklistItems.length > 0) {
            // Convert checklist items from database to component format
            const loadedChecklist: ChecklistItem[] = checklistItems.map((item: any, index: number) => ({
              id: index + 1,
              title: `${item.title}${item.description ? ` (${item.description})` : ''}`,
              done: item.isCompleted || item.done || false // Load trạng thái từ DB
            }));
            console.log('✅ Loaded checklist from service order:', loadedChecklist.length, 'items');
            console.log('📋 Checklist with status:', loadedChecklist);
            setChecklist(loadedChecklist);
          } else {
            console.log('⚠️ No checklist items found in parsed data');
            setChecklist([]);
          }
        } else {
          console.log('⚠️ Failed to parse checklist');
          setChecklist([]);
        }
      } else {
        console.log('⚠️ No checklist found in service order');
        setChecklist([]);
      }
    } catch (error) {
      console.warn('⚠️ Could not load checklist from service order:', error);
      setChecklist([]);
    }
  };

  const selectAppointment = async (appt: Appointment) => {
    setSelectedAppointment(appt);
    setAppointment(appt);
    await initializeChecklist(appt);
    // Reset states
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

  const selectPart = (part: PartResponse) => {
    setSelectedPart(part);
    setPartSearchQuery(part.name);
    setFilteredParts([]);
    setNewPart({
      partCode: part.partCode,
      partName: part.name,
      quantity: 1,
      unit: 'cái'
    });
  };

  const addPart = () => {
    if (selectedPart && newPart.quantity > 0) {
      // Kiểm tra số lượng tồn kho
      if (newPart.quantity > selectedPart.stockQuantity) {
        alert(`Không đủ tồn kho! Chỉ còn ${selectedPart.stockQuantity} ${newPart.unit}`);
        return;
      }
      
      setPartsUsed(prev => [...prev, {
        id: `PART-${Date.now()}`,
        partCode: newPart.partCode,
        partName: newPart.partName,
        quantity: newPart.quantity,
        unit: newPart.unit
      }]);
      
      // Reset form
      setNewPart({ partCode: '', partName: '', quantity: 1, unit: 'cái' });
      setPartSearchQuery('');
      setSelectedPart(null);
      setShowPartForm(false);
    } else {
      alert('Vui lòng chọn phụ tùng và nhập số lượng!');
    }
  };

  const removePart = (id: string) => {
    setPartsUsed(prev => prev.filter(part => part.id !== id));
  };

  const submitSuggestion = async () => {
    if (!appointment || !suggestion.service || !suggestion.reason) {
      alert('Vui lòng điền đầy đủ thông tin đề xuất!');
      return;
    }

    try {
      console.log('Submitting suggestion:', suggestion);
      const serviceOrder = await serviceOrderService.getServiceOrderByAppointmentId(appointment.id);
      
      if (serviceOrder) {
        // Parse estimated cost from string to number
        const costStr = suggestion.estimatedCost.replace(/[^0-9]/g, '');
        const estimatedCost = parseInt(costStr) || 0;
        
        await serviceOrderService.addServiceSuggestion(serviceOrder.id, {
          serviceName: suggestion.service,
          reason: suggestion.reason,
          estimatedCost: estimatedCost
        });
        
        console.log('✅ Suggestion submitted successfully');
        alert('✅ Đã gửi đề xuất đến Staff thành công!');
        setSuggestion({ service: '', reason: '', estimatedCost: '' });
        setShowSuggestionForm(false);
      }
    } catch (error) {
      console.error('❌ Error submitting suggestion:', error);
      alert('❌ Lỗi khi gửi đề xuất. Vui lòng thử lại!');
    }
  };

  const findNextAvailableTask = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const allStaff = await staffService.getAllStaff();
      const myStaff = allStaff.find(s => s.userId === user.id);
      
      if (myStaff) {
        const tasks = await appointmentService.getMyTasks(myStaff.id);
        // Tìm task tiếp theo có status ASSIGNED (chưa bắt đầu)
        const nextAvailableTask = tasks.find((task: Appointment) => 
          task.status === 'ASSIGNED' && task.id !== appointment?.id
        );
        return nextAvailableTask || null;
      }
      return null;
    } catch (error) {
      console.error('Error finding next task:', error);
      return null;
    }
  };

  const completeWork = async () => {
    if (!appointment) return;

    try {
      console.log('🎯 Completing work for appointment:', appointment.id);
      
      // Bước 1: Lấy staffId của technician hiện tại
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const allStaff = await staffService.getAllStaff();
      const myStaff = allStaff.find(s => s.userId === user.id);
      const technicianStaffId = myStaff?.id || appointment.technicianId;
      
      console.log('Current technician staffId:', technicianStaffId);
      
      // Bước 2: Tạo/Cập nhật Service Order từ Appointment
      // Backend sẽ dùng service order này để tạo invoice
      if (technicianStaffId) {
        try {
          console.log('📝 Creating service order from appointment...');
          await serviceOrderService.createServiceOrderFromAppointment(
            appointment.id,
            technicianStaffId
          );
          console.log('✅ Service order created successfully');
        } catch (serviceOrderError: any) {
          // Nếu service order đã tồn tại, log và tiếp tục
          const errorMsg = serviceOrderError?.response?.data?.message || serviceOrderError.message;
          console.log('Service order creation:', errorMsg);
          
          // Nếu lỗi KHÔNG phải "already exists", có thể là lỗi nghiêm trọng
          if (!errorMsg.toLowerCase().includes('exist')) {
            console.error('⚠️ Unexpected error creating service order:', errorMsg);
          }
        }
        
        // Bước 2.5: Lưu phụ tùng đã sử dụng vào bảng service_order_parts
        if (partsUsed.length > 0) {
          try {
            console.log('🔧 Saving parts used to service_order_parts table...');
            const serviceOrder = await serviceOrderService.getServiceOrderByAppointmentId(appointment.id);
            
            if (serviceOrder) {
              const partsData = partsUsed.map(part => ({
                partCode: part.partCode,
                partName: part.partName,
                quantity: part.quantity,
                unit: part.unit
              }));
              
              await serviceOrderService.addPartsUsed(serviceOrder.id, partsData);
              console.log('✅ Parts saved to service_order_parts table:', partsData);
            }
          } catch (partsError) {
            console.error('⚠️ Error saving parts:', partsError);
            // Không block việc hoàn thành, chỉ log warning
          }
        }

        // Bước 2.6: Lưu notes vào service order
        if (completionNotes) {
          try {
            const serviceOrder = await serviceOrderService.getServiceOrderByAppointmentId(appointment.id);
            if (serviceOrder) {
              await serviceOrderService.updateServiceOrder(serviceOrder.id, {
                workPerformed: completionNotes
              });
              console.log('✅ Notes saved to service order');
            }
          } catch (notesError) {
            console.error('⚠️ Error saving notes:', notesError);
          }
        }
      } else {
        console.warn('⚠️ No technician ID found, skipping service order creation');
      }
      
      // Bước 3: Cập nhật appointment status = COMPLETED
      // Backend sẽ tự động tạo invoice khi status = COMPLETED
      console.log('✅ Updating appointment status to COMPLETED...');
      await appointmentService.updateAppointment(appointment.id, {
        status: 'COMPLETED',
        notes: completionNotes
      });
      
      console.log('🎉 Work completed successfully!');
      setShowCompleteModal(false);
      
      // Tìm công việc tiếp theo
      const nextAvailableTask = await findNextAvailableTask();
      
      if (nextAvailableTask) {
        // Có công việc tiếp theo - hiển thị modal hỏi có muốn tiếp tục không
        setNextTask(nextAvailableTask);
        setShowContinueWorkModal(true);
      } else {
        // Không có công việc tiếp theo - về trang tasks
        alert('✅ Công việc hoàn thành! Không có công việc tiếp theo.');
        navigate('/technician/tasks');
      }
    } catch (error) {
      console.error('❌ Error completing work:', error);
      alert('Lỗi khi hoàn thành công việc. Vui lòng thử lại!');
    }
  };

  const handleContinueWork = () => {
    if (nextTask) {
      setShowContinueWorkModal(false);
      navigate(`/technician/work-processing/${nextTask.id}`, { replace: true });
    }
  };

  const handleFinishWork = () => {
    setShowContinueWorkModal(false);
    navigate('/technician/tasks');
  };

  const handleStartNextTask = () => {
    if (nextTask) {
      setShowNextTaskModal(false);
      navigate(`/technician/work-processing/${nextTask.id}`);
      // Reload trang để load công việc mới
      window.location.reload();
    }
  };

  const handleBackToTasks = () => {
    setShowNextTaskModal(false);
    // Navigate với state để highlight task tiếp theo
    navigate('/technician/tasks', { 
      state: { 
        highlightTaskId: nextTask?.id,
        message: 'Công việc đã hoàn thành!'
      } 
    });
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
          <Clock size={64} strokeWidth={1.5} />
          <h3>Không có công việc nào đang thực hiện</h3>
          <p>Bạn chưa có công việc nào trong trạng thái đang xử lý.<br />Vui lòng bắt đầu công việc từ danh sách công việc.</p>
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
          <Clock size={64} strokeWidth={1.5} />
          <h3>Vui lòng chọn công việc để xử lý</h3>
          <p>Không tìm thấy thông tin công việc.</p>
          <button className="btn-primary" onClick={() => navigate('/technician/tasks')}>
            Quay lại danh sách công việc
          </button>
        </div>
      </div>
    );
  }

  if (appointment.status !== 'IN_PROGRESS') {
    return (
      <div className="work-processing">
        <div className="empty-work">
          <AlertCircle size={64} strokeWidth={1.5} />
          <h3>Công việc chưa được bắt đầu hoặc đã hoàn thành</h3>
          <p>Status hiện tại: <strong>{appointment.status}</strong></p>
          <p>Vui lòng bắt đầu công việc từ danh sách công việc hoặc chọn công việc đang thực hiện.</p>
          <button className="btn-primary" onClick={() => navigate('/technician/tasks')}>
            Quay lại danh sách công việc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="work-processing">
      {/* ẨN SIDEBAR - Chỉ cho phép 1 công việc duy nhất */}
      {/* Sidebar đã bị vô hiệu hóa vì technician chỉ được xử lý 1 công việc tại 1 thời điểm */}

      {/* Main Work Area - Full Width */}
      <div className="work-main">
        {/* Single Work Policy Notice */}
        <div className="single-work-notice">
          ℹ️ <strong>Chính sách xử lý công việc:</strong> Bạn chỉ được xử lý 1 công việc duy nhất tại một thời điểm. 
          Vui lòng hoàn thành công việc hiện tại trước khi nhận công việc mới.
        </div>

        {/* Enhanced Header */}
        <div className="work-header-enhanced">
          <div className="header-left">
            <h2>🔧 Xử lý Công việc</h2>
            <div className="job-details">
              <span className="job-id-badge">#{appointment.id.substring(0, 8)}</span>
              <span className="separator">•</span>
              <Car size={16} />
              <span className="vehicle">{appointment.vehicleModel} - {appointment.vehicleLicensePlate}</span>
              <span className="separator">•</span>
              <User size={16} />
              <span>{appointment.customerName}</span>
              {appointment.customerPhone && (
                <>
                  <span className="separator">•</span>
                  <Phone size={16} />
                  <span>{appointment.customerPhone}</span>
                </>
              )}
            </div>
            <div className="service-badge-container">
              {appointment.selectedPackageNames ? (
                // Display multiple package names from backend
                appointment.selectedPackageNames.split(', ').map((name, index) => (
                  <span key={index} className="service-badge" style={{ marginRight: '8px' }}>
                    {name}
                  </span>
                ))
              ) : (
                <span className="service-badge">{appointment.servicePackageName}</span>
              )}
            </div>
          </div>
          <div className="header-right">
            <div className="timer-box">
              <Clock size={24} />
              <div className="timer-info">
                <span className="time">{currentTime}</span>
                <span className="label">Thời gian</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Card */}
        <div className="progress-card-enhanced">
          <div className="progress-header">
            <h3>📊 Tiến độ công việc</h3>
            <span className="progress-percentage-large">{progressPercentage}%</span>
          </div>
          
          <div className="progress-bar-container">
            <div className="progress-bar-large">
              <div 
                className="progress-fill-large" 
                style={{ width: `${progressPercentage}%` }}
              />
              <span 
                className="progress-text-overlay"
                style={{ color: progressPercentage > 40 ? 'white' : '#374151' }}
              >
                {completedCount} / {checklist.length} hoàn thành
              </span>
            </div>
          </div>

          <div className="progress-stats">
            <div className="stat-box completed">
              <div className="stat-icon">
                <CheckCircle2 size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{completedCount}</span>
                <span className="stat-label">Hoàn thành</span>
              </div>
            </div>
            <div className="stat-box pending">
              <div className="stat-icon">
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{checklist.length - completedCount}</span>
                <span className="stat-label">Còn lại</span>
              </div>
            </div>
            <div className="stat-box parts">
              <div className="stat-icon">
                <Package size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{partsUsed.length}</span>
                <span className="stat-label">Phụ tùng</span>
              </div>
            </div>
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
              <div className="part-search-container">
                <div className="search-input-wrapper">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm phụ tùng theo tên, mã hoặc danh mục..."
                    value={partSearchQuery}
                    onChange={(e) => setPartSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {filteredParts.length > 0 && (
                  <div className="parts-dropdown">
                    {filteredParts.map(part => (
                      <div 
                        key={part.id} 
                        className="part-option"
                        onClick={() => selectPart(part)}
                      >
                        <div className="part-option-header">
                          <span className="part-option-code">{part.partCode}</span>
                          <span className="part-option-name">{part.name}</span>
                        </div>
                        <div className="part-option-details">
                          <span className="part-option-category">{part.category}</span>
                          <span className="part-option-stock">
                            Tồn kho: <strong>{part.stockQuantity}</strong>
                          </span>
                          <span className="part-option-price">
                            {new Intl.NumberFormat('vi-VN', { 
                              style: 'currency', 
                              currency: 'VND' 
                            }).format(part.unitPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedPart && (
                <div className="selected-part-info">
                  <div className="selected-part-header">
                    <Package size={18} />
                    <strong>{selectedPart.name}</strong>
                    <span className="selected-part-code">({selectedPart.partCode})</span>
                  </div>
                  <div className="selected-part-details">
                    <span>Danh mục: {selectedPart.category}</span>
                    <span>Giá: {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(selectedPart.unitPrice)}</span>
                    <span>Tồn kho: {selectedPart.stockQuantity}</span>
                  </div>
                  <div className="quantity-input-group">
                    <label>Số lượng sử dụng:</label>
                    <input
                      type="number"
                      placeholder="Số lượng"
                      min="1"
                      max={selectedPart.stockQuantity}
                      value={newPart.quantity}
                      onChange={(e) => setNewPart({ ...newPart, quantity: parseInt(e.target.value) || 1 })}
                    />
                    <span className="quantity-max">/ {selectedPart.stockQuantity} có sẵn</span>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowPartForm(false);
                    setPartSearchQuery('');
                    setSelectedPart(null);
                    setFilteredParts([]);
                  }}
                >
                  Hủy
                </button>
                <button 
                  className="btn-primary" 
                  onClick={addPart}
                  disabled={!selectedPart}
                >
                  Thêm
                </button>
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
            <div className="empty-message">
              <Package size={32} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <p style={{ margin: 0 }}>Chưa có phụ tùng nào được sử dụng</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>
                Nhấn "Thêm phụ tùng" để thêm phụ tùng đã sử dụng trong quá trình bảo dưỡng
              </p>
            </div>
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

      {/* Enhanced Complete Button Footer */}
      <div className="work-footer-enhanced">
        <div className="footer-summary">
          <div className="summary-item">
            <CheckCircle2 size={18} />
            <span>{completedCount}/{checklist.length} Checklist</span>
          </div>
          <div className="summary-item">
            <AlertCircle size={18} />
            <span>{partsUsed.length} Phụ tùng</span>
          </div>
          <div className="summary-item">
            <Clock size={18} />
            <span>{currentTime}</span>
          </div>
        </div>
        <button 
          className="btn-complete-enhanced" 
          onClick={() => setShowCompleteModal(true)}
          disabled={completedCount < checklist.length}
        >
          <CheckCircle2 size={22} />
          Hoàn tất Công việc & Báo cáo
        </button>
      </div>
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
                
                {/* Checklist */}
                <div className="summary-item">
                  <span className="label">Checklist:</span>
                  <span className="value">{completedCount}/{checklist.length} hoàn thành</span>
                </div>

                {/* Phụ tùng đã thay */}
                <div className="summary-item">
                  <span className="label">Phụ tùng đã thay:</span>
                  <span className="value">{partsUsed.length}</span>
                </div>
                {partsUsed.length > 0 && (
                  <div className="summary-detail-box parts-box">
                    {partsUsed.map((part, index) => (
                      <div key={part.id} className="detail-item">
                        <span className="item-number">{index + 1}.</span>
                        <div className="item-content">
                          <span className="part-code">{part.partCode}</span>
                          <span className="part-name">{part.partName}</span>
                          <span className="part-qty">x{part.quantity} {part.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Thời gian */}
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
                Hoàn thành
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Xác nhận tiếp tục làm việc */}
      {showContinueWorkModal && nextTask && (
        <div className="modal-overlay">
          <div className="modal-content continue-work-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✅ Công việc hoàn thành!</h3>
            </div>
            <div className="modal-body">
              <div className="success-message">
                <CheckCircle2 size={56} style={{ color: '#10b981' }} />
                <p className="success-title">Xuất sắc! Bạn đã hoàn thành công việc.</p>
              </div>

              <div className="continue-question">
                <h4>🔔 Có công việc tiếp theo đang chờ</h4>
                <p>Bạn có muốn tiếp tục làm việc không?</p>
              </div>

              <div className="next-task-preview">
                <div className="preview-label">Công việc tiếp theo:</div>
                <div className="preview-info">
                  <div className="info-row">
                    <Car size={18} />
                    <span>{nextTask.vehicleLicensePlate}</span>
                    <span className="text-muted">{nextTask.vehicleModel}</span>
                  </div>
                  <div className="info-row">
                    <User size={18} />
                    <span>{nextTask.customerName}</span>
                  </div>
                  <div className="info-row">
                    <Package size={18} />
                    <span>{nextTask.servicePackageName}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-finish" onClick={handleFinishWork}>
                Kết thúc làm việc
              </button>
              <button className="btn-continue" onClick={handleContinueWork}>
                <Play size={18} />
                Tiếp tục làm việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Công việc tiếp theo */}
      {showNextTaskModal && nextTask && (
        <div className="modal-overlay" onClick={() => setShowNextTaskModal(false)}>
          <div className="modal-content next-task-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎉 Công việc hoàn thành!</h3>
              <button className="close-btn" onClick={() => setShowNextTaskModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="success-message">
                <CheckCircle2 size={48} style={{ color: '#10b981' }} />
                <p>Bạn đã hoàn thành xuất sắc công việc này!</p>
              </div>

              <div className="next-task-info">
                <h4>📋 Công việc tiếp theo đang chờ:</h4>
                <div className="task-card-preview">
                  <div className="task-header">
                    <span className="task-code">#{nextTask.id.slice(0, 8)}</span>
                    <span className={`status-badge ${nextTask.status.toLowerCase()}`}>
                      {nextTask.status}
                    </span>
                  </div>
                  <div className="task-details">
                    <div className="detail-row">
                      <Car size={16} />
                      <span>{nextTask.vehicleLicensePlate || 'N/A'}</span>
                      <span className="text-muted">
                        {nextTask.vehicleModel}
                      </span>
                    </div>
                    <div className="detail-row">
                      <User size={16} />
                      <span>{nextTask.customerName}</span>
                    </div>
                    <div className="detail-row">
                      <Package size={16} />
                      <span>{nextTask.servicePackageName}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="action-question">
                <p>Bạn có muốn bắt đầu công việc này ngay không?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleBackToTasks}>
                Về danh sách công việc
              </button>
              <button className="btn-primary" onClick={handleStartNextTask}>
                <Play size={16} />
                Bắt đầu ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkProcessing;
