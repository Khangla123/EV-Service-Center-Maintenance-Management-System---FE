// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'customer',
  STAFF = 'staff',
  TECHNICIAN = 'technician',
  ADMIN = 'admin'
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  batteryCapacity: number;
  mileage: number;
  purchaseDate: Date;
  warrantyExpiration: Date | null;
  imageUrl?: string; // URL ảnh xe từ database
  createdAt: Date;
  updatedAt: Date;
}

// Service and Maintenance Types
export interface ServiceType {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  estimatedDuration: number; // in minutes
  category: ServiceCategory;
  isActive: boolean;
}

export enum ServiceCategory {
  REGULAR_MAINTENANCE = 'regular_maintenance',
  REPAIR = 'repair',
  INSPECTION = 'inspection',
  BATTERY_SERVICE = 'battery_service',
  SOFTWARE_UPDATE = 'software_update'
}

export interface ServiceAppointment {
  id: string;
  customerId: string;
  customerName?: string;
  vehicleId: string;
  vehicleLicensePlate?: string;
  vehicleModel?: string;
  servicePackageId: string;
  servicePackageName?: string;
  serviceCenterId?: string;
  serviceCenterName?: string;
  technicianId?: string;
  appointmentDate: Date;
  scheduledDate?: Date; // deprecated, use appointmentDate
  serviceTypeId?: string; // deprecated, use servicePackageId
  status: AppointmentStatus;
  priority?: Priority;
  notes?: string;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Service Record Types
export interface ServiceRecord {
  id: string;
  appointmentId: string;
  vehicleId: string;
  vehicleModel?: string; // From backend response
  licensePlate?: string; // From backend response
  technicianId: string;
  serviceType: ServiceType;
  startTime: Date;
  endTime?: Date;
  mileageAtService: number;
  workPerformed: string;
  partsUsed: PartUsage[];
  laborCost: number;
  partsCost: number;
  totalCost: number;
  customerNotes?: string;
  technicianNotes?: string;
  qualityCheckPassed: boolean;
  nextServiceDue?: Date;
  warrantyInfo?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Parts and Inventory Types
export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  manufacturer: string;
  category: PartCategory;
  compatibleModels: string[];
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  location: string;
  supplier: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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

export interface PartUsage {
  partId: string;
  part: Part;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InventoryTransaction {
  id: string;
  partId: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  reference: string; // service record ID, purchase order ID, etc.
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export enum TransactionType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return'
}

// Staff and Technician Types
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

// Payment and Financial Types
export interface Payment {
  id: string;
  serviceRecordId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  refundAmount?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  CREDIT = 'credit'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// Notification Types
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

// Service Center Types
export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: OperatingHours[];
  services: string[];
  isActive: boolean;
  rating: number;
  totalReviews: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

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

// Dashboard and Analytics Types
export interface DashboardStats {
  totalVehicles: number;
  todaysAppointments: number;
  pendingAppointments: number;
  inProgressServices: number;
  completedToday: number;
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    thisYear: number;
  };
  topServices: ServiceTypeStats[];
  technicianPerformance: TechnicianStats[];
  lowStockParts: Part[];
}

export interface ServiceTypeStats {
  serviceType: ServiceType;
  count: number;
  revenue: number;
}

export interface TechnicianStats {
  technician: Technician;
  completedServices: number;
  avgRating: number;
  totalRevenue: number;
  efficiency: number; // percentage
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface VehicleFormData {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  batteryCapacity: number;
  mileage: number;
  purchaseDate: string;
}

export interface AppointmentFormData {
  vehicleId: string;
  serviceTypeId: string;
  scheduledDate: string;
  scheduledTime: string;
  priority: Priority;
  notes?: string;
}

// Filter and Search Types
export interface ServiceFilter {
  status?: AppointmentStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  technicianId?: string;
  serviceTypeId?: string;
  priority?: Priority[];
}

export interface PartFilter {
  category?: PartCategory[];
  lowStock?: boolean;
  manufacturer?: string;
  search?: string;
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}