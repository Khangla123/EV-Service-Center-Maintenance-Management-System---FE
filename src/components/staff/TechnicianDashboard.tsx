import React from 'react';
import { Wrench, CheckCircle, Clock, TrendingUp, Bell, Settings, AlertTriangle, PlayCircle } from 'lucide-react';

const TechnicianDashboard: React.FC = () => {
  const stats = [
    { label: 'Nhiệm vụ hôm nay', value: '6', icon: Wrench, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Đang thực hiện', value: '2', icon: PlayCircle, gradient: 'from-orange-500 to-orange-600' },
    { label: 'Hoàn thành', value: '15', icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
    { label: 'Cần chú ý', value: '1', icon: AlertTriangle, gradient: 'from-red-500 to-red-600' }
  ];

  const todayTasks = [
    {
      id: 1,
      customer: 'Nguyễn Văn A',
      vehicle: 'VinFast VF8',
      service: 'Thay pin và kiểm tra hệ thống điện',
      estimatedTime: '2h 30m',
      status: 'in-progress',
      priority: 'high',
      startTime: '08:00'
    },
    {
      id: 2,
      customer: 'Trần Thị B',
      vehicle: 'Tesla Model 3',
      service: 'Bảo dưỡng định kỳ',
      estimatedTime: '1h 45m',
      status: 'pending',
      priority: 'medium',
      startTime: '10:30'
    },
    {
      id: 3,
      customer: 'Lê Văn C',
      vehicle: 'VinFast VF5',
      service: 'Kiểm tra và cập nhật phần mềm',
      estimatedTime: '45m',
      status: 'pending',
      priority: 'low',
      startTime: '14:00'
    }
  ];

  const recentWork = [
    {
      id: 1,
      service: 'Thay pin EV',
      vehicle: 'VinFast VF8',
      completedTime: '2025-01-15 16:30',
      rating: 5
    },
    {
      id: 2,
      service: 'Kiểm tra hệ thống sạc',
      vehicle: 'Tesla Model Y',
      completedTime: '2025-01-15 14:15',
      rating: 4
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thực hiện';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      case 'paused': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container">
        {/* VinFast-inspired Header */}
        <div className="bg-white rounded-3xl shadow-lg mb-8 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Kỹ thuật viên</h1>
              <p className="text-lg text-gray-600">Quản lý công việc và lịch trình bảo dưỡng xe điện</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">1</span>
              </button>
              <button className="p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* VinFast Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 hover-lift overflow-hidden">
              <div className={`bg-gradient-to-r ${stat.gradient} p-6`}>
                <div className="flex items-center justify-between text-white">
                  <div>
                    <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">Hiệu suất tốt</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Tasks - VinFast Style */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Nhiệm vụ hôm nay</h3>
                  <span className="text-sm text-gray-500">6 nhiệm vụ</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {todayTasks.map((task) => (
                  <div key={task.id} className={`bg-gray-50 rounded-2xl p-6 border-l-4 ${getPriorityColor(task.priority)} hover:bg-gray-100 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{task.customer}</h4>
                          <span className="text-sm font-medium text-gray-500">{task.startTime}</span>
                        </div>
                        <p className="text-gray-600 mb-1">{task.service}</p>
                        <p className="text-sm text-gray-500 mb-2">{task.vehicle}</p>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Dự kiến: {task.estimatedTime}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </div>
                        {task.status === 'pending' && (
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                            Bắt đầu
                          </button>
                        )}
                        {task.status === 'in-progress' && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm transition-colors">
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Tools - VinFast Style */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Công cụ nhanh</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { label: 'Tra cứu mã lỗi', color: 'bg-blue-500', icon: '🔍' },
                    { label: 'Hướng dẫn sửa chữa', color: 'bg-green-500', icon: '📖' },
                    { label: 'Đặt linh kiện', color: 'bg-purple-500', icon: '🔧' },
                    { label: 'Báo cáo tiến độ', color: 'bg-orange-500', icon: '📊' }
                  ].map((tool, index) => (
                    <button key={index} className="w-full text-left group">
                      <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center">
                          <div className={`${tool.color} rounded-xl p-2 mr-3 text-white text-lg`}>
                            {tool.icon}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{tool.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Work - VinFast Style */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Công việc gần đây</h3>
              </div>
              <div className="p-6 space-y-4">
                {recentWork.map((work) => (
                  <div key={work.id} className="flex items-start space-x-4">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{work.service}</p>
                      <p className="text-sm text-gray-500">{work.vehicle}</p>
                      <p className="text-xs text-gray-400 mt-1">{work.completedTime}</p>
                      <div className="flex items-center mt-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-xs ${i < work.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">({work.rating}/5)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;