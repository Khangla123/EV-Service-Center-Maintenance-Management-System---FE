import React, { useState } from 'react';
import { LayoutDashboard, List, Play, Package, Calendar, Award, ChevronRight } from 'lucide-react';
import './TechnicianDashboard.css';
import TechnicianTasks from './tasks/TechnicianTasks';
import WorkProcessing from './work/WorkProcessing';
import PartsPersonal from './parts/PartsPersonal';
import Schedule from './schedule/Schedule';
import Training from './training/Training';

type TechView = 'dashboard' | 'tasks' | 'work' | 'parts' | 'schedule' | 'training';

const TechnicianDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<TechView>('dashboard');

  const menu = [
    { id: 'dashboard' as TechView, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'tasks' as TechView, label: 'Công việc', icon: <List size={18} /> },
    { id: 'work' as TechView, label: 'Xử lý Công việc', icon: <Play size={18} /> },
    { id: 'parts' as TechView, label: 'Phụ tùng', icon: <Package size={18} /> },
    { id: 'schedule' as TechView, label: 'Lịch', icon: <Calendar size={18} /> },
    { id: 'training' as TechView, label: 'Đào tạo', icon: <Award size={18} /> }
  ];

  const renderMain = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="tech-dashboard-overview">
            <div className="overview-header">
              <h2>Dashboard Kỹ thuật viên</h2>
              <p className="overview-subtitle">Theo dõi công việc và hiệu suất cá nhân</p>
            </div>
            
            <div className="overview-cards">
              <div className="stat-card">
                <div className="stat-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Công việc hôm nay</div>
                  <div className="stat-value">4</div>
                  <div className="stat-trend positive">
                    <span>+2 việc mới</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Play size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Đang xử lý</div>
                  <div className="stat-value">1</div>
                  <div className="stat-trend neutral">
                    <span>VF8 - XV123</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <LayoutDashboard size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Hoàn thành tháng này</div>
                  <div className="stat-value">28</div>
                  <div className="stat-trend positive">
                    <span>+12% so với tháng trước</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Đánh giá trung bình</div>
                  <div className="stat-value">4.8/5</div>
                  <div className="stat-trend positive">
                    <span>+0.3 so với tháng trước</span>
                  </div>
                </div>
              </div>
            </div>

            <TechnicianTasks compact />
          </div>
        );
      case 'tasks':
        return <TechnicianTasks />;
      case 'work':
        return <WorkProcessing />;
      case 'parts':
        return <PartsPersonal />;
      case 'schedule':
        return <Schedule />;
      case 'training':
        return <Training />;
      default:
        return <div />;
    }
  };

  return (
    <div className="tech-dashboard">
      <aside className="tech-sidebar">
        <nav>
          {menu.map((m) => (
            <button 
              key={m.id} 
              className={`tech-nav-item ${m.id === activeView ? 'active' : ''}`} 
              onClick={() => setActiveView(m.id as TechView)}
            >
              <span className="icon">{m.icon}</span>
              <span className="label">{m.label}</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
          ))}
        </nav>
      </aside>

      <main className="tech-main">
        {renderMain()}
      </main>
    </div>
  );
};

export default TechnicianDashboard;
