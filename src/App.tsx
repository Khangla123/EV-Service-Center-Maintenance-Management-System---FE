/**
 * App.tsx - Main Application Component
 * 
 * Đây là component chính của ứng dụng EV Service Center.
 * Component này quản lý toàn bộ routing, authentication và layout của ứng dụng.
 * 
 * Chức năng chính:
 * - Cấu hình routing cho tất cả các trang
 * - Bảo vệ các route theo vai trò người dùng (role-based access control)
 * - Quản lý layout chung (Header, Footer)
 * - Hiển thị popup thông báo cho customer
 * 
 * @module App
 */

// React core imports
import React, { useEffect } from 'react';

// Router imports - Quản lý điều hướng trang
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Context imports - Quản lý state toàn cục
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';

// Type imports - Định nghĩa kiểu dữ liệu
import { UserRole } from './types';

// Common component imports - Components được sử dụng chung
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';

// Page imports - Các trang chính của ứng dụng
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';

// Dashboard imports - Bảng điều khiển cho từng vai trò
import CustomerDashboard from './components/customer/CustomerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import { TechnicianDashboard } from './components/technician';

// Additional page imports
import AppointmentSuccessPage from './pages/AppointmentSuccessPage';

// Notification components - Popup thông báo cho khách hàng
import MaintenanceReminderPopup from './components/customer/notifications/MaintenanceReminderPopup';
import PaymentReminderPopup from './components/customer/notifications/PaymentReminderPopup';

// Payment components - Xử lý thanh toán
import MockPayment from './components/customer/payment/MockPayment';
import PaymentResult from './components/customer/payment/PaymentResult';

// Global styles
import './App.css';

/**
 * ProtectedRoute Component
 * 
 * Component bảo vệ các route yêu cầu đăng nhập và phân quyền.
 * Kiểm tra xem người dùng đã đăng nhập chưa và có quyền truy cập không.
 * 
 * @param {React.ReactNode} children - Nội dung cần bảo vệ
 * @param {UserRole[]} allowedRoles - Danh sách các vai trò được phép truy cập
 * @returns {JSX.Element} Children nếu có quyền, redirect nếu không
 * 
 * Flow:
 * 1. Kiểm tra authentication - Nếu chưa đăng nhập -> redirect tới /login
 * 2. Kiểm tra authorization - Nếu không có quyền -> redirect tới /unauthorized
 * 3. Nếu pass cả 2 bước -> hiển thị nội dung
 */
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: UserRole[] 
}> = ({ children, allowedRoles }) => {
  const { state } = useAuth();
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  if (!state.isAuthenticated) {
    // Chưa đăng nhập -> chuyển hướng về trang login
    return <Navigate to="/login" replace />;
  }
  
  // Kiểm tra quyền truy cập dựa trên vai trò
  if (state.user && !allowedRoles.includes(state.user.role)) {
    // Không có quyền -> chuyển hướng về trang unauthorized
    return <Navigate to="/unauthorized" replace />;
  }
  
  // Có quyền truy cập -> hiển thị nội dung
  return <>{children}</>;
};

