import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  UserRole, 
  MaintenanceReminder, 
  PaymentReminder, 
  Vehicle, 
  MaintenancePackage,
  ReminderType,
  PaymentReminderType,
  ServiceType,
  ServiceCategory
} from './types';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AppointmentSuccessPage from './pages/AppointmentSuccessPage';
import MaintenanceReminderPopup from './components/customer/notifications/MaintenanceReminderPopup';
import PaymentReminderPopup from './components/customer/notifications/PaymentReminderPopup';
import './App.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: UserRole[] 
}> = ({ children, allowedRoles }) => {
  const { state } = useAuth();
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (state.user && !allowedRoles.includes(state.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <>{children}</>;
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const [showMaintenanceReminder, setShowMaintenanceReminder] = useState(false);
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  
  // Mock data for MaintenanceReminder
  const mockMaintenanceReminders: MaintenanceReminder[] = [
    {
      id: 'reminder-1',
      vehicleId: 'vehicle-001',
      customerId: 'customer-001',
      reminderType: ReminderType.REGULAR_MAINTENANCE,
      dueDate: new Date('2025-10-05'),
      dueKilometers: 10000,
      currentKilometers: 9500,
      serviceType: 'regular_maintenance',
      isOverdue: false,
      isActive: true
    },
    {
      id: 'reminder-2',
      vehicleId: 'vehicle-001',
      customerId: 'customer-001',
      reminderType: ReminderType.BATTERY_CHECK,
      dueDate: new Date('2025-09-28'),
      serviceType: 'battery_check',
      isOverdue: true,
      isActive: true
    }
  ];

  const mockVehicles: Vehicle[] = [
    {
      id: 'vehicle-001',
      customerId: 'customer-001',
      make: 'VinFast',
      model: 'VF8',
      year: 2023,
      licensePlate: '30A-12345',
      vin: 'VF8ABC123456',
      color: 'Đỏ',
      mileage: 9500,
      batteryCapacity: 87.7,
      purchaseDate: new Date('2023-01-20'),
      warrantyExpiration: new Date('2026-01-20'),
      createdAt: new Date('2023-01-20'),
      updatedAt: new Date('2025-10-01')
    }
  ];

  // Mock data for PaymentReminder
  const mockPaymentReminders: PaymentReminder[] = [
    {
      id: 'payment-1',
      customerId: 'customer-001',
      type: PaymentReminderType.MAINTENANCE_PACKAGE,
      amount: 5000000,
      dueDate: new Date('2025-10-10'),
      isOverdue: false,
      description: 'Gói bảo dưỡng 12 tháng - VinFast VF8',
      servicePackageId: 'package-001'
    },
    {
      id: 'payment-2',
      customerId: 'customer-001',
      type: PaymentReminderType.OUTSTANDING_BILL,
      amount: 1760000,
      dueDate: new Date('2025-09-30'),
      isOverdue: true,
      description: 'Hóa đơn bảo dưỡng tháng 9/2025'
    }
  ];

  const mockServiceTypes: ServiceType[] = [
    {
      id: 'service-001',
      name: 'Bảo dưỡng định kỳ',
      description: 'Bảo dưỡng định kỳ cho xe điện',
      basePrice: 1500000,
      estimatedDuration: 120,
      category: ServiceCategory.REGULAR_MAINTENANCE,
      isActive: true
    },
    {
      id: 'service-002',
      name: 'Kiểm tra pin',
      description: 'Kiểm tra và bảo dưỡng hệ thống pin',
      basePrice: 800000,
      estimatedDuration: 90,
      category: ServiceCategory.BATTERY_SERVICE,
      isActive: true
    }
  ];

  const mockPackages: MaintenancePackage[] = [
    {
      id: 'package-001',
      name: 'Gói Bảo Dưỡng Premium 12 Tháng',
      description: 'Gói bảo dưỡng toàn diện cho xe VinFast',
      price: 5000000,
      duration: 12,
      services: mockServiceTypes,
      benefits: [
        'Miễn phí kiểm tra định kỳ',
        'Ưu đãi 20% phụ tùng',
        'Hỗ trợ khẩn cấp 24/7'
      ],
      isActive: true,
      popularity: 85
    }
  ];

  const handleScheduleService = (reminderId: string) => {
    setShowMaintenanceReminder(false);
    navigate('/customer/booking');
  };

  const handleSnoozeMaintenanceReminder = (reminderId: string, days: number) => {
    console.log(`Snoozed reminder ${reminderId} for ${days} days`);
    setShowMaintenanceReminder(false);
  };

  const handlePayNow = (reminderId: string) => {
    setShowPaymentReminder(false);
    navigate('/customer/payment');
  };

  const handleViewPaymentDetails = (reminderId: string) => {
    setShowPaymentReminder(false);
    navigate('/customer/costs');
  };

  const handleSnoozePaymentReminder = (reminderId: string, days: number) => {
    console.log(`Snoozed payment reminder ${reminderId} for ${days} days`);
    setShowPaymentReminder(false);
  };

  const handleShowAllNotifications = () => {
    // Show both popups or navigate to a notifications page
    // For now, we'll show both maintenance and payment reminders
    if (mockMaintenanceReminders.length > 0) {
      setShowMaintenanceReminder(true);
    }
    if (mockPaymentReminders.length > 0) {
      setTimeout(() => {
        setShowPaymentReminder(true);
      }, 500);
    }
  };
  
  return (
    <div className="app-layout">
      <Header 
        user={state.user} 
        onLogout={logout}
        onShowMaintenanceReminder={() => setShowMaintenanceReminder(true)}
        onShowPaymentReminder={() => setShowPaymentReminder(true)}
        onShowAllNotifications={handleShowAllNotifications}
        maintenanceReminderCount={mockMaintenanceReminders.length}
        paymentReminderCount={mockPaymentReminders.length}
      />
      <main className="app-main">
        {children}
      </main>
      <Footer />
      
      {/* Maintenance Reminder Popup */}
      {state.user && (
        <MaintenanceReminderPopup
          reminders={mockMaintenanceReminders}
          vehicles={mockVehicles}
          isOpen={showMaintenanceReminder}
          onClose={() => setShowMaintenanceReminder(false)}
          onScheduleService={handleScheduleService}
          onSnooze={handleSnoozeMaintenanceReminder}
        />
      )}
      
      {/* Payment Reminder Popup */}
      {state.user && (
        <PaymentReminderPopup
          reminders={mockPaymentReminders}
          packages={mockPackages}
          isOpen={showPaymentReminder}
          onClose={() => setShowPaymentReminder(false)}
          onPayNow={handlePayNow}
          onViewDetails={handleViewPaymentDetails}
          onSnooze={handleSnoozePaymentReminder}
        />
      )}
    </div>
  );
};

// App Routes Component
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <Layout>
          <HomePage />
        </Layout>
      } />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Appointment Success Route */}
      <Route path="/appointments/success" element={
        <Layout>
          <AppointmentSuccessPage />
        </Layout>
      } />
      
      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute allowedRoles={[UserRole.CUSTOMER]}>
          <Layout>
            <CustomerDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Staff Routes */}
      <Route path="/staff/*" element={
        <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
          <Layout>
            <div className="dashboard-placeholder">
              <h1>Staff Dashboard</h1>
              <p>Chức năng dành cho nhân viên đang được phát triển...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Technician Routes */}
      <Route path="/technician/*" element={
        <ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]}>
          <Layout>
            <div className="dashboard-placeholder">
              <h1>Technician Dashboard</h1>
              <p>Chức năng dành cho kỹ thuật viên đang được phát triển...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <div className="dashboard-placeholder">
              <h1>Admin Dashboard</h1>
              <p>Chức năng dành cho quản trị viên đang được phát triển...</p>
            </div>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback Routes */}
      <Route path="/unauthorized" element={
        <Layout>
          <div className="unauthorized-page">
            <h1>Không có quyền truy cập</h1>
            <p>Bạn không có quyền truy cập vào trang này.</p>
          </div>
        </Layout>
      } />
      
      <Route path="*" element={
        <Layout>
          <div className="not-found-page">
            <h1>404 - Không tìm thấy trang</h1>
            <p>Trang bạn đang tìm kiếm không tồn tại.</p>
          </div>
        </Layout>
      } />
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
