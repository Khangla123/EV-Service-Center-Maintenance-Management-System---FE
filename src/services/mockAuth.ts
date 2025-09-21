import { User, UserRole } from '../types';

// Mock user data for testing
export const mockUsers: { [key: string]: User & { password: string } } = {
  // Customer accounts
  'customer@evservice.vn': {
    id: '1',
    email: 'customer@evservice.vn',
    password: '123456',
    firstName: 'Nguyễn',
    lastName: 'Văn Khách',
    phone: '0987654321',
    role: UserRole.CUSTOMER,
    avatar: undefined,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2025-01-18'),
  },
  'customer2@evservice.vn': {
    id: '2',
    email: 'customer2@evservice.vn',
    password: '123456',
    firstName: 'Trần',
    lastName: 'Thị Lan',
    phone: '0912345678',
    role: UserRole.CUSTOMER,
    avatar: undefined,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2025-01-18'),
  },

  // Staff accounts
  'staff@evservice.vn': {
    id: '3',
    email: 'staff@evservice.vn',
    password: '123456',
    firstName: 'Lê',
    lastName: 'Văn Nhân',
    phone: '0901234567',
    role: UserRole.STAFF,
    avatar: undefined,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-18'),
  },
  'staff2@evservice.vn': {
    id: '4',
    email: 'staff2@evservice.vn',
    password: '123456',
    firstName: 'Phạm',
    lastName: 'Thị Hoa',
    phone: '0978123456',
    role: UserRole.STAFF,
    avatar: undefined,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2025-01-18'),
  },

  // Technician accounts
  'technician@evservice.vn': {
    id: '5',
    email: 'technician@evservice.vn',
    password: '123456',
    firstName: 'Hoàng',
    lastName: 'Văn Kỹ',
    phone: '0965432109',
    role: UserRole.TECHNICIAN,
    avatar: undefined,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2025-01-18'),
  },
  'technician2@evservice.vn': {
    id: '6',
    email: 'technician2@evservice.vn',
    password: '123456',
    firstName: 'Đỗ',
    lastName: 'Văn Thuật',
    phone: '0943210987',
    role: UserRole.TECHNICIAN,
    avatar: undefined,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2025-01-18'),
  },

  // Admin accounts
  'admin@evservice.vn': {
    id: '7',
    email: 'admin@evservice.vn',
    password: '123456',
    firstName: 'Vũ',
    lastName: 'Thị Quản',
    phone: '0932109876',
    role: UserRole.ADMIN,
    avatar: undefined,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-18'),
  },
  'admin2@evservice.vn': {
    id: '8',
    email: 'admin2@evservice.vn',
    password: '123456',
    firstName: 'Bùi',
    lastName: 'Văn Trị',
    phone: '0921098765',
    role: UserRole.ADMIN,
    avatar: undefined,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2025-01-18'),
  }
};

// Get user by email and password
export const authenticateUser = (email: string, password: string): User | null => {
  const user = mockUsers[email.toLowerCase()];
  if (user && user.password === password) {
    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Check if email already exists
export const emailExists = (email: string): boolean => {
  return !!mockUsers[email.toLowerCase()];
};

// Get demo accounts for display
export const getDemoAccounts = () => {
  return {
    customer: {
      email: 'customer@evservice.vn',
      password: '123456',
      name: 'Nguyễn Văn Khách'
    },
    staff: {
      email: 'staff@evservice.vn',
      password: '123456',
      name: 'Lê Văn Nhân'
    },
    technician: {
      email: 'technician@evservice.vn',
      password: '123456',
      name: 'Hoàng Văn Kỹ'
    },
    admin: {
      email: 'admin@evservice.vn',
      password: '123456',
      name: 'Vũ Thị Quản'
    }
  };
};