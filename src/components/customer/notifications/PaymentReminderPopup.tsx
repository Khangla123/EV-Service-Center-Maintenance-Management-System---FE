import React from 'react';
import { PaymentReminder, MaintenancePackage } from '../../../types';
import { MDButton } from '../../ui';
import './PaymentReminderPopup.css';

interface PaymentReminderPopupProps {
  reminders: PaymentReminder[];
  packages: MaintenancePackage[];
  isOpen: boolean;
  onClose: () => void;
  onPayNow: (reminderId: string) => void;
  onViewDetails: (reminderId: string) => void;
  onSnooze: (reminderId: string, days: number) => void;
}

const PaymentReminderPopup: React.FC<PaymentReminderPopupProps> = ({
  reminders,
  packages,
  isOpen,
  onClose,
  onPayNow,
  onViewDetails,
  onSnooze
}) => {
  if (!isOpen || reminders.length === 0) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getPaymentTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'maintenance_package': 'Gói bảo dưỡng',
      'service_renewal': 'Gia hạn dịch vụ',
      'outstanding_bill': 'Hóa đơn chưa thanh toán'
    };
    return types[type] || type;
  };

  const getPaymentTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'maintenance_package': '📦',
      'service_renewal': '🔄',
      'outstanding_bill': '💳'
    };
    return icons[type] || '💰';
  };

  const getPackageInfo = (packageId: string) => {
    return packages.find(p => p.id === packageId);
  };

  return (
    <div className="payment-reminder-overlay">
      <div className="payment-reminder-popup">
        <div className="popup-header">
          <h2>💳 Nhắc nhở thanh toán</h2>
        </div>

        <div className="popup-content">
          <p className="popup-intro">
            Bạn có các khoản cần thanh toán. Hãy thanh toán để tiếp tục sử dụng dịch vụ!
          </p>

          <div className="reminders-list">
            {reminders.map((reminder) => {
              const packageInfo = reminder.servicePackageId ? getPackageInfo(reminder.servicePackageId) : null;
              
              return (
                <div key={reminder.id} className={`reminder-item ${reminder.isOverdue ? 'overdue' : ''}`}>
                  <div className="reminder-header">
                    <div className="payment-info">
                      <div className="payment-type">
                        <span className="type-icon">
                          {getPaymentTypeIcon(reminder.type)}
                        </span>
                        <span className="type-text">
                          {getPaymentTypeText(reminder.type)}
                        </span>
                      </div>
                      <div className="amount">
                        {formatCurrency(reminder.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="reminder-details">
                    <div className="description">
                      {reminder.description}
                    </div>
                    
                    {packageInfo && (
                      <div className="package-info">
                        <h4>{packageInfo.name}</h4>
                        <p>{packageInfo.description}</p>
                        <div className="package-benefits">
                          {packageInfo.benefits.slice(0, 3).map((benefit, index) => (
                            <span key={index} className="benefit-tag">
                              ✓ {benefit}
                            </span>
                          ))}
                          {packageInfo.benefits.length > 3 && (
                            <span className="more-benefits">
                              +{packageInfo.benefits.length - 3} lợi ích khác
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="due-info">
                      <span className={`due-date ${reminder.isOverdue ? 'overdue' : ''}`}>
                        {reminder.isOverdue ? 'Đã quá hạn:' : 'Đến hạn:'} {formatDate(reminder.dueDate)}
                      </span>
                    </div>
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

        <div className="popup-footer">
          <div className="footer-info">
            <span className="total-amount">
              Tổng cần thanh toán: {formatCurrency(reminders.reduce((sum, r) => sum + r.amount, 0))}
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

export default PaymentReminderPopup;