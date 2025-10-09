// Shared Mock Data Service for Customer & Staff
// This service provides consistent sample data across the application

export interface Vehicle {
  id: string;
  model: string;
  licensePlate: string;
  year: number;
  color: string;
  vin: string;
  batteryCapacity: string;
  range: string;
  purchaseDate: string;
  nextMaintenance: string;
  mileage: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinDate: string;
  vehicleCount: number;
  totalServices: number;
  vehicles: Vehicle[];
  registeredDate?: Date;
  lastServiceDate?: Date;
  notes?: string;
}

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  vehicleId: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  scheduledDate: Date;
  scheduledTime: string;
  technicianId?: string;
  technicianName?: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  date: string;
  mileage: number;
  technicianName: string;
  cost: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  description: string;
  parts: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  features: string[];
}

// Mock Vehicles Data
export const mockVehicles: Vehicle[] = [
  {
    id: 'VEH001',
    model: 'VinFast VF8',
    licensePlate: '30A-12345',
    year: 2023,
    color: 'Xanh Đại Dương',
    vin: 'VF8ABC123456789',
    batteryCapacity: '87.7 kWh',
    range: '420 km',
    purchaseDate: '2023-06-15',
    nextMaintenance: '2025-02-15',
    mileage: 15000,
    status: 'active'
  },
  {
    id: 'VEH002',
    model: 'VinFast VF5',
    licensePlate: '29B-67890',
    year: 2024,
    color: 'Trắng Ngọc Trai',
    vin: 'VF5XYZ987654321',
    batteryCapacity: '37.23 kWh',
    range: '285 km',
    purchaseDate: '2024-03-20',
    nextMaintenance: '2025-03-20',
    mileage: 8000,
    status: 'active'
  },
  {
    id: 'VEH003',
    model: 'VinFast VF9',
    licensePlate: '51F-11111',
    year: 2024,
    color: 'Đen Huyền Bí',
    vin: 'VF9DEF555666777',
    batteryCapacity: '123 kWh',
    range: '680 km',
    purchaseDate: '2024-01-10',
    nextMaintenance: '2025-01-25',
    mileage: 12000,
    status: 'active'
  }
];

// Mock Customers Data
export const mockCustomers: Customer[] = [
  {
    id: 'CUST001',
    name: 'Nguyễn Văn Khách',
    email: 'customer@evservice.vn',
    phone: '0987654321',
    address: '123 Đường Láng, Đống Đa, Hà Nội',
    joinDate: '2023-06-15',
    vehicleCount: 2,
    totalServices: 12,
    vehicles: [mockVehicles[0], mockVehicles[1]],
    registeredDate: new Date('2023-06-15'),
    lastServiceDate: new Date('2024-12-15'),
    notes: 'Khách hàng thân thiết, ưu tiên dịch vụ'
  },
  {
    id: 'CUST002',
    name: 'Trần Thị Lan',
    email: 'customer2@evservice.vn',
    phone: '0912345678',
    address: '456 Nguyễn Trãi, Thanh Xuân, Hà Nội',
    joinDate: '2024-01-10',
    vehicleCount: 1,
    totalServices: 5,
    vehicles: [mockVehicles[2]],
    registeredDate: new Date('2024-01-10'),
    lastServiceDate: new Date('2024-10-10')
  },
  {
    id: 'CUST003',
    name: 'Lê Minh Tuấn',
    email: 'tuanle@gmail.com',
    phone: '0909876543',
    address: '789 Giải Phóng, Hoàng Mai, Hà Nội',
    joinDate: '2023-09-20',
    vehicleCount: 1,
    totalServices: 8,
    vehicles: [],
    registeredDate: new Date('2023-09-20'),
    lastServiceDate: new Date('2024-11-20')
  }
];

// Mock Appointments Data
export const mockAppointments: Appointment[] = [
  {
    id: 'APT001',
    customerId: 'CUST001',
    customerName: 'Nguyễn Văn Khách',
    phone: '0987654321',
    vehicleId: 'VEH001',
    vehicleModel: 'VinFast VF8',
    licensePlate: '30A-12345',
    serviceType: 'Bảo dưỡng định kỳ 15.000km',
    scheduledDate: new Date('2025-01-20'),
    scheduledTime: '09:00',
    technicianId: 'TECH001',
    technicianName: 'Hoàng Văn Kỹ',
    status: 'confirmed',
    notes: 'Khách hàng yêu cầu kiểm tra hệ thống phanh',
    createdAt: new Date('2025-01-10'),
    priority: 'high'
  },
  {
    id: 'APT002',
    customerId: 'CUST001',
    customerName: 'Nguyễn Văn Khách',
    phone: '0987654321',
    vehicleId: 'VEH002',
    vehicleModel: 'VinFast VF5',
    licensePlate: '29B-67890',
    serviceType: 'Kiểm tra pin và hệ thống điện',
    scheduledDate: new Date('2025-01-22'),
    scheduledTime: '14:00',
    status: 'pending',
    notes: 'Xe có hiện tượng sụt pin bất thường',
    createdAt: new Date('2025-01-12'),
    priority: 'medium'
  },
  {
    id: 'APT003',
    customerId: 'CUST002',
    customerName: 'Trần Thị Lan',
    phone: '0912345678',
    vehicleId: 'VEH003',
    vehicleModel: 'VinFast VF9',
    licensePlate: '51F-11111',
    serviceType: 'Bảo dưỡng định kỳ 10.000km',
    scheduledDate: new Date('2025-01-25'),
    scheduledTime: '10:00',
    technicianId: 'TECH002',
    technicianName: 'Đỗ Văn Thuật',
    status: 'confirmed',
    createdAt: new Date('2025-01-13'),
    priority: 'medium'
  },
  {
    id: 'APT004',
    customerId: 'CUST003',
    customerName: 'Lê Minh Tuấn',
    phone: '0909876543',
    vehicleId: 'VEH001',
    vehicleModel: 'VinFast VF8',
    licensePlate: '30A-99999',
    serviceType: 'Thay lốp xe',
    scheduledDate: new Date('2025-01-18'),
    scheduledTime: '15:30',
    status: 'pending',
    createdAt: new Date('2025-01-15'),
    priority: 'low'
  }
];

