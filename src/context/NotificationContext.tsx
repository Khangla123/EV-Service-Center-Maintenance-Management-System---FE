import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MaintenanceReminder, PaymentReminder, Vehicle, MaintenancePackage, ReminderType, PaymentReminderType, ServiceCategory } from '../types';
import { useNotificationState } from '../hooks/useNotificationState';

interface NotificationContextType {
  // State
  maintenanceReminders: MaintenanceReminder[];
  paymentReminders: PaymentReminder[];
  vehicles: Vehicle[];
  packages: MaintenancePackage[];
  totalNotifications: number;
  showUnifiedPopup: boolean;
  showHistory: boolean;
  hasBeenShown: boolean;
  
  // Actions
  setShowUnifiedPopup: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  handleOpenPopup: () => void;
  handleClosePopup: () => void;
  handleOpenHistory: () => void;
  handleCloseHistory: () => void;
  
  // Notification handlers
  handleScheduleService: (reminderId: string) => void;
  handlePayNow: (reminderId: string) => void;
  handleViewPaymentDetails: (reminderId: string) => void;
  handleSnooze: (reminderId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Notification state management
  const notificationState = useNotificationState({
    storageKey: 'homepage_notifications_dismissed',
    snoozeTimeout: 3 * 24 * 60 * 60 * 1000, // 3 days
    enableHistory: true
  });
  
  // State for notifications
  const [showUnifiedPopup, setShowUnifiedPopup] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  
  // State for data
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<MaintenancePackage[]>([]);

  // Load mock data
  useEffect(() => {
    // Mock maintenance reminders
    const mockMaintenanceReminders: MaintenanceReminder[] = [
      {
        id: '1',
        vehicleId: 'vehicle1',
        customerId: 'user123',
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
        vehicleId: 'vehicle1',
        customerId: 'user123',
        reminderType: ReminderType.BRAKE_INSPECTION,
        dueDate: new Date('2024-09-25'),
        dueKilometers: 14900,
        currentKilometers: 14800,
        serviceType: 'brake_inspection',
        isOverdue: true,
        isActive: true
      }
    ];

    // Mock payment reminders
    const mockPaymentReminders: PaymentReminder[] = [
      {
        id: '1',
        customerId: 'user123',
        type: PaymentReminderType.OUTSTANDING_BILL,
        amount: 2500000,
        dueDate: new Date('2024-09-20'),
        description: 'Bảo dưỡng định kỳ 15000km',
        isOverdue: true,
        lastReminderSent: new Date('2024-09-18')
      },
      {
        id: '2',
        customerId: 'user123',
        type: PaymentReminderType.MAINTENANCE_PACKAGE,
        amount: 1800000,
        dueDate: new Date('2024-10-05'),
        description: 'Thay dầu động cơ',
        isOverdue: false,
        servicePackageId: 'pkg1'
      }
    ];

    // Mock vehicles
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle1',
        customerId: 'user123',
        make: 'VinFast',
        model: 'VF8',
        year: 2023,
        vin: 'VF1234567890',
        licensePlate: '30A-12345',
        color: 'Xanh đen',
        batteryCapacity: 87.7,
        mileage: 14800,
        purchaseDate: new Date('2023-01-15'),
        warrantyExpiration: new Date('2026-01-15'),
        createdAt: new Date('2023-01-15'),
        updatedAt: new Date('2024-09-29')
      }
    ];

    // Mock maintenance packages
    const mockPackages: MaintenancePackage[] = [
      {
        id: 'pkg1',
        name: 'Bảo dưỡng định kỳ 15000km',
        description: 'Kiểm tra và bảo dưỡng toàn diện',
        price: 2500000,
        duration: 12,
        services: [],
        benefits: ['Kiểm tra phanh', 'Kiểm tra lốp', 'Thay dầu động cơ'],
        isActive: true,
        popularity: 5
      }
    ];

    setMaintenanceReminders(mockMaintenanceReminders);
    setPaymentReminders(mockPaymentReminders);
    setVehicles(mockVehicles);
    setPackages(mockPackages);
  }, []);

  const totalNotifications = maintenanceReminders.length + paymentReminders.length;

  // Show popup automatically on first visit if there are notifications
  useEffect(() => {
    if (totalNotifications > 0 && !hasBeenShown && !notificationState.isDismissed('homepage_notifications')) {
      setShowUnifiedPopup(true);
      setHasBeenShown(true);
    }
  }, [totalNotifications, hasBeenShown, notificationState]);

  // Notification handlers
  const handleOpenPopup = () => {
    console.log('🔔 Opening notification popup');
    setShowUnifiedPopup(true);
  };

  const handleClosePopup = () => {
    console.log('🔔 Closing notification popup');
    setShowUnifiedPopup(false);
    notificationState.dismissNotification('homepage_notifications');
  };

  const handleOpenHistory = () => {
    console.log('📚 Opening notification history');
    setShowHistory(true);
  };

  const handleCloseHistory = () => {
    console.log('📚 Closing notification history');
    setShowHistory(false);
  };

  const handleScheduleService = (reminderId: string) => {
    console.log('🔧 Scheduling service for reminder:', reminderId);
    notificationState.addToHistory({
      id: reminderId,
      type: 'maintenance',
      title: 'Lịch bảo trì đã được đặt',
      message: 'Lịch hẹn bảo trì đã được tạo thành công',
      priority: 'medium',
      actionTaken: 'scheduled'
    });
    
    setMaintenanceReminders(prev => 
      prev.filter(reminder => reminder.id !== reminderId)
    );
  };

  const handlePayNow = (reminderId: string) => {
    console.log('💳 Processing payment for reminder:', reminderId);
    notificationState.addToHistory({
      id: reminderId,
      type: 'payment',
      title: 'Thanh toán thành công',
      message: 'Thanh toán đã được xử lý thành công',
      priority: 'high',
      actionTaken: 'paid'
    });
    
    setPaymentReminders(prev => 
      prev.filter(reminder => reminder.id !== reminderId)
    );
  };

  const handleViewPaymentDetails = (reminderId: string) => {
    console.log('👁️ Viewing payment details for reminder:', reminderId);
  };

  const handleSnooze = (reminderId: string) => {
    console.log('😴 Snoozing reminder:', reminderId);
    notificationState.snoozeNotification(reminderId);
    notificationState.addToHistory({
      id: reminderId,
      type: 'info',
      title: 'Thông báo đã được hoãn',
      message: 'Thông báo sẽ hiện lại sau 3 ngày',
      priority: 'low',
      actionTaken: 'snoozed'
    });
  };

  const contextValue: NotificationContextType = {
    maintenanceReminders,
    paymentReminders,
    vehicles,
    packages,
    totalNotifications,
    showUnifiedPopup,
    showHistory,
    hasBeenShown,
    setShowUnifiedPopup,
    setShowHistory,
    handleOpenPopup,
    handleClosePopup,
    handleOpenHistory,
    handleCloseHistory,
    handleScheduleService,
    handlePayNow,
    handleViewPaymentDetails,
    handleSnooze,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};