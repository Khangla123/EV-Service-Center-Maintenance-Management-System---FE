import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { UserRole } from './types';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
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
  const { 
    maintenanceReminders, 
    paymentReminders, 
    vehicles, 
    packages,
    showMaintenanceReminder,
    showPaymentReminder,
    readNotifications,
    setShowMaintenanceReminder,
    setShowPaymentReminder,
    markNotificationAsRead,
    loadNotifications 
  } = useNotifications();
  
  // Load notifications when user logs in
  useEffect(() => {
    if (state.user && state.user.role === 'customer') {
      loadNotifications(state.user.id);
    }
  }, [state.user, loadNotifications]);
  
  const handleScheduleService = (reminderId: string) => {
    console.log('Schedule service for reminder:', reminderId);
    // Navigate to booking page
    setShowMaintenanceReminder(false);
    navigate('/customer/booking');
  };

  const handleSnoozeMaintenanceReminder = (reminderId: string, days: number) => {
    console.log('Snooze maintenance reminder:', reminderId, 'for', days, 'days');
    // Remove reminder from list
    setShowMaintenanceReminder(false);
  };

  const handlePayNow = (reminderId: string) => {
    console.log('Pay now for reminder:', reminderId);
    // Navigate to payment page
    setShowPaymentReminder(false);
  };

  const handleViewPaymentDetails = (reminderId: string) => {
    console.log('View payment details for reminder:', reminderId);
    // Navigate to payment details page
    setShowPaymentReminder(false);
  };

  const handleSnoozePaymentReminder = (reminderId: string, days: number) => {
    console.log('Snooze payment reminder:', reminderId, 'for', days, 'days');
    // Remove reminder from list
    setShowPaymentReminder(false);
  };
  
  return (
    <div className="app-layout">
      {/* Global Notification Popups */}
      {state.user && state.user.role === 'customer' && (
        <>
          <MaintenanceReminderPopup
            reminders={maintenanceReminders}
            vehicles={vehicles}
            isOpen={showMaintenanceReminder}
            onClose={() => setShowMaintenanceReminder(false)}
            onScheduleService={handleScheduleService}
            onSnooze={handleSnoozeMaintenanceReminder}
          />

          <PaymentReminderPopup
            reminders={paymentReminders}
            packages={packages}
            isOpen={showPaymentReminder}
            onClose={() => setShowPaymentReminder(false)}
            onPayNow={handlePayNow}
            onViewDetails={handleViewPaymentDetails}
            onSnooze={handleSnoozePaymentReminder}
          />
        </>
      )}
      
      <Header 
        user={state.user} 
        onLogout={logout}
        onShowMaintenanceReminder={() => {
          setShowPaymentReminder(false); // Đóng Payment Reminder trước
          setShowMaintenanceReminder(true);
        }}
        onShowPaymentReminder={() => {
          setShowMaintenanceReminder(false); // Đóng Maintenance Reminder trước
          setShowPaymentReminder(true);
        }}
        onShowAllNotifications={() => {}}
        maintenanceReminderCount={maintenanceReminders.length}
        paymentReminderCount={paymentReminders.length}
        readNotifications={readNotifications}
        onMarkNotificationAsRead={markNotificationAsRead}
      />
      <main className="app-main">
        {children}
      </main>
      <Footer />
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
            <AdminDashboard />
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
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
