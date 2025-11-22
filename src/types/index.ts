/**
 * Type Definitions Module
 * Định nghĩa tất cả types, interfaces và enums cho toàn bộ ứng dụng
 * @module types/index
 */

// ==================== User and Authentication Types ====================

/**
 * User Interface
 * Định nghĩa thông tin cơ bản của user trong hệ thống
 * @interface User
 */
export interface User {
  /** UUID của user */
  id: string;
  /** Email đăng nhập */
  email: string;
  /** Tên */
  firstName: string;
  /** Họ */
  lastName: string;
  /** Số điện thoại (optional) */
  phone?: string;
  /** Vai trò của user trong hệ thống */
  role: UserRole;
  /** URL ảnh đại diện (optional) */
  avatar?: string;
  /** Ngày tạo tài khoản */
  createdAt: Date;
  /** Ngày cập nhật cuối */
  updatedAt: Date;
}

/**
 * User Role Enum
 * Các vai trò user trong hệ thống
 * @enum UserRole
 */
export enum UserRole {
  /** Khách hàng - đặt lịch và sử dụng dịch vụ */
  CUSTOMER = 'customer',
  /** Nhân viên - quản lý lịch hẹn và khách hàng */
  STAFF = 'staff',
  /** Kỹ thuật viên - thực hiện bảo dưỡng */
  TECHNICIAN = 'technician',
  /** Quản trị viên - toàn quyền hệ thống */
  ADMIN = 'admin'
}

/**
 * Auth State Interface
 * State quản lý authentication trong ứng dụng
 * @interface AuthState
 */
export interface AuthState {
  /** User hiện tại (null nếu chưa đăng nhập) */
  user: User | null;
  /** JWT token (null nếu chưa đăng nhập) */
  token: string | null;
  /** Trạng thái đăng nhập */
  isAuthenticated: boolean;
  /** Trạng thái loading khi xác thực */
  isLoading: boolean;
  /** Lỗi xác thực (null nếu không có lỗi) */
  error: string | null;
}

// ==================== Vehicle Types ====================

/**
 * Vehicle Interface
 * Định nghĩa thông tin chi tiết của xe điện
 * @interface Vehicle
 */
export interface Vehicle {
  /** UUID của vehicle */
  id: string;
  /** UUID của customer sở hữu */
  customerId: string;
  /** Hãng xe (Tesla, VinFast, etc.) */
  make: string;
  /** Model xe (Model 3, VF8, etc.) */
  model: string;
  /** Năm sản xuất */
  year: number;
  /** Số VIN (Vehicle Identification Number) */
  vin: string;
  /** Biển số xe */
  licensePlate: string;
  /** Màu sắc */
  color: string;
  /** Dung lượng pin (kWh) */
  batteryCapacity: number;
  /** Số km đã đi */
  mileage: number;
  /** Ngày mua xe */
  purchaseDate: Date;
  /** Ngày hết hạn bảo hành (null nếu không có) */
  warrantyExpiration: Date | null;
  /** URL ảnh xe từ database (optional) */
  imageUrl?: string;
  /** Ngày tạo record */
  createdAt: Date;
  /** Ngày cập nhật cuối */
  updatedAt: Date;
}

// ==================== Service and Maintenance Types ====================

/**
 * Service Type Interface
 * Định nghĩa loại dịch vụ bảo dưỡng
 * @interface ServiceType
 */
export interface ServiceType {
  /** UUID của service type */
  id: string;
  /** Tên dịch vụ */
  name: string;
  /** Mô tả chi tiết */
  description: string;
  /** Giá cơ bản (VND) */
  basePrice: number;
  /** Thời gian ước tính (phút) */
  estimatedDuration: number;
  /** Danh mục dịch vụ */
  category: ServiceCategory;
  /** Trạng thái hoạt động */
  isActive: boolean;
}

/**
 * Service Category Enum
 * Các danh mục dịch vụ
 * @enum ServiceCategory
 */
