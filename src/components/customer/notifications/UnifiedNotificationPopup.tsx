import React, { useState } from 'react';
import { X, Calendar, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { MaintenanceReminder, PaymentReminder, Vehicle, MaintenancePackage } from '../../../types';
import MDButton from '../../ui/MDButton';
import './UnifiedNotificationPopup.css';

interface UnifiedNotificationPopupProps {
  maintenanceReminders: MaintenanceReminder[];
  paymentReminders: PaymentReminder[];
  vehicles: Vehicle[];
  packages: MaintenancePackage[];
  isOpen: boolean;
  onClose: () => void;
  onScheduleService: (reminderId: string) => void;
  onPayNow: (reminderId: string) => void;
  onViewDetails: (reminderId: string) => void;
  onSnooze: (reminderId: string, days: number) => void;
}

const UnifiedNotificationPopup: React.FC<UnifiedNotificationPopupProps> = ({
  maintenanceReminders,
  paymentReminders,
  vehicles,
  packages,
  isOpen,
  onClose,
  onScheduleService,
  onPayNow,
  onViewDetails,
  onSnooze
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'maintenance' | 'payment'>('all');

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const getPackageInfo = (packageId: string) => {
    return packages.find(p => p.id === packageId);
  };

  const getDaysOverdue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalNotifications = maintenanceReminders.length + paymentReminders.length;

  const filteredMaintenanceReminders = activeTab === 'payment' ? [] : maintenanceReminders;
  const filteredPaymentReminders = activeTab === 'maintenance' ? [] : paymentReminders;

  return (
    <div className="unified-notification-overlay">
      <div className="unified-notification-popup">
        <div className="popup-header">
          <div className="header-content">
            <h2>🔔 Thông báo quan trọng</h2>
            <p>Bạn có {totalNotifications} thông báo cần xử lý</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="notification-tabs">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả ({totalNotifications})
          </button>
          <button
            className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => setActiveTab('maintenance')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Bảo dưỡng ({maintenanceReminders.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'payment' ? 'active' : ''}`}
            onClick={() => setActiveTab('payment')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Thanh toán ({paymentReminders.length})
          </button>
        </div>

        <div className="popup-content">
          {/* Maintenance Reminders */}
          {filteredMaintenanceReminders.length > 0 && (
            <div className="notification-section">
              <h3 className="section-title">
                <Calendar className="h-5 w-5" />
                Nhắc nhở bảo dưỡng
              </h3>
              <div className="reminders-list">
                {filteredMaintenanceReminders.map((reminder) => {
                  const vehicle = getVehicleInfo(reminder.vehicleId);
                  const daysOverdue = reminder.isOverdue ? getDaysOverdue(reminder.dueDate) : 0;
                  
                  return (
                    <div key={reminder.id} className={`reminder-item maintenance ${reminder.isOverdue ? 'overdue' : ''}`}>
                      <div className="reminder-header">
                        <div className="vehicle-info">
                          <h4>{vehicle?.make} {vehicle?.model}</h4>
                          <span className="license-plate">{vehicle?.licensePlate}</span>
                        </div>
                        <span className={`due-date ${reminder.isOverdue ? 'overdue' : ''}`}>
                          {reminder.isOverdue ? `Quá hạn ${daysOverdue} ngày` : `Đến hạn: ${formatDate(reminder.dueDate)}`}
                        </span>
                      </div>

                      <div className="reminder-details">
                        <p className="service-type">
                          {reminder.serviceType === 'regular_maintenance' ? 'Bảo dưỡng định kỳ' : 
                           reminder.serviceType === 'battery_check' ? 'Kiểm tra pin' : 'Bảo dưỡng'}
                        </p>
                        {reminder.dueKilometers && (
                          <p className="kilometers">
                            Số km đến hạn: {reminder.dueKilometers?.toLocaleString()} km
                          </p>
                        )}
                      </div>

                      <div className="reminder-actions">
                        <MDButton
                          variant="filled"
                          onClick={() => onScheduleService(reminder.id)}
                          className="schedule-btn"
                        >
                          Đặt lịch bảo dưỡng
                        </MDButton>
                        <MDButton
                          variant="text"
                          onClick={() => onSnooze(reminder.id, 7)}
                          className="snooze-btn"
                        >
                          Nhắc lại sau 7 ngày
                        </MDButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payment Reminders */}
          {filteredPaymentReminders.length > 0 && (
            <div className="notification-section">
              <h3 className="section-title">
                <CreditCard className="h-5 w-5" />
                Nhắc nhở thanh toán
              </h3>
              <div className="reminders-list">
                {filteredPaymentReminders.map((reminder) => {
                  const packageInfo = reminder.servicePackageId ? getPackageInfo(reminder.servicePackageId) : null;
                  const daysOverdue = reminder.isOverdue ? getDaysOverdue(reminder.dueDate) : 0;
                  
                  return (
                    <div key={reminder.id} className={`reminder-item payment ${reminder.isOverdue ? 'overdue' : ''}`}>
                      <div className="reminder-header">
                        <div className="payment-info">
                          <h4>{packageInfo ? packageInfo.name : 'Thanh toán dịch vụ'}</h4>
                          <span className="amount">{formatCurrency(reminder.amount)}</span>
                        </div>
                        <span className={`due-date ${reminder.isOverdue ? 'overdue' : ''}`}>
                          {reminder.isOverdue ? `Quá hạn ${daysOverdue} ngày` : `Đến hạn: ${formatDate(reminder.dueDate)}`}
                        </span>
                      </div>

                      <div className="reminder-details">
                        <p className="description">{reminder.description}</p>
                      </div>

                      <div className="reminder-actions">
                        <MDButton
                          variant="filled"
                          onClick={() => onPayNow(reminder.id)}
                          className="pay-now-btn"
                        >
                          Thanh toán ngay
                        </MDButton>
                        <MDButton
                          variant="outlined"
                          onClick={() => onViewDetails(reminder.id)}
                        >
                          Xem chi tiết
                        </MDButton>
                        <MDButton
                          variant="text"
                          onClick={() => onSnooze(reminder.id, 3)}
                          className="snooze-btn"
                        >
                          Nhắc lại sau 3 ngày
                        </MDButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalNotifications === 0 && (
            <div className="empty-state">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h3>Không có thông báo</h3>
              <p>Bạn đã xử lý tất cả thông báo!</p>
            </div>
          )}
        </div>

        <div className="popup-footer">
          <div className="footer-info">
            <span>
              Tổng cộng: {totalNotifications} thông báo
              {(filteredMaintenanceReminders.some(r => r.isOverdue) || filteredPaymentReminders.some(r => r.isOverdue)) && (
                <span className="overdue-warning"> - Có thông báo quá hạn!</span>
              )}
            </span>
          </div>
          <MDButton
            variant="text"
            onClick={onClose}
            className="dismiss-btn"
          >
            Đóng
          </MDButton>
        </div>
      </div>
    </div>
  );
};

export default UnifiedNotificationPopup;