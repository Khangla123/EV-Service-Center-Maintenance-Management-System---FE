import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { MaintenanceReminder, PaymentReminder, Vehicle, MaintenancePackage, ReminderType, PaymentReminderType } from '../types';

interface NotificationContextState {
  maintenanceReminders: MaintenanceReminder[];
  paymentReminders: PaymentReminder[];
  vehicles: Vehicle[];
  packages: MaintenancePackage[];
  showMaintenanceReminder: boolean;
  showPaymentReminder: boolean;
  readNotifications: Set<string>;
  setMaintenanceReminders: (reminders: MaintenanceReminder[]) => void;
  setPaymentReminders: (reminders: PaymentReminder[]) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
  setPackages: (packages: MaintenancePackage[]) => void;
  setShowMaintenanceReminder: (show: boolean) => void;
  setShowPaymentReminder: (show: boolean) => void;
  markNotificationAsRead: (notificationId: string) => void;
  loadNotifications: (userId: string) => void;
}

const NotificationContext = createContext<NotificationContextState | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<MaintenancePackage[]>([]);
  const [showMaintenanceReminder, setShowMaintenanceReminder] = useState(false);
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => new Set(prev).add(notificationId));
  }, []);

  const loadNotifications = useCallback((userId: string) => {
    // Mock maintenance reminders
    const mockMaintenanceReminders: MaintenanceReminder[] = [
      {
        id: '1',
        vehicleId: 'vehicle1',
        customerId: userId,
        reminderType: ReminderType.REGULAR_MAINTENANCE,
        dueDate: new Date('2024-10-01'),
        dueKilometers: 15000,
        currentKilometers: 14800,
        serviceType: 'regular_maintenance',
        isOverdue: false,
        isActive: true
      },
      {
        id: '2',
        vehicleId: 'vehicle2',
        customerId: userId,
        reminderType: ReminderType.BATTERY_CHECK,
        dueDate: new Date('2024-09-15'),
        serviceType: 'battery_check',
        isOverdue: true,
        lastReminderSent: new Date('2024-09-10'),
        isActive: true
      }
    ];

    // Mock payment reminders
    const mockPaymentReminders: PaymentReminder[] = [
      {
        id: '1',
        customerId: userId,
        type: PaymentReminderType.MAINTENANCE_PACKAGE,
        amount: 2500000,
        dueDate: new Date('2024-10-05'),
        description: 'Gói bảo dưỡng Premium - Gia hạn 12 tháng',
        servicePackageId: 'package1',
        isOverdue: false
      },
      {
        id: '2',
        customerId: userId,
        type: PaymentReminderType.OUTSTANDING_BILL,
        amount: 1200000,
        dueDate: new Date('2024-09-20'),
        description: 'Hóa đơn bảo dưỡng lần cuối chưa thanh toán',
        isOverdue: true,
        lastReminderSent: new Date('2024-09-18')
      }
    ];

    // Mock vehicles
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle1',
        customerId: userId,
        make: 'VinFast',
        model: 'VF8',
        year: 2023,
        vin: 'VF8ABC123456789',
        licensePlate: '30A-123.45',
        color: 'Đen',
        batteryCapacity: 87.7,
        mileage: 14800,
        purchaseDate: new Date('2023-05-15'),
        warrantyExpiration: new Date('2026-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vehicle2',
        customerId: userId,
        make: 'VinFast',
        model: 'VF9',
        year: 2023,
        vin: 'VF9XYZ987654321',
        licensePlate: '30B-678.90',
        color: 'Trắng',
        batteryCapacity: 123,
        mileage: 8500,
        purchaseDate: new Date('2023-08-10'),
        warrantyExpiration: new Date('2026-08-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Mock packages
    const mockPackages: MaintenancePackage[] = [
      {
        id: 'package1',
        name: 'Gói Bảo Dưỡng Premium',
        description: 'Gói bảo dưỡng toàn diện cho xe điện VinFast',
        duration: 12,
        price: 2500000,
        services: [],
        benefits: [
          'Bảo dưỡng định kỳ miễn phí',
          'Kiểm tra pin chuyên sâu',
          'Cập nhật phần mềm',
          'Hỗ trợ 24/7',
          'Ưu tiên đặt lịch'
        ],
        isActive: true,
        popularity: 85
      }
    ];

    setMaintenanceReminders(mockMaintenanceReminders);
    setPaymentReminders(mockPaymentReminders);
    setVehicles(mockVehicles);
    setPackages(mockPackages);
  }, []);

  const value: NotificationContextState = {
    maintenanceReminders,
    paymentReminders,
    vehicles,
    packages,
    showMaintenanceReminder,
    showPaymentReminder,
    readNotifications,
    setMaintenanceReminders,
    setPaymentReminders,
    setVehicles,
    setPackages,
    setShowMaintenanceReminder,
    setShowPaymentReminder,
    markNotificationAsRead,
    loadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
