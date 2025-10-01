import React from 'react';
import { MaintenanceReminder, Vehicle } from '../../../types';
import { MDButton } from '../../ui';
import './MaintenanceReminderPopup.css';

interface MaintenanceReminderPopupProps {
  reminders: MaintenanceReminder[];
  vehicles: Vehicle[];
  isOpen: boolean;
  onClose: () => void;
  onScheduleService: (reminderId: string) => void;
  onSnooze: (reminderId: string, days: number) => void;
}

const MaintenanceReminderPopup: React.FC<MaintenanceReminderPopupProps> = ({
  reminders,
  vehicles,
  isOpen,
  onClose,
  onScheduleService,
  onSnooze
}) => {
  if (!isOpen || reminders.length === 0) return null;

  const getVehicleInfo = (vehicleId: string) => {
    return vehicles.find(v => v.id === vehicleId);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getDaysOverdue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getReminderTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      'regular_maintenance': 'Bảo dưỡng định kỳ',
      'battery_check': 'Kiểm tra pin',
      'tire_rotation': 'Thay lốp xe',
      'brake_inspection': 'Kiểm tra phanh',
      'software_update': 'Cập nhật phần mềm'
    };
    return types[type] || type;
  };

  return (
    <div className="maintenance-reminder-overlay">
      <div className="maintenance-reminder-popup">
        <div className="popup-header">
          <h2>🔔 Nhắc nhở bảo dưỡng</h2>
        </div>

        <div className="popup-content">
          <p className="popup-intro">
            Xe của bạn cần được bảo dưỡng. Hãy đặt lịch để đảm bảo xe luôn hoạt động tốt nhất!
          </p>

          <div className="reminders-list">
            {reminders.map((reminder) => {
              const vehicle = getVehicleInfo(reminder.vehicleId);
              const daysOverdue = getDaysOverdue(reminder.dueDate);
              
              return (
                <div key={reminder.id} className={`reminder-item ${reminder.isOverdue ? 'overdue' : ''}`}>
                  <div className="reminder-header">
                    <div className="vehicle-info">
                      <h3>{vehicle?.make} {vehicle?.model}</h3>
                      <span className="vehicle-year">{vehicle?.year}</span>
                      <span className="license-plate">{vehicle?.licensePlate}</span>
                    </div>
                    {reminder.isOverdue && (
                      <span className="overdue-badge">
                        Quá hạn {daysOverdue} ngày
                      </span>
                    )}
                  </div>

                  <div className="reminder-details">
                    <div className="service-info">
                      <span className="service-type">
                        {getReminderTypeText(reminder.serviceType)}
                      </span>
                      <span className="due-info">
                        Đến hạn: {formatDate(reminder.dueDate)}
                        {reminder.dueKilometers && (
                          <span> hoặc {reminder.dueKilometers.toLocaleString()} km</span>
                        )}
                      </span>
                    </div>

                    {reminder.currentKilometers && reminder.dueKilometers && (
                      <div className="mileage-progress">
                        <div className="progress-label">
                          Số km hiện tại: {reminder.currentKilometers.toLocaleString()} / {reminder.dueKilometers.toLocaleString()}
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${Math.min((reminder.currentKilometers / reminder.dueKilometers) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="reminder-actions">
                    <MDButton
                      variant="filled"
                      onClick={() => onScheduleService(reminder.id)}
                    >
                      Đặt lịch ngay
                    </MDButton>
                    <MDButton
                      variant="outlined"
                      onClick={() => onSnooze(reminder.id, 7)}
                    >
                      Nhắc lại sau 7 ngày
                    </MDButton>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="popup-footer">
          <div className="footer-spacer"></div>
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

export default MaintenanceReminderPopup;