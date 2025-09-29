import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Car, CheckCircle, XCircle, AlertCircle, Filter, Search } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  technicianId?: string;
  technicianName?: string;
  estimatedDuration: number; // in hours
  createdAt: Date;
}

const AppointmentManagement: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Mock data
  useEffect(() => {
    const mockAppointments: Appointment[] = [
      {
        id: '1',
        customerId: 'cust1',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0987654321',
        vehicleId: 'vehicle1',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF8',
        licensePlate: '30A-12345',
        serviceType: 'Bảo dưỡng định kỳ',
        appointmentDate: new Date('2025-01-20'),
        appointmentTime: '09:00',
        status: 'pending',
        priority: 'high',
        notes: 'Khách hàng yêu cầu kiểm tra đặc biệt hệ thống phanh',
        estimatedDuration: 2,
        createdAt: new Date('2025-01-15')
      },
      {
        id: '2',
        customerId: 'cust2',
        customerName: 'Trần Thị B',
        customerPhone: '0976543210',
        vehicleId: 'vehicle2',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF5',
        licensePlate: '51G-98765',
        serviceType: 'Kiểm tra pin',
        appointmentDate: new Date('2025-01-20'),
        appointmentTime: '10:30',
        status: 'confirmed',
        priority: 'medium',
        technicianId: 'tech1',
        technicianName: 'Lê Văn C',
        estimatedDuration: 1,
        createdAt: new Date('2025-01-16')
      },
      {
        id: '3',
        customerId: 'cust3',
        customerName: 'Phạm Văn D',
        customerPhone: '0965432109',
        vehicleId: 'vehicle3',
        vehicleBrand: 'Tesla',
        vehicleModel: 'Model 3',
        licensePlate: '29B-11111',
        serviceType: 'Sửa chữa hệ thống điện',
        appointmentDate: new Date('2025-01-21'),
        appointmentTime: '14:00',
        status: 'in-progress',
        priority: 'high',
        technicianId: 'tech2',
        technicianName: 'Nguyễn Thành E',
        estimatedDuration: 4,
        createdAt: new Date('2025-01-18')
      }
    ];
    
    setAppointments(mockAppointments);
    setFilteredAppointments(mockAppointments);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = appointments;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Filter by date
    if (filterDate) {
      filtered = filtered.filter(app => 
        app.appointmentDate.toISOString().split('T')[0] === filterDate
      );
    }

    // Search by customer name, phone, or license plate
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.customerPhone.includes(searchTerm) ||
        app.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, filterStatus, filterDate, searchTerm]);

  const handleStatusUpdate = (appointmentId: string, newStatus: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId ? { ...app, status: newStatus } : app
      )
    );
  };

  const handleAssignTechnician = (appointmentId: string, technicianId: string, technicianName: string) => {
    setAppointments(prev =>
      prev.map(app =>
        app.id === appointmentId 
          ? { ...app, technicianId, technicianName, status: 'confirmed' }
          : app
      )
    );
  };

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Appointment['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="appointment-management p-6">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý lịch hẹn</h1>
        <p className="text-gray-600">Tiếp nhận và quản lý lịch hẹn từ khách hàng</p>
      </div>

      {/* Filters and Search */}
      <div className="filters-section mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="search-box">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm khách hàng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="in-progress">Đang thực hiện</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />

        <div className="text-sm text-gray-600 flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Hiển thị: {filteredAppointments.length} lịch hẹn
        </div>
      </div>

      {/* Appointments List */}
      <div className="appointments-grid grid gap-4">
        {filteredAppointments.map((appointment) => (
          <MDCard key={appointment.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {appointment.customerName}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Phone className="h-4 w-4 mr-2" />
                  {appointment.customerPhone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Car className="h-4 w-4 mr-2" />
                  {appointment.vehicleBrand} {appointment.vehicleModel} - {appointment.licensePlate}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                  {appointment.status === 'pending' && 'Chờ xác nhận'}
                  {appointment.status === 'confirmed' && 'Đã xác nhận'}
                  {appointment.status === 'in-progress' && 'Đang thực hiện'}
                  {appointment.status === 'completed' && 'Hoàn thành'}
                  {appointment.status === 'cancelled' && 'Đã hủy'}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(appointment.priority)}`}>
                  {appointment.priority === 'high' && 'Ưu tiên cao'}
                  {appointment.priority === 'medium' && 'Ưu tiên trung bình'}
                  {appointment.priority === 'low' && 'Ưu tiên thấp'}
                </span>
              </div>
            </div>

            <div className="service-details mb-4">
              <p className="font-medium text-gray-900 mb-1">{appointment.serviceType}</p>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                {appointment.appointmentDate.toLocaleDateString('vi-VN')}
                <Clock className="h-4 w-4 ml-4 mr-2" />
                {appointment.appointmentTime}
                <span className="ml-4">({appointment.estimatedDuration}h dự kiến)</span>
              </div>
              {appointment.technicianName && (
                <div className="flex items-center text-sm text-blue-600">
                  <User className="h-4 w-4 mr-2" />
                  Kỹ thuật viên: {appointment.technicianName}
                </div>
              )}
            </div>

            {appointment.notes && (
              <div className="notes mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Ghi chú:</strong> {appointment.notes}
                </p>
              </div>
            )}

            <div className="actions flex flex-wrap gap-2">
              {appointment.status === 'pending' && (
                <>
                  <MDButton
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    className="bg-blue-500 hover:bg-blue-600"
                    size="small"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Xác nhận
                  </MDButton>
                  <MDButton
                    onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    variant="outlined"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    size="small"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Từ chối
                  </MDButton>
                </>
              )}
              
              {appointment.status === 'confirmed' && !appointment.technicianId && (
                <MDButton
                  onClick={() => handleAssignTechnician(appointment.id, 'tech1', 'Lê Văn C')}
                  className="bg-purple-500 hover:bg-purple-600"
                  size="small"
                >
                  <User className="h-4 w-4 mr-1" />
                  Phân công KTV
                </MDButton>
              )}

              {appointment.status === 'confirmed' && appointment.technicianId && (
                <MDButton
                  onClick={() => handleStatusUpdate(appointment.id, 'in-progress')}
                  className="bg-green-500 hover:bg-green-600"
                  size="small"
                >
                  Bắt đầu dịch vụ
                </MDButton>
              )}

              <MDButton
                onClick={() => {
                  setSelectedAppointment(appointment);
                  setShowDetails(true);
                }}
                variant="outlined"
                size="small"
              >
                Chi tiết
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Không có lịch hẹn nào phù hợp với bộ lọc</p>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;