/**
 * Layout Component
 * 
 * Component layout chung cho toàn bộ ứng dụng.
 * Bao gồm Header, Footer và các popup thông báo toàn cục.
 * 
 * @param {React.ReactNode} children - Nội dung chính của trang
 * @returns {JSX.Element} Layout với header, main content và footer
 * 
 * Features:
 * - Hiển thị Header với thông tin user và navigation
 * - Hiển thị Footer
 * - Quản lý popup thông báo bảo dưỡng (MaintenanceReminderPopup)
 * - Quản lý popup thông báo thanh toán (PaymentReminderPopup)
 * - Load notifications khi user đăng nhập (chỉ cho customer)
 */
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lấy auth state và logout function từ AuthContext
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  
  // Lấy notification state và functions từ NotificationContext
  const { 
    maintenanceReminders,     // Danh sách nhắc nhở bảo dưỡng
    paymentReminders,         // Danh sách nhắc nhở thanh toán
    vehicles,                 // Danh sách xe của customer
    packages,                 // Danh sách gói bảo dưỡng
    showMaintenanceReminder,  // Flag hiển thị popup bảo dưỡng
    showPaymentReminder,      // Flag hiển thị popup thanh toán
    readNotifications,        // Set các thông báo đã đọc
    setShowMaintenanceReminder,
    setShowPaymentReminder,
    markNotificationAsRead,
    loadNotifications 
  } = useNotifications();
  
  /**
   * Effect: Load notifications khi user đăng nhập
   * Chỉ load cho customer role
   */
  useEffect(() => {
    if (state.user && state.user.role === 'customer') {
      loadNotifications(state.user.id);
    }
  }, [state.user, loadNotifications]);
  
  /**
   * Handler: Đặt lịch bảo dưỡng từ reminder
   * @param {string} reminderId - ID của reminder
   */
  const handleScheduleService = (reminderId: string) => {
    console.log('Schedule service for reminder:', reminderId);
    // Đóng popup và chuyển hướng tới trang đặt lịch
    setShowMaintenanceReminder(false);
    navigate('/customer/booking');
  };

  /**
   * Handler: Hoãn thông báo bảo dưỡng
   * @param {string} reminderId - ID của reminder
   * @param {number} days - Số ngày muốn hoãn
   */
  const handleSnoozeMaintenanceReminder = (reminderId: string, days: number) => {
    console.log('Snooze maintenance reminder:', reminderId, 'for', days, 'days');
    // TODO: Gọi API để cập nhật snooze time
    // Đóng popup
    setShowMaintenanceReminder(false);
  };

  /**
   * Handler: Thanh toán ngay từ reminder
   * @param {string} reminderId - ID của reminder
   */
  const handlePayNow = (reminderId: string) => {
    console.log('Pay now for reminder:', reminderId);
    // TODO: Navigate to payment page with reminder info
    setShowPaymentReminder(false);
  };

  /**
   * Handler: Xem chi tiết thanh toán
   * @param {string} reminderId - ID của reminder
   */
  const handleViewPaymentDetails = (reminderId: string) => {
    console.log('View payment details for reminder:', reminderId);
    // TODO: Navigate to payment details page
    setShowPaymentReminder(false);
  };

  /**
   * Handler: Hoãn thông báo thanh toán
   * @param {string} reminderId - ID của reminder
   * @param {number} days - Số ngày muốn hoãn
   */
  const handleSnoozePaymentReminder = (reminderId: string, days: number) => {
    console.log('Snooze payment reminder:', reminderId, 'for', days, 'days');
    // TODO: Gọi API để cập nhật snooze time
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

/**
 * AppRoutes Component
 * 
 * Cấu hình tất cả các routes của ứng dụng.
 * Bao gồm public routes, protected routes và fallback routes.
 * 
 * Routes được tổ chức theo nhóm:
 * - Public routes: /, /login, /signup, /mock-payment, /payment/result
 * - Customer routes: /customer/*
 * - Staff routes: /staff/*
 * - Technician routes: /technician/*
 * - Admin routes: /admin/*
 * - Fallback routes: /unauthorized, 404
 * 
 * @returns {JSX.Element} Routes configuration
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <Layout>
          <HomePage />
        </Layout>
      } />
      
      <Route path="/login" element={
        <Layout>
          <LoginPage />
        </Layout>
      } />
      
      <Route path="/signup" element={
        <Layout>
          <SignupPage />
        </Layout>
      } />
      
      {/* PUBLIC Mock Payment Routes - NO AUTHENTICATION REQUIRED */}
      <Route path="/mock-payment" element={<MockPayment />} />
      <Route path="/mock-payment/result" element={<PaymentResult />} />
      
      {/* PUBLIC VNPay Payment Result Route - NO AUTHENTICATION REQUIRED */}
      <Route path="/customer/payment/result" element={<PaymentResult />} />
      
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
            <StaffDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Technician Routes */}
      <Route path="/technician/*" element={
        <ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]}>
          <Layout>
            <TechnicianDashboard />
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

/**
 * App Component - Root Component
 * 
 * Component gốc của toàn bộ ứng dụng.
 * Cung cấp các Context Providers và Router cho toàn bộ app.
 * 
 * Provider hierarchy (từ ngoài vào trong):
 * 1. AuthProvider - Quản lý authentication và user state
 * 2. NotificationProvider - Quản lý notifications và reminders
 * 3. Router - Quản lý routing và navigation
 * 
 * @returns {JSX.Element} Root application component
 */
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
