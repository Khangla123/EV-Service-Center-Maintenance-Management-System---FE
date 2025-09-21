import React from 'react';
import { Users, Calendar, TrendingUp, DollarSign, Activity, Settings, Bell, BarChart3, Wrench, AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const stats = [
    { label: 'Tổng khách hàng', value: '1,234', icon: Users, gradient: 'from-blue-500 to-blue-600', change: '+12%' },
    { label: 'Lịch hẹn hôm nay', value: '45', icon: Calendar, gradient: 'from-purple-500 to-purple-600', change: '+8%' },
    { label: 'Doanh thu tháng', value: '₫125M', icon: DollarSign, gradient: 'from-green-500 to-green-600', change: '+15%' },
    { label: 'Hiệu suất', value: '94%', icon: TrendingUp, gradient: 'from-orange-500 to-orange-600', change: '+3%' }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Khách hàng mới đăng ký',
      details: 'Nguyễn Văn A đã tạo tài khoản',
      time: '5 phút trước',
      type: 'user'
    },
    {
      id: 2,
      action: 'Lịch hẹn được tạo',
      details: 'Bảo dưỡng VinFast VF8 - 16:30',
      time: '15 phút trước',
      type: 'appointment'
    },
    {
      id: 3,
      action: 'Thanh toán hoàn thành',
      details: 'Dịch vụ thay pin - ₫2,500,000',
      time: '1 giờ trước',
      type: 'payment'
    },
    {
      id: 4,
      action: 'Kỹ thuật viên hoàn thành',
      details: 'Kiểm tra hệ thống điện',
      time: '2 giờ trước',
      type: 'service'
    }
  ];

  const quickActions = [
    { label: 'Quản lý người dùng', icon: Users, color: 'bg-blue-500' },
    { label: 'Thống kê doanh thu', icon: BarChart3, color: 'bg-green-500' },
    { label: 'Quản lý kỹ thuật viên', icon: Wrench, color: 'bg-purple-500' },
    { label: 'Cài đặt hệ thống', icon: Settings, color: 'bg-gray-500' }
  ];

  const todayAppointments = [
    {
      id: 1,
      time: '09:00',
      customer: 'Nguyễn Văn A',
      service: 'Bảo dưỡng định kỳ',
      technician: 'Trần Văn B',
      status: 'confirmed'
    },
    {
      id: 2,
      time: '11:30',
      customer: 'Lê Thị C',
      service: 'Thay pin EV',
      technician: 'Hoàng Văn D',
      status: 'in-progress'
    },
    {
      id: 3,
      time: '14:00',
      customer: 'Phạm Văn E',
      service: 'Kiểm tra hệ thống',
      technician: 'Đặng Thị F',
      status: 'pending'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'appointment': return <Calendar className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'service': return <Wrench className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-100 text-blue-600';
      case 'appointment': return 'bg-purple-100 text-purple-600';
      case 'payment': return 'bg-green-100 text-green-600';
      case 'service': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xử lý';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container">
        {/* VinFast-inspired Header */}
        <div className="bg-white rounded-3xl shadow-lg mb-8 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Quản trị</h1>
              <p className="text-lg text-gray-600">Tổng quan hệ thống và quản lý hoạt động</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
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
                  <span className="text-sm font-medium">{stat.change} so với tháng trước</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Lịch hẹn hôm nay</h3>
                  <span className="text-sm text-gray-500">{todayAppointments.length} lịch hẹn</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{appointment.customer}</h4>
                          <span className="text-sm font-medium text-gray-500">{appointment.time}</span>
                        </div>
                        <p className="text-gray-600 mb-1">{appointment.service}</p>
                        <p className="text-sm text-gray-500">Kỹ thuật viên: {appointment.technician}</p>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Cảnh báo hệ thống</h3>
              </div>
              <div className="p-6">
                <div className="bg-red-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-start">
                    <div className="p-2 bg-red-100 rounded-xl mr-3">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-red-800">Máy chủ thanh toán</h4>
                      <p className="text-sm text-red-600">Phát hiện độ trễ cao trong xử lý thanh toán</p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-4">
                  <div className="flex items-start">
                    <div className="p-2 bg-yellow-100 rounded-xl mr-3">
                      <Activity className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-yellow-800">Backup dữ liệu</h4>
                      <p className="text-sm text-yellow-600">Lần backup cuối: 2 ngày trước</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {quickActions.map((action, index) => (
                    <button key={index} className="w-full text-left group">
                      <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center">
                          <div className={`${action.color} rounded-xl p-2 mr-3 text-white`}>
                            <action.icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{action.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h3>
              </div>
              <div className="p-6 space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <div className={`p-2 rounded-xl ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
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

export default AdminDashboard;