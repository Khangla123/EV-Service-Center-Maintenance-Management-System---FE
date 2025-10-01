import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import CustomerDashboard from './components/customer/CustomerDashboard';
import AppointmentSuccessPage from './pages/AppointmentSuccessPage';
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