export enum ServiceCategory {
  /** Bảo dưỡng định kỳ */
  REGULAR_MAINTENANCE = 'regular_maintenance',
  /** Sửa chữa */
  REPAIR = 'repair',
  /** Kiểm tra */
  INSPECTION = 'inspection',
  /** Dịch vụ pin */
  BATTERY_SERVICE = 'battery_service',
  /** Cập nhật phần mềm */
  SOFTWARE_UPDATE = 'software_update'
}

/**
 * Service Appointment Interface
 * Định nghĩa lịch hẹn dịch vụ bảo dưỡng
 * @interface ServiceAppointment
 */
export interface ServiceAppointment {
  /** UUID của appointment */
  id: string;
  /** UUID của customer */
  customerId: string;
  /** Tên customer (optional) */
  customerName?: string;
  /** UUID của vehicle */
  vehicleId: string;
  /** Biển số xe (optional) */
  vehicleLicensePlate?: string;
  /** Model xe (optional) */
  vehicleModel?: string;
  /** UUID của service package */
  servicePackageId: string;
  /** Tên gói dịch vụ (optional) */
  servicePackageName?: string;
  /** UUID của service center (optional) */
  serviceCenterId?: string;
  /** Tên service center (optional) */
  serviceCenterName?: string;
  /** UUID của technician được phân công (optional) */
  technicianId?: string;
  /** Ngày giờ hẹn */
  appointmentDate: Date;
  /** @deprecated Sử dụng appointmentDate thay thế */
  scheduledDate?: Date;
  /** @deprecated Sử dụng servicePackageId thay thế */
  serviceTypeId?: string;
  /** Trạng thái lịch hẹn */
  status: AppointmentStatus;
  /** Độ ưu tiên (optional) */
  priority?: Priority;
  /** Ghi chú (optional) */
  notes?: string;
  /** Thời gian hoàn thành dự kiến (optional) */
  estimatedCompletion?: Date;
  /** Thời gian hoàn thành thực tế (optional) */
  actualCompletion?: Date;
  /** Ngày tạo (optional) */
  createdAt?: Date;
  /** Ngày cập nhật (optional) */
  updatedAt?: Date;
}

/**
 * Appointment Status Enum
 * Các trạng thái của lịch hẹn
 * @enum AppointmentStatus
 */
export enum AppointmentStatus {
  /** Chờ xác nhận */
  PENDING = 'pending',
  /** Đã xác nhận */
  CONFIRMED = 'confirmed',
  /** Đã phân công technician */
  ASSIGNED = 'assigned',
  /** Đang thực hiện */
  IN_PROGRESS = 'in_progress',
  /** Hoàn thành */
  COMPLETED = 'completed',
  /** Đã hủy */
  CANCELLED = 'cancelled',
  /** Khách không đến */
  NO_SHOW = 'no_show'
}

/**
 * Priority Enum
 * Độ ưu tiên của lịch hẹn
 * @enum Priority
 */
export enum Priority {
  /** Thấp */
  LOW = 'low',
  /** Trung bình */
  MEDIUM = 'medium',
  /** Cao */
  HIGH = 'high',
  /** Khẩn cấp */
  URGENT = 'urgent'
}

// ==================== Service Record Types ====================

/**
 * Service Record Interface
 * Hồ sơ chi tiết của một lần bảo dưỡng
 * @interface ServiceRecord
 */
