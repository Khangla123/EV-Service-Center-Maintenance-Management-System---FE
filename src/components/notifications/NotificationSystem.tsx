import React, { useState, useEffect } from 'react';
import { Bell, Send, MessageSquare, AlertTriangle, Calendar, CheckCircle, Clock, Settings, Filter } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Notification {
  id: string;
  type: 'maintenance_reminder' | 'payment_due' | 'service_status' | 'inventory_alert' | 'appointment_reminder' | 'system_alert';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  recipient: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    role: 'customer' | 'staff' | 'admin';
  };
  relatedId?: string; // appointment ID, vehicle ID, etc.
  scheduledTime: Date;
  sentTime?: Date;
  deliveryMethod: 'sms' | 'email' | 'push' | 'in_app';
  status: 'scheduled' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  readTime?: Date;
  template: string;
  variables?: { [key: string]: any };
  createdBy: string;
  createdAt: Date;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: Notification['type'];
  subject: string;
  smsContent: string;
  emailContent: string;
  pushContent: string;
  variables: string[]; // Available variables like {customerName}, {vehiclePlate}, etc.
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationRule {
  id: string;
  name: string;
  trigger: 'maintenance_due' | 'payment_overdue' | 'inventory_low' | 'appointment_upcoming' | 'service_completed';
  conditions: {
    daysBefore?: number;
    stockLevel?: number;
    amount?: number;
  };
  template: string;
  recipients: 'customer' | 'admin' | 'staff' | 'all';
  deliveryMethods: ('sms' | 'email' | 'push' | 'in_app')[];
  isActive: boolean;
  createdAt: Date;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [activeTab, setActiveTab] = useState<'notifications' | 'templates' | 'rules' | 'settings'>('notifications');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif1',
        type: 'maintenance_reminder',
        priority: 'high',
        title: 'Nhắc nhở bảo dưỡng định kỳ',
        message: 'Xe VinFast VF8 biển số 30A-12345 đến hạn bảo dưỡng sau 3 ngày.',
        recipient: {
          id: 'cust1',
          name: 'Nguyễn Văn A',
          phone: '0987654321',
          email: 'nguyenvana@email.com',
          role: 'customer'
        },
        relatedId: 'vehicle1',
        scheduledTime: new Date('2025-01-23T09:00:00'),
        deliveryMethod: 'sms',
        status: 'scheduled',
        template: 'maintenance_reminder_template',
        variables: {
          customerName: 'Nguyễn Văn A',
          vehicleMake: 'VinFast',
          vehicleModel: 'VF8',
          licensePlate: '30A-12345',
          dueDate: '2025-01-26'
        },
        createdBy: 'system',
        createdAt: new Date('2025-01-20T10:00:00')
      },
      {
        id: 'notif2',
        type: 'inventory_alert',
        priority: 'urgent',
        title: 'Cảnh báo tồn kho thấp',
        message: 'Má phanh trước VF8 chỉ còn 5 chiếc, dưới mức tối thiểu 10 chiếc.',
        recipient: {
          id: 'admin1',
          name: 'Quản lý kho',
          email: 'admin@evservice.com',
          role: 'admin'
        },
        relatedId: 'part1',
        scheduledTime: new Date('2025-01-20T15:30:00'),
        sentTime: new Date('2025-01-20T15:30:00'),
        deliveryMethod: 'email',
        status: 'delivered',
        readTime: new Date('2025-01-20T15:45:00'),
        template: 'inventory_alert_template',
        variables: {
          partName: 'Má phanh trước VF8',
          currentStock: 5,
          minStock: 10,
          location: 'A1-01'
        },
        createdBy: 'system',
        createdAt: new Date('2025-01-20T15:30:00')
      },
      {
        id: 'notif3',
        type: 'service_status',
        priority: 'medium',
        title: 'Cập nhật trạng thái dịch vụ',
        message: 'Xe của quý khách đã hoàn thành bảo dưỡng và sẵn sàng nhận.',
        recipient: {
          id: 'cust1',
          name: 'Nguyễn Văn A',
          phone: '0987654321',
          email: 'nguyenvana@email.com',
          role: 'customer'
        },
        relatedId: 'appointment1',
        scheduledTime: new Date('2025-01-20T16:00:00'),
        sentTime: new Date('2025-01-20T16:05:00'),
        deliveryMethod: 'sms',
        status: 'sent',
        template: 'service_completed_template',
        variables: {
          customerName: 'Nguyễn Văn A',
          vehiclePlate: '30A-12345',
          completionTime: '16:00',
          totalCost: '950,000đ'
        },
        createdBy: 'tech1',
        createdAt: new Date('2025-01-20T16:00:00')
      },
      {
        id: 'notif4',
        type: 'payment_due',
        priority: 'high',
        title: 'Nhắc nhở thanh toán',
        message: 'Hóa đơn dịch vụ bảo dưỡng 950,000đ chưa được thanh toán.',
        recipient: {
          id: 'cust1',
          name: 'Nguyễn Văn A',
          phone: '0987654321',
          email: 'nguyenvana@email.com',
          role: 'customer'
        },
        relatedId: 'invoice1',
        scheduledTime: new Date('2025-01-22T10:00:00'),
        deliveryMethod: 'email',
        status: 'scheduled',
        template: 'payment_reminder_template',
        variables: {
          customerName: 'Nguyễn Văn A',
          invoiceNumber: 'INV-2025-001',
          amount: '950,000đ',
          dueDate: '2025-01-25'
        },
        createdBy: 'system',
        createdAt: new Date('2025-01-21T09:00:00')
      }
    ];

    const mockTemplates: NotificationTemplate[] = [
      {
        id: 'maintenance_reminder_template',
        name: 'Nhắc nhở bảo dưỡng định kỳ',
        type: 'maintenance_reminder',
        subject: 'Nhắc nhở bảo dưỡng xe {vehicleMake} {vehicleModel}',
        smsContent: 'Xe {vehicleMake} {vehicleModel} biển số {licensePlate} đến hạn bảo dưỡng vào {dueDate}. Vui lòng đặt lịch tại trung tâm.',
        emailContent: `Kính gửi {customerName},

Xe {vehicleMake} {vehicleModel} biển số {licensePlate} của quý khách sắp đến hạn bảo dưỡng vào ngày {dueDate}.

Vui lòng liên hệ hoặc đặt lịch online để được phục vụ tốt nhất.

Trân trọng,
Trung tâm dịch vụ EV`,
        pushContent: 'Xe {vehiclePlate} đến hạn bảo dưỡng {dueDate}',
        variables: ['customerName', 'vehicleMake', 'vehicleModel', 'licensePlate', 'dueDate'],
        isActive: true,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-15')
      },
      {
        id: 'inventory_alert_template',
        name: 'Cảnh báo tồn kho thấp',
        type: 'inventory_alert',
        subject: 'Cảnh báo: Phụ tùng {partName} sắp hết',
        smsContent: 'Phụ tùng {partName} chỉ còn {currentStock} chiếc (tối thiểu {minStock}). Cần nhập hàng gấp.',
        emailContent: `Cảnh báo tồn kho:

Phụ tùng: {partName}
Tồn kho hiện tại: {currentStock}
Mức tối thiểu: {minStock}
Vị trí kho: {location}

Vui lòng kiểm tra và nhập hàng kịp thời.`,
        pushContent: '{partName} sắp hết ({currentStock}/{minStock})',
        variables: ['partName', 'currentStock', 'minStock', 'location'],
        isActive: true,
        createdAt: new Date('2024-12-01'),
        updatedAt: new Date('2025-01-10')
      }
    ];

    const mockRules: NotificationRule[] = [
      {
        id: 'rule1',
        name: 'Nhắc bảo dưỡng trước 3 ngày',
        trigger: 'maintenance_due',
        conditions: { daysBefore: 3 },
        template: 'maintenance_reminder_template',
        recipients: 'customer',
        deliveryMethods: ['sms', 'email'],
        isActive: true,
        createdAt: new Date('2024-12-01')
      },
      {
        id: 'rule2',
        name: 'Cảnh báo kho dưới 10%',
        trigger: 'inventory_low',
        conditions: { stockLevel: 10 },
        template: 'inventory_alert_template',
        recipients: 'admin',
        deliveryMethods: ['email', 'push'],
        isActive: true,
        createdAt: new Date('2024-12-01')
      },
      {
        id: 'rule3',
        name: 'Nhắc thanh toán quá hạn',
        trigger: 'payment_overdue',
        conditions: { daysBefore: 1 },
        template: 'payment_reminder_template',
        recipients: 'customer',
        deliveryMethods: ['sms', 'email'],
        isActive: true,
        createdAt: new Date('2024-12-01')
      }
    ];

    setNotifications(mockNotifications);
    setTemplates(mockTemplates);
    setRules(mockRules);
  }, []);

  const filteredNotifications = notifications.filter(notification => {
    const matchesStatus = filterStatus === 'all' || notification.status === filterStatus;
    const matchesType = filterType === 'all' || notification.type === filterType;
    return matchesStatus && matchesType;
  });

  const handleSendNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, status: 'sent', sentTime: new Date() }
          : notif
      )
    );
  };

  const handleCancelNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId
          ? { ...notif, status: 'cancelled' }
          : notif
      )
    );
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'sent': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-green-700 bg-green-200';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'urgent': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'maintenance_reminder': return <Calendar className="h-4 w-4" />;
      case 'payment_due': return <Clock className="h-4 w-4" />;
      case 'service_status': return <CheckCircle className="h-4 w-4" />;
      case 'inventory_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'appointment_reminder': return <Bell className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <Bell className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng thông báo</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Chờ gửi</p>
              <p className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => n.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đã gửi</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Thất bại</p>
              <p className="text-2xl font-bold text-red-600">
                {notifications.filter(n => n.status === 'failed').length}
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="scheduled">Chờ gửi</option>
          <option value="sent">Đã gửi</option>
          <option value="delivered">Đã nhận</option>
          <option value="failed">Thất bại</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tất cả loại</option>
          <option value="maintenance_reminder">Nhắc bảo dưỡng</option>
          <option value="payment_due">Nhắc thanh toán</option>
          <option value="service_status">Trạng thái dịch vụ</option>
          <option value="inventory_alert">Cảnh báo kho</option>
          <option value="appointment_reminder">Nhắc lịch hẹn</option>
        </select>

        <MDButton
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Tạo thông báo
        </MDButton>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <MDCard key={notification.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                  {getTypeIcon(notification.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                      {notification.priority === 'low' && 'Thấp'}
                      {notification.priority === 'medium' && 'Trung bình'}
                      {notification.priority === 'high' && 'Cao'}
                      {notification.priority === 'urgent' && 'Khẩn cấp'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Người nhận: {notification.recipient.name}</span>
                    <span>Phương thức: {notification.deliveryMethod.toUpperCase()}</span>
                    <span>Lên lịch: {notification.scheduledTime.toLocaleString('vi-VN')}</span>
                    {notification.sentTime && (
                      <span>Đã gửi: {notification.sentTime.toLocaleString('vi-VN')}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                  {notification.status === 'scheduled' && 'Chờ gửi'}
                  {notification.status === 'sent' && 'Đã gửi'}
                  {notification.status === 'delivered' && 'Đã nhận'}
                  {notification.status === 'failed' && 'Thất bại'}
                  {notification.status === 'cancelled' && 'Đã hủy'}
                </span>
                
                {notification.status === 'scheduled' && (
                  <div className="flex space-x-1">
                    <MDButton
                      onClick={() => handleSendNotification(notification.id)}
                      size="small"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Gửi ngay
                    </MDButton>
                    <MDButton
                      onClick={() => handleCancelNotification(notification.id)}
                      size="small"
                      variant="outlined"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      Hủy
                    </MDButton>
                  </div>
                )}
              </div>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Mẫu thông báo</h3>
        <MDButton className="bg-blue-500 hover:bg-blue-600">
          Tạo mẫu mới
        </MDButton>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map((template) => (
          <MDCard key={template.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                template.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
              }`}>
                {template.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Tiêu đề: </span>
                <span className="text-gray-900">{template.subject}</span>
              </div>
              <div>
                <span className="text-gray-600">SMS: </span>
                <span className="text-gray-900">{template.smsContent.slice(0, 100)}...</span>
              </div>
              <div>
                <span className="text-gray-600">Biến: </span>
                <span className="text-gray-900">{template.variables.join(', ')}</span>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <MDButton size="small" variant="outlined">
                Sửa
              </MDButton>
              <MDButton size="small" variant="outlined">
                Sao chép
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Quy tắc tự động</h3>
        <MDButton className="bg-blue-500 hover:bg-blue-600">
          Tạo quy tắc mới
        </MDButton>
      </div>
      
      <div className="space-y-3">
        {rules.map((rule) => (
          <MDCard key={rule.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">{rule.name}</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Kích hoạt: {rule.trigger} | 
                  Người nhận: {rule.recipients} | 
                  Phương thức: {rule.deliveryMethods.join(', ')}
                </p>
                <div className="text-xs text-gray-500">
                  {Object.entries(rule.conditions).map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {value}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rule.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                }`}>
                  {rule.isActive ? 'Hoạt động' : 'Tạm dừng'}
                </span>
                <MDButton size="small" variant="outlined">
                  Sửa
                </MDButton>
              </div>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Cài đặt thông báo</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MDCard className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Cấu hình SMS</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">API Key</label>
              <input
                type="password"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="••••••••••••••••"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Sender ID</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="EV-SERVICE"
              />
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Cấu hình Email</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700">SMTP Server</label>
              <input
                type="text"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700">From Address</label>
              <input
                type="email"
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="noreply@evservice.com"
              />
            </div>
          </div>
        </MDCard>
      </div>
    </div>
  );

  return (
    <div className="notification-system p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hệ thống thông báo</h1>
          <p className="text-gray-600">Quản lý thông báo tự động và thủ công</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'notifications', label: 'Thông báo', icon: Bell },
          { id: 'templates', label: 'Mẫu thông báo', icon: MessageSquare },
          { id: 'rules', label: 'Quy tắc tự động', icon: Settings },
          { id: 'settings', label: 'Cài đặt', icon: Filter }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'notifications' && renderNotifications()}
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'rules' && renderRules()}
      {activeTab === 'settings' && renderSettings()}
    </div>
  );
};

export default NotificationSystem;