// Mock Maintenance History
export const mockMaintenanceHistory: MaintenanceRecord[] = [
  {
    id: 'MAINT001',
    vehicleId: 'VEH001',
    vehicleModel: 'VinFast VF8',
    licensePlate: '30A-12345',
    serviceType: 'Bảo dưỡng định kỳ 10.000km',
    date: '2024-12-15',
    mileage: 10000,
    technicianName: 'Hoàng Văn Kỹ',
    cost: 1200000,
    status: 'completed',
    description: 'Thay dầu phanh, kiểm tra hệ thống treo, cân bằng bánh xe',
    parts: [
      { name: 'Dầu phanh DOT 4', quantity: 1, price: 150000 },
      { name: 'Lọc gió cabin', quantity: 1, price: 200000 },
      { name: 'Công thợ', quantity: 1, price: 850000 }
    ]
  },
  {
    id: 'MAINT002',
    vehicleId: 'VEH001',
    vehicleModel: 'VinFast VF8',
    licensePlate: '30A-12345',
    serviceType: 'Kiểm tra pin',
    date: '2024-11-20',
    mileage: 8500,
    technicianName: 'Đỗ Văn Thuật',
    cost: 500000,
    status: 'completed',
    description: 'Kiểm tra dung lượng pin, cập nhật phần mềm BMS',
    parts: [
      { name: 'Kiểm tra chẩn đoán', quantity: 1, price: 300000 },
      { name: 'Cập nhật phần mềm', quantity: 1, price: 200000 }
    ]
  },
  {
    id: 'MAINT003',
    vehicleId: 'VEH002',
    vehicleModel: 'VinFast VF5',
    licensePlate: '29B-67890',
    serviceType: 'Bảo dưỡng định kỳ 5.000km',
    date: '2024-10-10',
    mileage: 5000,
    technicianName: 'Hoàng Văn Kỹ',
    cost: 800000,
    status: 'completed',
    description: 'Kiểm tra tổng thể, thay lọc gió, kiểm tra hệ thống phanh',
    parts: [
      { name: 'Lọc gió cabin', quantity: 1, price: 180000 },
      { name: 'Nước rửa kính', quantity: 2, price: 120000 },
      { name: 'Công thợ', quantity: 1, price: 500000 }
    ]
  }
];

// Mock Service Packages
export const mockServicePackages: ServicePackage[] = [
  {
    id: 'PKG001',
    name: 'Gói Bảo dưỡng Cơ bản',
    description: 'Bảo dưỡng định kỳ cho xe điện',
    price: 800000,
    duration: '1-2 giờ',
    features: [
      'Kiểm tra hệ thống phanh',
      'Kiểm tra áp suất lốp',
      'Thay lọc gió cabin',
      'Kiểm tra đèn chiếu sáng',
      'Rửa xe miễn phí'
    ]
  },
  {
    id: 'PKG002',
    name: 'Gói Bảo dưỡng Nâng cao',
    description: 'Bảo dưỡng toàn diện hệ thống xe điện',
    price: 1500000,
    duration: '2-3 giờ',
    features: [
      'Tất cả dịch vụ gói Cơ bản',
      'Kiểm tra pin và BMS',
      'Cập nhật phần mềm xe',
      'Kiểm tra hệ thống treo',
      'Cân bằng và căn chỉnh bánh xe',
      'Đánh bóng ngoại thất'
    ]
  },
  {
    id: 'PKG003',
    name: 'Gói Bảo dưỡng VIP',
    description: 'Chăm sóc xe toàn diện cao cấp',
    price: 2500000,
    duration: '3-4 giờ',
    features: [
      'Tất cả dịch vụ gói Nâng cao',
      'Vệ sinh khử khuẩn nội thất',
      'Phủ ceramic mini',
      'Kiểm tra và bảo dưỡng động cơ điện',
      'Ưu tiên đặt lịch',
      'Xe đưa đón miễn phí'
    ]
  }
];

// Helper functions to get data
export const getVehicleById = (id: string): Vehicle | undefined => {
  return mockVehicles.find(v => v.id === id);
};

export const getCustomerById = (id: string): Customer | undefined => {
  return mockCustomers.find(c => c.id === id);
};

export const getAppointmentById = (id: string): Appointment | undefined => {
  return mockAppointments.find(a => a.id === id);
};

export const getVehiclesByCustomerId = (customerId: string): Vehicle[] => {
  const customer = getCustomerById(customerId);
  return customer?.vehicles || [];
};

export const getAppointmentsByCustomerId = (customerId: string): Appointment[] => {
  return mockAppointments.filter(a => a.customerId === customerId);
};

export const getMaintenanceByVehicleId = (vehicleId: string): MaintenanceRecord[] => {
  return mockMaintenanceHistory.filter(m => m.vehicleId === vehicleId);
};

export const getAllCustomers = (): Customer[] => mockCustomers;
export const getAllVehicles = (): Vehicle[] => mockVehicles;
export const getAllAppointments = (): Appointment[] => mockAppointments;
export const getAllMaintenanceRecords = (): MaintenanceRecord[] => mockMaintenanceHistory;
export const getAllServicePackages = (): ServicePackage[] => mockServicePackages;