export interface ServiceRecord {
  /** UUID của service record */
  id: string;
  /** UUID của appointment liên quan */
  appointmentId: string;
  /** UUID của vehicle */
  vehicleId: string;
  /** Model xe (từ backend response) */
  vehicleModel?: string;
  /** Biển số (từ backend response) */
  licensePlate?: string;
  /** UUID của technician thực hiện */
  technicianId: string;
  /** Loại dịch vụ */
  serviceType: ServiceType;
  /** Thời gian bắt đầu */
  startTime: Date;
  /** Thời gian kết thúc (optional) */
  endTime?: Date;
  /** Số km tại thời điểm bảo dưỡng */
  mileageAtService: number;
  /** Công việc đã thực hiện */
  workPerformed: string;
  /** Danh sách phụ tùng đã sử dụng */
  partsUsed: PartUsage[];
  /** Chi phí nhân công (VND) */
  laborCost: number;
  /** Chi phí phụ tùng (VND) */
  partsCost: number;
  /** Tổng chi phí (VND) */
  totalCost: number;
  /** Ghi chú từ khách hàng (optional) */
  customerNotes?: string;
  /** Ghi chú từ kỹ thuật viên (optional) */
  technicianNotes?: string;
  /** Kiểm tra chất lượng đã pass */
  qualityCheckPassed: boolean;
  /** Ngày hẹn bảo dưỡng tiếp theo (optional) */
  nextServiceDue?: Date;
  /** Thông tin bảo hành (optional) */
  warrantyInfo?: string;
  /** Danh sách URL ảnh (optional) */
  images?: string[];
  /** Ngày tạo */
  createdAt: Date;
  /** Ngày cập nhật */
  updatedAt: Date;
}

// ==================== Parts and Inventory Types ====================

/**
 * Part Interface
 * Định nghĩa phụ tùng trong kho
 * @interface Part
 */
export interface Part {
  /** UUID của part */
  id: string;
  /** Mã phụ tùng */
  partNumber: string;
  /** Tên phụ tùng */
  name: string;
  /** Mô tả */
  description: string;
  /** Nhà sản xuất */
  manufacturer: string;
  /** Danh mục phụ tùng */
  category: PartCategory;
  /** Danh sách model xe tương thích */
  compatibleModels: string[];
  /** Giá đơn vị (VND) */
  unitPrice: number;
  /** Số lượng tồn kho hiện tại */
  currentStock: number;
  /** Số lượng tồn kho tối thiểu */
  minimumStock: number;
  /** Vị trí trong kho */
  location: string;
  /** Nhà cung cấp */
  supplier: string;
  /** Trạng thái hoạt động */
  isActive: boolean;
  /** Ngày tạo */
  createdAt: Date;
  /** Ngày cập nhật */
  updatedAt: Date;
}

/**
 * Part Category Enum
 * Danh mục phụ tùng
 * @enum PartCategory
 */
export enum PartCategory {
  BATTERY = 'battery',
  MOTOR = 'motor',
  BRAKE = 'brake',
  TIRE = 'tire',
  ELECTRONICS = 'electronics',
  BODY = 'body',
  INTERIOR = 'interior',
  CHARGING = 'charging',
  COOLING = 'cooling',
  OTHER = 'other'
}

/**
 * Part Usage Interface
 * Phụ tùng đã sử dụng trong service record
 * @interface PartUsage
 */
export interface PartUsage {
  /** UUID của part */
  partId: string;
  /** Thông tin chi tiết part */
  part: Part;
  /** Số lượng đã sử dụng */
  quantity: number;
  /** Giá đơn vị tại thời điểm sử dụng (VND) */
  unitPrice: number;
  /** Tổng giá (quantity * unitPrice) */
  totalPrice: number;
}

/**
 * Inventory Transaction Interface
 * Giao dịch xuất/nhập kho
 * @interface InventoryTransaction
 */
export interface InventoryTransaction {
  /** UUID của transaction */
  id: string;
  /** UUID của part */
  partId: string;
  /** Loại giao dịch */
  type: TransactionType;
  /** Số lượng */
  quantity: number;
  /** Giá đơn vị (VND) */
  unitPrice: number;
  /** Tổng giá (VND) */
  totalPrice: number;
  /** Mã tham chiếu (service record ID, purchase order ID, etc.) */
  reference: string;
  /** Ghi chú (optional) */
  notes?: string;
  /** UUID của người tạo */
  createdBy: string;
  /** Ngày tạo */
  createdAt: Date;
}

/**
 * Transaction Type Enum
 * Loại giao dịch kho
 * @enum TransactionType
 */
export enum TransactionType {
  /** Nhập kho */
  STOCK_IN = 'stock_in',
  /** Xuất kho */
  STOCK_OUT = 'stock_out',
  /** Điều chỉnh */
  ADJUSTMENT = 'adjustment',
  /** Trả hàng */
  RETURN = 'return'
}

