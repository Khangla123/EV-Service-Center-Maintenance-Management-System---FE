/**
 * @fileoverview Technician Dashboard Component
 * 
 * Component chính cho giao diện kỹ thuật viên, quản lý công việc được phân công,
 * xử lý bảo dưỡng xe, quản lý phụ tùng cá nhân và xem lịch làm việc.
 * 
 * Main technician interface component for managing assigned tasks,
 * processing vehicle maintenance, managing personal parts inventory and viewing work schedule.
 * 
 * @module components/technician/TechnicianDashboard
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { List, Play, Package, Calendar, ChevronRight } from 'lucide-react';
import './TechnicianDashboard.css';
import TechnicianTasks from './tasks/TechnicianTasks';
import WorkProcessing from './work/WorkProcessing';
import PartsPersonal from './parts/PartsPersonal';
import Schedule from './schedule/Schedule';

/**
 * Technician view types / Các loại giao diện kỹ thuật viên
 */
type TechView = 'dashboard' | 'tasks' | 'work' | 'parts' | 'schedule';

/**
 * Technician Dashboard Component
 * 
 * Quản lý giao diện kỹ thuật viên với các chức năng:
 * - Quản lý công việc được phân công
 * - Xử lý và cập nhật tiến độ công việc
 * - Quản lý phụ tùng cá nhân
 * - Xem lịch làm việc
 * 
 * Manages technician interface with features:
 * - Managing assigned tasks
 * - Processing and updating work progress
 * - Managing personal parts inventory
 * - Viewing work schedule
 * 
 * @returns {JSX.Element} Technician dashboard component
 * 
 * @example
 * // Sử dụng trong router / Used in router
 * <Route path="/technician/*" element={<TechnicianDashboard />} />
 */
const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  /**
   * Redirect to tasks page on first load if at root
   * Chuyển hướng đến trang công việc khi load lần đầu nếu đang ở root
   * 
   * Default view is 'tasks' instead of 'dashboard' for immediate task visibility.
   * View mặc định là 'tasks' thay vì 'dashboard' để hiển thị công việc ngay lập tức.
   */
  useEffect(() => {
    if (location.pathname === '/technician' || location.pathname === '/technician/') {
      navigate('/technician/tasks', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  /**
   * Determine active view from URL
   * Xác định view đang hoạt động từ URL
   * 
   * @returns {TechView} Current active view
   */
  const getActiveView = (): TechView => {
    const path = location.pathname;
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/work')) return 'work'; // Match both /work and /work-processing
    if (path.includes('/parts')) return 'parts';
    if (path.includes('/schedule')) return 'schedule';
    return 'tasks'; // Default to tasks instead of dashboard
  };
  
  // Current active view / View đang hoạt động
  const [activeView, setActiveView] = useState<TechView>(getActiveView());
  
  /**
   * Update active view when location changes
   * Cập nhật active view khi location thay đổi
   */
  useEffect(() => {
    setActiveView(getActiveView());
  }, [location.pathname]);

  /**
   * Sidebar menu configuration / Cấu hình menu sidebar
   */
  const menu = [
    { id: 'tasks' as TechView, label: 'Công việc', icon: <List size={18} />, path: '/technician/tasks' },
    { id: 'work' as TechView, label: 'Xử lý Công việc', icon: <Play size={18} />, path: '/technician/work' },
    { id: 'parts' as TechView, label: 'Phụ tùng', icon: <Package size={18} />, path: '/technician/parts' },
    { id: 'schedule' as TechView, label: 'Lịch', icon: <Calendar size={18} />, path: '/technician/schedule' }
  ];

  /**
   * Handle navigation to different views
   * Xử lý điều hướng đến các view khác nhau
   * 
   * @param {TechView} id - View ID to navigate to
   * @param {string} path - URL path to navigate to
   */
  const handleNavigation = (id: TechView, path: string) => {
    setActiveView(id);
    navigate(path);
  };

  return (
    <div className="tech-dashboard">
      <aside className="tech-sidebar">
        <nav>
          {menu.map((m) => (
            <button 
              key={m.id} 
              className={`tech-nav-item ${m.id === activeView ? 'active' : ''}`} 
              onClick={() => handleNavigation(m.id, m.path)}
            >
              <span className="icon">{m.icon}</span>
              <span className="label">{m.label}</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
          ))}
        </nav>
      </aside>

      <main className="tech-main">
        <Routes key={location.pathname}>
          {/* Redirect root to tasks */}
          <Route index element={<Navigate to="/technician/tasks" replace />} />
          <Route path="tasks" element={<TechnicianTasks />} />
          <Route path="work" element={<WorkProcessing />} />
          <Route path="work-processing/:appointmentId" element={<WorkProcessing />} />
          <Route path="parts" element={<PartsPersonal />} />
          <Route path="schedule" element={<Schedule />} />
        </Routes>
      </main>
    </div>
  );
};

export default TechnicianDashboard;
