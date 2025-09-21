import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Car, Calendar, History, CreditCard, Bell, Settings, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const stats = [
    { label: 'Xe của tôi', value: '2', icon: Car, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Lịch hẹn', value: '3', icon: Calendar, gradient: 'from-green-500 to-green-600' },
    { label: 'Hoàn tất', value: '12', icon: CheckCircle, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Chi phí tháng', value: '2.5M', icon: CreditCard, gradient: 'from-orange-500 to-orange-600' }
  ];

  const appointments = [
    {
      id: 1,
      vehicle: 'VinFast VF8',
      service: 'Bảo dưỡng định kỳ',
      date: '2025-01-20',
      time: '09:00',
      status: 'confirmed',
      priority: 'high'
    },
    {
      id: 2,
      vehicle: 'VinFast VF5',
      service: 'Kiểm tra pin',
      date: '2025-01-22',
      time: '14:00',
      status: 'pending',
      priority: 'medium'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Bảo dưỡng định kỳ hoàn tất',
      vehicle: 'VinFast VF8',
      date: '2025-01-15',
      type: 'maintenance'
    },
    {
      id: 2,
      action: 'Thanh toán hóa đơn',
      amount: '1.2M VND',
      date: '2025-01-14',
      type: 'payment'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Chờ xác nhận';
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
      <Routes>
        <Route path="/dashboard" element={
          <div className="container">
            {/* VinFast-inspired Header */}
            <div className="bg-white rounded-3xl shadow-lg mb-8 p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-50 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Khách hàng</h1>
                  <p className="text-lg text-gray-600">Chào mừng bạn trở lại! Quản lý xe và dịch vụ của bạn tại đây.</p>
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
                      <span className="text-sm font-medium">+12% từ tháng trước</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Appointments - VinFast Style */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">Lịch hẹn sắp tới</h3>
                      <a href="/customer/booking" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        Xem tất cả →
                      </a>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className={`bg-gray-50 rounded-2xl p-6 border-l-4 ${getPriorityColor(appointment.priority)} hover:bg-gray-100 transition-colors`}>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg">{appointment.vehicle}</h4>
                            <p className="text-gray-600 mt-1">{appointment.service}</p>
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{appointment.date} - {appointment.time}</span>
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-sm font-medium ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 && (
                      <div className="text-center py-12">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không có lịch hẹn nào</p>
                      </div>
                    )}
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
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { href: '/customer/booking', icon: Calendar, label: 'Đặt lịch', color: 'bg-blue-500' },
                        { href: '/customer/vehicles', icon: Car, label: 'Quản lý xe', color: 'bg-green-500' },
                        { href: '/customer/history', icon: History, label: 'Lịch sử', color: 'bg-purple-500' },
                        { href: '/customer/payment', icon: CreditCard, label: 'Thanh toán', color: 'bg-orange-500' }
                      ].map((action, index) => (
                        <a key={index} href={action.href} className="group block">
                          <div className="bg-gray-50 rounded-2xl p-4 text-center hover:bg-gray-100 transition-all duration-300 group-hover:scale-105">
                            <div className={`${action.color} rounded-xl p-3 inline-flex mb-3`}>
                              <action.icon className="h-6 w-6 text-white" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">{action.label}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Activity - VinFast Style */}
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Hoạt động gần đây</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4">
                        <div className={`p-2 rounded-xl ${activity.type === 'maintenance' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          {activity.type === 'maintenance' ? (
                            <Car className={`h-4 w-4 ${activity.type === 'maintenance' ? 'text-blue-600' : 'text-green-600'}`} />
                          ) : (
                            <CreditCard className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.vehicle || activity.amount}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        } />
        <Route path="/*" element={
          <div className="container">
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <AlertCircle className="h-16 w-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tính năng đang phát triển</h2>
                <p className="text-gray-600">Tính năng này sẽ được hoàn thiện trong phiên bản tiếp theo.</p>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
};

export default CustomerDashboard;