// ==================== Staff and Technician Types ====================

/**
 * Technician Interface
 * Kế thừa User, bổ sung thông tin kỹ thuật viên
 * @interface Technician
 * @extends User
 */
export interface Technician extends User {
  employeeId: string;
  specializations: Specialization[];
  certifications: Certification[];
  hourlyRate: number;
  isAvailable: boolean;
  workSchedule: WorkSchedule[];
}

export enum Specialization {
  BATTERY_SYSTEMS = 'battery_systems',
  ELECTRIC_MOTORS = 'electric_motors',
  CHARGING_SYSTEMS = 'charging_systems',
  ELECTRONICS = 'electronics',
  GENERAL_MAINTENANCE = 'general_maintenance',
  DIAGNOSTICS = 'diagnostics',
  SOFTWARE = 'software'
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: Date;
  expirationDate?: Date;
  certificateNumber: string;
  isValid: boolean;
}

export interface WorkSchedule {
  id: string;
  technicianId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isActive: boolean;
}

// ==================== Payment and Financial Types ====================

/**
 * Payment Interface
 * Thông tin thanh toán
 * @interface Payment
 */
export interface Payment {
  /** UUID của payment */
  id: string;
  /** UUID của service record */
  serviceRecordId: string;
  /** UUID của customer */
  customerId: string;
  /** Số tiền (VND) */
  amount: number;
  /** Phương thức thanh toán */
  method: PaymentMethod;
  /** Trạng thái thanh toán */
  status: PaymentStatus;
  /** Mã giao dịch (optional) */
  transactionId?: string;
  /** Thời gian thanh toán (optional) */
  paidAt?: Date;
  /** Thời gian hoàn tiền (optional) */
  refundedAt?: Date;
  /** Số tiền hoàn (optional) */
  refundAmount?: number;
  /** Ghi chú (optional) */
  notes?: string;
  /** Ngày tạo */
  createdAt: Date;
  /** Ngày cập nhật */
  updatedAt: Date;
}

/**
 * Payment Method Enum
 * Phương thức thanh toán
 * @enum PaymentMethod
 */
export enum PaymentMethod {
  /** Tiền mặt */
  CASH = 'cash',
  /** Thẻ */
  CARD = 'card',
  /** Chuyển khoản ngân hàng */
  BANK_TRANSFER = 'bank_transfer',
  /** Ví điện tử */
  E_WALLET = 'e_wallet',
  /** Tín dụng */
  CREDIT = 'credit'
}

/**
 * Payment Status Enum
 * Trạng thái thanh toán
 * @enum PaymentStatus
 */
