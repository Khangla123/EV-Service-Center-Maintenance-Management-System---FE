import React, { useState } from 'react';
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
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

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
              onClick={() => setActiveView(item.id)}
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
