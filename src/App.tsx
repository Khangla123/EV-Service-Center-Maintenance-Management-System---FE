import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotificationContext } from './context/NotificationContext';
import { UserRole } from './types';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import AppointmentBookingPage from './pages/AppointmentBookingPage';
import AppointmentSuccessPage from './pages/AppointmentSuccessPage';
import ProfileManagement from './pages/ProfileManagement';
import CustomerDashboard from './components/customer/CustomerDashboard';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';

// Staff Components  
import StaffDashboard from './components/staff/StaffDashboard';
import TechnicianDashboard from './components/staff/TechnicianDashboard';
import AppointmentManagement from './components/staff/AppointmentManagement';
import TechnicianAssignment from './components/staff/TechnicianAssignment';
import ServiceCompletion from './components/staff/ServiceCompletion';
import VehicleStatusTracker from './components/staff/VehicleStatusTracker';

// Inventory Components
import SparePartsManagement from './components/inventory/SparePartsManagement';

// HR Components
import StaffManagement from './components/hr/StaffManagement';

// CRM Components
import CustomerVehicleManagement from './components/crm/CustomerVehicleManagement';

// Notification Components
import NotificationSystem from './components/notifications/NotificationSystem';

// Payment Components
import PaymentInvoiceSystem from './components/payment/PaymentInvoiceSystem';

// Reports Components
import ReportsAnalytics from './components/reports/ReportsAnalytics';

// Chat Components
import LiveChatSystem from './components/chat/LiveChatSystem';

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

// Layout Component with Notification Integration
const LayoutWithNotifications: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, logout } = useAuth();
  const { 
    totalNotifications, 
    handleOpenPopup, 
    handleOpenHistory 
  } = useNotificationContext();
  
  return (
    <div className="app-layout">
      <Header 
        user={state.user} 
        onLogout={logout}
        notificationCount={totalNotifications}
        onNotificationClick={handleOpenPopup}
        onNotificationHistoryClick={handleOpenHistory}
      />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// Layout Component without notifications (for pages that don't need notifications)
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { state, logout } = useAuth();
  
  return (
    <div className="app-layout">
      <Header user={state.user} onLogout={logout} />
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
        <NotificationProvider>
          <LayoutWithNotifications>
            <HomePage />
          </LayoutWithNotifications>
        </NotificationProvider>
      } />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Booking Routes */}
      <Route path="/booking" element={
        <Layout>
          <AppointmentBookingPage />
        </Layout>
      } />
      <Route path="/appointment-booking" element={
        <Layout>
          <AppointmentBookingPage />
        </Layout>
      } />
      <Route path="/appointment-success" element={
        <Layout>
          <AppointmentSuccessPage />
        </Layout>
      } />
      
      {/* Profile Management Route */}
      <Route path="/profile" element={
        <Layout>
          <ProfileManagement />
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
      <Route path="/staff" element={
        <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
          <Layout>
            <StaffDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/staff/appointments" element={
        <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
          <Layout>
            <AppointmentManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/staff/assignment" element={
        <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
          <Layout>
            <TechnicianAssignment />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/staff/completion" element={
        <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
          <Layout>
            <ServiceCompletion />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/staff/vehicle-status" element={
        <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
          <Layout>
            <VehicleStatusTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Technician Routes */}
      <Route path="/technician" element={
        <ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]}>
          <Layout>
            <TechnicianDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/inventory" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <SparePartsManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/staff" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <StaffManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/customers" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <CustomerVehicleManagement />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <NotificationSystem />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/payments" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <PaymentInvoiceSystem />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
          <Layout>
            <ReportsAnalytics />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/admin/chat" element={
        <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.STAFF]}>
          <Layout>
            <LiveChatSystem />
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