export enum PaymentStatus {
  /** Chờ thanh toán */
  PENDING = 'pending',
  /** Đã thanh toán */
  COMPLETED = 'completed',
  /** Thất bại */
  FAILED = 'failed',
  /** Đã hoàn tiền */
  REFUNDED = 'refunded',
  /** Hoàn một phần */
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// ==================== Notification Types ====================

/**
 * Notification Interface
 * Thông báo hệ thống
 * @interface Notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  SERVICE_COMPLETED = 'service_completed',
  MAINTENANCE_DUE = 'maintenance_due',
  PAYMENT_DUE = 'payment_due',
  PART_LOW_STOCK = 'part_low_stock',
  SYSTEM_ALERT = 'system_alert'
}

// Customer Notification Types
export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  customerId: string;
  reminderType: ReminderType;
  dueDate: Date;
  dueKilometers?: number;
  currentKilometers?: number;
  serviceType: string;
  isOverdue: boolean;
  lastReminderSent?: Date;
  isActive: boolean;
}

export enum ReminderType {
  REGULAR_MAINTENANCE = 'regular_maintenance',
  BATTERY_CHECK = 'battery_check',
  TIRE_ROTATION = 'tire_rotation',
  BRAKE_INSPECTION = 'brake_inspection',
  SOFTWARE_UPDATE = 'software_update'
}

export interface PaymentReminder {
  id: string;
  customerId: string;
  type: PaymentReminderType;
  amount: number;
  dueDate: Date;
  description: string;
  servicePackageId?: string;
  isOverdue: boolean;
  lastReminderSent?: Date;
}

export enum PaymentReminderType {
  MAINTENANCE_PACKAGE = 'maintenance_package',
  SERVICE_RENEWAL = 'service_renewal',
  OUTSTANDING_BILL = 'outstanding_bill'
}

// ==================== Service Center Types ====================

/**
 * Service Center Interface
 * Thông tin trung tâm bảo dưỡng
 * @interface ServiceCenter
 */
export interface ServiceCenter {
  /** UUID của service center */
  id: string;
  /** Tên trung tâm */
  name: string;
  /** Địa chỉ */
  address: string;
  /** Số điện thoại */
  phone: string;
  /** Email */
  email: string;
  /** Giờ hoạt động */
  operatingHours: OperatingHours[];
  /** Danh sách dịch vụ cung cấp */
  services: string[];
  /** Trạng thái hoạt động */
  isActive: boolean;
  /** Đánh giá trung bình (0-5) */
  rating: number;
  /** Tổng số đánh giá */
  totalReviews: number;
  /** Tọa độ GPS (optional) */
  coordinates?: {
    /** Vĩ độ */
    lat: number;
    /** Kinh độ */
    lng: number;
  };
}

/**
 * Operating Hours Interface
 * Giờ hoạt động theo ngày
 * @interface OperatingHours
 */
export interface OperatingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string; // HH:MM format
  closeTime: string; // HH:MM format
  isOpen: boolean;
}

// Maintenance Package Types
export interface MaintenancePackage {
  id: string;
  name: string;
  description: string;
  duration: number; // in months
  price: number;
  services: ServiceType[];
  benefits: string[];
  isActive: boolean;
  popularity: number;
}

// ==================== Dashboard and Analytics Types ====================

/**
 * Dashboard Stats Interface
 * Thống kê tổng quan cho dashboard
 * @interface DashboardStats
 */
export interface DashboardStats {
  /** Tổng số xe */
  totalVehicles: number;
  /** Số lịch hẹn hôm nay */
  todaysAppointments: number;
  /** Số lịch hẹn chờ xử lý */
  pendingAppointments: number;
  /** Số dịch vụ đang thực hiện */
  inProgressServices: number;
  /** Số dịch vụ hoàn thành hôm nay */
  completedToday: number;
  /** Doanh thu theo thời gian */
  revenue: {
    /** Doanh thu hôm nay (VND) */
    today: number;
    /** Doanh thu tuần này (VND) */
    thisWeek: number;
    /** Doanh thu tháng này (VND) */
    thisMonth: number;
    /** Doanh thu năm nay (VND) */
    thisYear: number;
  };
  /** Top dịch vụ phổ biến */
  topServices: ServiceTypeStats[];
  /** Hiệu suất kỹ thuật viên */
  technicianPerformance: TechnicianStats[];
  /** Phụ tùng sắp hết hàng */
  lowStockParts: Part[];
}

/**
 * Service Type Stats Interface
 * Thống kê theo loại dịch vụ
 * @interface ServiceTypeStats
 */
export interface ServiceTypeStats {
  /** Loại dịch vụ */
  serviceType: ServiceType;
  /** Số lượng */
  count: number;
  /** Doanh thu (VND) */
  revenue: number;
}

/**
 * Technician Stats Interface
 * Thống kê hiệu suất kỹ thuật viên
 * @interface TechnicianStats
 */
export interface TechnicianStats {
  /** Thông tin kỹ thuật viên */
  technician: Technician;
  /** Số dịch vụ hoàn thành */
  completedServices: number;
  /** Đánh giá trung bình */
  avgRating: number;
  /** Tổng doanh thu (VND) */
  totalRevenue: number;
  /** Hiệu suất (%) */
  efficiency: number;
}

// ==================== API Response Types ====================

