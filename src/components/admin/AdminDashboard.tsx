import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users, 
  Calendar, 
  Package,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import DashboardOverview from './dashboard/DashboardOverview';
import StaffManagement from './staff/StaffManagement';
import AppointmentManagement from './appointments/AppointmentManagement';
import InventoryManagement from './inventory/InventoryManagement';
import FinanceManagement from './finance/FinanceManagement';
import './AdminDashboard.css';

type AdminView = 'dashboard' | 'staff' | 'appointments' | 'inventory' | 'finance';

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  // Sync activeView with URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/staff')) {
      setActiveView('staff');
    } else if (path.includes('/appointments')) {
      setActiveView('appointments');
    } else if (path.includes('/inventory')) {
      setActiveView('inventory');
    } else if (path.includes('/reports') || path.includes('/finance')) {
      setActiveView('finance');
    } else {
      setActiveView('dashboard');
    }
  }, [location.pathname]);

  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    // Navigate to the corresponding route
    const routes: Record<AdminView, string> = {
      dashboard: '/admin/dashboard',
      staff: '/admin/staff',
      appointments: '/admin/appointments',
      inventory: '/admin/inventory',
      finance: '/admin/reports'
    };
    navigate(routes[view]);
  };

  const menuItems = [
    { id: 'dashboard' as AdminView, label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
    { id: 'staff' as AdminView, label: 'Quản lý Nhân sự', icon: <Users size={20} /> },
    { id: 'appointments' as AdminView, label: 'Quản lý Lịch hẹn', icon: <Calendar size={20} /> },
    { id: 'inventory' as AdminView, label: 'Quản lý Kho', icon: <Package size={20} /> },
    { id: 'finance' as AdminView, label: 'Tài chính & Báo cáo', icon: <DollarSign size={20} /> }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'staff':
        return <StaffManagement />;
      case 'appointments':
        return <AppointmentManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'finance':
        return <FinanceManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleViewChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
          ))}
        </nav>
      </div>

      <div className="admin-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
