/**
 * NotificationContext.tsx - Notification Management Context
 * 
 * Context quản lý các thông báo và nhắc nhở cho khách hàng.
 * Bao gồm nhắc nhở bảo dưỡng và thanh toán.
 * 
 * Chức năng chính:
 * - Quản lý maintenance reminders (nhắc nhở bảo dưỡng)
 * - Quản lý payment reminders (nhắc nhở thanh toán)
 * - Quản lý danh sách xe và gói bảo dưỡng
 * - Đánh dấu thông báo đã đọc
 * - Hiển thị/ẩn popup thông báo
 * 
 * @module NotificationContext
 */

// React core imports
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Type imports - Định nghĩa kiểu dữ liệu
import { 
  MaintenanceReminder, 
  PaymentReminder, 
  Vehicle, 
  MaintenancePackage, 
  ReminderType, 
  PaymentReminderType 
} from '../types';

/**
 * NotificationContextState - Kiểu dữ liệu cho NotificationContext
 * 
 * Định nghĩa các properties và methods mà NotificationContext cung cấp.
 * 
 * @interface NotificationContextState
 * 
 * State properties:
 * @property {MaintenanceReminder[]} maintenanceReminders - Danh sách nhắc nhở bảo dưỡng
 * @property {PaymentReminder[]} paymentReminders - Danh sách nhắc nhở thanh toán
 * @property {Vehicle[]} vehicles - Danh sách xe của customer
 * @property {MaintenancePackage[]} packages - Danh sách gói bảo dưỡng
 * @property {boolean} showMaintenanceReminder - Hiển thị popup bảo dưỡng
 * @property {boolean} showPaymentReminder - Hiển thị popup thanh toán
 * @property {Set<string>} readNotifications - Set các ID thông báo đã đọc
 * 
 * Setter methods:
 * @property {Function} setMaintenanceReminders - Cập nhật danh sách nhắc nhở bảo dưỡng
 * @property {Function} setPaymentReminders - Cập nhật danh sách nhắc nhở thanh toán
 * @property {Function} setVehicles - Cập nhật danh sách xe
 * @property {Function} setPackages - Cập nhật danh sách gói bảo dưỡng
 * @property {Function} setShowMaintenanceReminder - Hiển/ẩn popup bảo dưỡng
 * @property {Function} setShowPaymentReminder - Hiển/ẩn popup thanh toán
 * 
 * Action methods:
 * @property {Function} markNotificationAsRead - Đánh dấu thông báo đã đọc
 * @property {Function} loadNotifications - Load thông báo cho user
 */
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

/**
 * NotificationContext - Context object
 * Cung cấp notification state và methods cho toàn bộ component tree
 */
const NotificationContext = createContext<NotificationContextState | undefined>(undefined);

/**
 * NotificationProvider Component
 * 
 * Provider component cung cấp notification context cho component tree.
 * Quản lý state cho các loại thông báo và dữ liệu liên quan.
 * 
 * State management:
 * - maintenanceReminders: Nhắc nhở bảo dưỡng định kỳ
 * - paymentReminders: Nhắc nhở thanh toán
 * - vehicles: Danh sách xe để hiển thị trong reminder
 * - packages: Danh sách gói bảo dưỡng
 * - showMaintenanceReminder/showPaymentReminder: Control popup visibility
 * - readNotifications: Track các thông báo đã đọc
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State hooks - Quản lý các loại dữ liệu khác nhau
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<MaintenancePackage[]>([]);
  
  // UI state - Control hiển thị popup
  const [showMaintenanceReminder, setShowMaintenanceReminder] = useState(false);
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  
  // Tracking state - Set các thông báo đã đọc (dùng Set để tối ưu performance)
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  /**
   * markNotificationAsRead - Đánh dấu thông báo đã đọc
   * 
   * Thêm notification ID vào Set các thông báo đã đọc.
   * Sử dụng useCallback để tối ưu performance.
   * 
   * @param {string} notificationId - ID của thông báo cần đánh dấu
   */
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setReadNotifications(prev => new Set(prev).add(notificationId));
  }, []);

  /**
   * loadNotifications - Load toàn bộ thông báo cho user
   * 
   * Hiện tại sử dụng mock data.
   * TODO: Thay thế bằng API calls khi backend sẵn sàng.
   * 
   * @param {string} userId - ID của user cần load notifications
   * 
   * Loads:
   * - Maintenance reminders (nhắc nhở bảo dưỡng)
   * - Payment reminders (nhắc nhở thanh toán)
   * - User vehicles (danh sách xe)
   * - Available packages (gói bảo dưỡng)
   */
  const loadNotifications = useCallback((userId: string) => {
    // Mock maintenance reminders - TODO: Replace with API call
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

    // Mock payment reminders - TODO: Replace with API call
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

    // Mock vehicles - Danh sách xe của customer
    // TODO: Replace with API call
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

    // Mock packages - Danh sách gói bảo dưỡng
    // TODO: Replace with API call
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

    // Cập nhật tất cả state với mock data
    setMaintenanceReminders(mockMaintenanceReminders);
    setPaymentReminders(mockPaymentReminders);
    setVehicles(mockVehicles);
    setPackages(mockPackages);
  }, []);

  // Tạo context value object với tất cả state và methods
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

/**
 * useNotifications Hook
 * 
 * Custom hook để sử dụng NotificationContext trong components.
 * Tự động kiểm tra xem hook có được sử dụng trong NotificationProvider không.
 * 
 * @throws {Error} Nếu sử dụng ngoài NotificationProvider
 * @returns {NotificationContextState} Notification context value
 * 
 * @example
 * ```tsx
 * const { 
 *   maintenanceReminders, 
 *   showMaintenanceReminder,
 *   setShowMaintenanceReminder 
 * } = useNotifications();
 * 
 * // Hiển thị popup
 * setShowMaintenanceReminder(true);
 * ```
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