/**
 * API Response Interface
 * Format chuẩn của API response
 * @interface ApiResponse
 * @template T - Type của data trả về
 */
export interface ApiResponse<T> {
  /** Trạng thái thành công */
  success: boolean;
  /** Dữ liệu trả về (optional) */
  data?: T;
  /** Thông báo (optional) */
  message?: string;
  /** Danh sách lỗi (optional) */
  errors?: string[];
  /** Thông tin phân trang (optional) */
  pagination?: PaginationInfo;
}

/**
 * Pagination Info Interface
 * Thông tin phân trang
 * @interface PaginationInfo
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// ==================== Form Types ====================

/**
 * Login Form Data Interface
 * Dữ liệu form đăng nhập
 * @interface LoginFormData
 */
export interface LoginFormData {
  /** Email đăng nhập */
  email: string;
  /** Mật khẩu */
  password: string;
  /** Ghi nhớ đăng nhập */
  remember: boolean;
}

/**
 * Register Form Data Interface
 * Dữ liệu form đăng ký
 * @interface RegisterFormData
 */
export interface RegisterFormData {
  /** Tên */
  firstName: string;
  /** Họ */
  lastName: string;
  /** Email */
  email: string;
  /** Số điện thoại */
  phone: string;
  /** Mật khẩu */
  password: string;
  /** Xác nhận mật khẩu */
  confirmPassword: string;
  /** Vai trò */
  role: UserRole;
}

/**
 * Vehicle Form Data Interface
 * Dữ liệu form đăng ký xe
 * @interface VehicleFormData
 */
export interface VehicleFormData {
  /** Hãng xe */
  make: string;
  /** Model */
  model: string;
  /** Năm sản xuất */
  year: number;
  /** Số VIN */
  vin: string;
  /** Biển số */
  licensePlate: string;
  /** Màu sắc */
  color: string;
  /** Dung lượng pin (kWh) */
  batteryCapacity: number;
  /** Số km */
  mileage: number;
  /** Ngày mua (string format) */
  purchaseDate: string;
}

/**
 * Appointment Form Data Interface
 * Dữ liệu form đặt lịch hẹn
 * @interface AppointmentFormData
 */
export interface AppointmentFormData {
  vehicleId: string;
  serviceTypeId: string;
  scheduledDate: string;
  scheduledTime: string;
  priority: Priority;
  notes?: string;
}

// ==================== Filter and Search Types ====================

/**
 * Service Filter Interface
 * Bộ lọc cho danh sách dịch vụ
 * @interface ServiceFilter
 */
export interface ServiceFilter {
  /** Lọc theo trạng thái (optional) */
  status?: AppointmentStatus[];
  /** Lọc từ ngày (optional) */
  dateFrom?: Date;
  /** Lọc đến ngày (optional) */
  dateTo?: Date;
  /** Lọc theo technician (optional) */
  technicianId?: string;
  /** Lọc theo loại dịch vụ (optional) */
  serviceTypeId?: string;
  /** Lọc theo độ ưu tiên (optional) */
  priority?: Priority[];
}

/**
 * Part Filter Interface
 * Bộ lọc cho danh sách phụ tùng
 * @interface PartFilter
 */
export interface PartFilter {
  /** Lọc theo danh mục (optional) */
  category?: PartCategory[];
  /** Chỉ hiển thị sắp hết hàng (optional) */
  lowStock?: boolean;
  /** Lọc theo nhà sản xuất (optional) */
  manufacturer?: string;
  /** Tìm kiếm text (optional) */
  search?: string;
}

/**
 * Search Params Interface
 * Tham số tìm kiếm và phân trang chung
 * @interface SearchParams
 */
export interface SearchParams {
  /** Từ khóa tìm kiếm (optional) */
  query?: string;
  /** Số trang (optional) */
  page?: number;
  /** Số items mỗi trang (optional) */
  limit?: number;
  /** Sắp xếp theo field (optional) */
  sortBy?: string;
  /** Thứ tự sắp xếp (optional) */
  sortOrder?: 'asc' | 'desc';
}