import React from 'react';
import { Users, Calendar, CheckCircle, Clock, TrendingUp, Bell, Settings, User, Phone } from 'lucide-react';

const StaffDashboard: React.FC = () => {
  const stats = [
    { label: 'Khách hàng', value: '248', icon: Users, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Lịch hẹn hôm nay', value: '12', icon: Calendar, gradient: 'from-green-500 to-green-600' },
    { label: 'Hoàn thành', value: '8', icon: CheckCircle, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Chờ xử lý', value: '4', icon: Clock, gradient: 'from-orange-500 to-orange-600' }
  ];

  const todayAppointments = [
    {
      id: 1,
      customer: 'Nguyễn Văn A',
      phone: '0987654321',
      vehicle: 'VinFast VF8',
      service: 'Bảo dưỡng định kỳ',
      time: '09:00',
      status: 'confirmed',
      priority: 'high'
    },
    {
      id: 2,
      customer: 'Trần Thị B',
      phone: '0976543210',
      vehicle: 'VinFast VF5',
      service: 'Kiểm tra pin',
      time: '10:30',
      status: 'pending',
      priority: 'medium'
    },
    {
      id: 3,
      customer: 'Lê Văn C',
      phone: '0965432109',
      vehicle: 'Tesla Model 3',
      service: 'Sửa chữa hệ thống điện',
      time: '14:00',
      status: 'in-progress',
      priority: 'high'
    }
  ];

  const recentCustomers = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      lastVisit: '2025-01-15',
      totalServices: 5
    },
    {
      id: 2,
      name: 'Trần Thị B',
      phone: '0976543210',
      lastVisit: '2025-01-14',
      totalServices: 3
    }
  ];

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
      case 'pending': return 'Chờ xác nhận';
      case 'in-progress': return 'Đang thực hiện';
      case 'completed': return 'Hoàn thành';
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Nhân viên</h1>
              <p className="text-lg text-gray-600">Quản lý khách hàng và lịch hẹn dịch vụ hiệu quả</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-3 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">4</span>
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
                  <span className="text-sm font-medium">+8% từ tuần trước</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Appointments - VinFast Style */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Lịch hẹn hôm nay</h3>
                  <span className="text-sm text-gray-500">12 lịch hẹn</span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className={`bg-gray-50 rounded-2xl p-6 border-l-4 ${getPriorityColor(appointment.priority)} hover:bg-gray-100 transition-colors`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900 text-lg">{appointment.customer}</h4>
                          <span className="text-sm font-medium text-gray-500">{appointment.time}</span>
                        </div>
                        <p className="text-gray-600 mb-1">{appointment.service}</p>
                        <p className="text-sm text-gray-500">{appointment.vehicle}</p>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{appointment.phone}</span>
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusText(appointment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions - VinFast Style */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Thao tác nhanh</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {[
                    { label: 'Tạo lịch hẹn mới', color: 'bg-blue-500', action: 'create-appointment' },
                    { label: 'Quản lý khách hàng', color: 'bg-green-500', action: 'manage-customers' },
                    { label: 'Báo cáo doanh thu', color: 'bg-purple-500', action: 'revenue-report' },
                    { label: 'Hỗ trợ kỹ thuật', color: 'bg-orange-500', action: 'technical-support' }
                  ].map((action, index) => (
                    <button key={index} className="w-full text-left group">
                      <div className="bg-gray-50 rounded-2xl p-4 hover:bg-gray-100 transition-all duration-300 group-hover:scale-105">
                        <div className="flex items-center">
                          <div className={`${action.color} rounded-xl p-2 mr-3`}>
                            <div className="w-4 h-4 bg-white rounded-full"></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{action.label}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Customers - VinFast Style */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Khách hàng gần đây</h3>
              </div>
              <div className="p-6 space-y-4">
                {recentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      <p className="text-sm text-gray-500">{customer.phone}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Lần cuối: {customer.lastVisit} • {customer.totalServices} dịch vụ
                      </p>
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

export default StaffDashboard;