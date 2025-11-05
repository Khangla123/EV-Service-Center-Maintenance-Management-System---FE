import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, List, Play, Package, Calendar, Award, ChevronRight } from 'lucide-react';
import './TechnicianDashboard.css';
import TechnicianTasks from './tasks/TechnicianTasks';
import WorkProcessing from './work/WorkProcessing';
import PartsPersonal from './parts/PartsPersonal';
import Schedule from './schedule/Schedule';
import Training from './training/Training';

type TechView = 'dashboard' | 'tasks' | 'work' | 'parts' | 'schedule' | 'training';

const TechnicianDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirect to tasks page on first load if at root
  useEffect(() => {
    if (location.pathname === '/technician' || location.pathname === '/technician/') {
      navigate('/technician/tasks', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // Determine active view from URL
  const getActiveView = (): TechView => {
    const path = location.pathname;
    if (path.includes('/tasks')) return 'tasks';
    if (path.includes('/work')) return 'work'; // Match both /work and /work-processing
    if (path.includes('/parts')) return 'parts';
    if (path.includes('/schedule')) return 'schedule';
    if (path.includes('/training')) return 'training';
    return 'tasks'; // Default to tasks instead of dashboard
  };
  
  const [activeView, setActiveView] = useState<TechView>(getActiveView());
  
  // Update active view when location changes
  useEffect(() => {
    setActiveView(getActiveView());
  }, [location.pathname]);

  const menu = [
    { id: 'tasks' as TechView, label: 'Công việc', icon: <List size={18} />, path: '/technician/tasks' },
    { id: 'work' as TechView, label: 'Xử lý Công việc', icon: <Play size={18} />, path: '/technician/work' },
    { id: 'parts' as TechView, label: 'Phụ tùng', icon: <Package size={18} />, path: '/technician/parts' },
    { id: 'schedule' as TechView, label: 'Lịch', icon: <Calendar size={18} />, path: '/technician/schedule' },
    { id: 'training' as TechView, label: 'Đào tạo', icon: <Award size={18} />, path: '/technician/training' }
  ];

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
          <Route path="training" element={<Training />} />
        </Routes>
      </main>
    </div>
  );
};

export default TechnicianDashboard;
