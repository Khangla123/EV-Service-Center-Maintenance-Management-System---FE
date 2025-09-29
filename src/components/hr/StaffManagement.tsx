import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Calendar, Star, Clock, Award, DollarSign, TrendingUp } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'staff' | 'technician' | 'customer-service';
  department: 'administration' | 'technical' | 'customer-service' | 'inventory';
  position: string;
  hireDate: Date;
  salary: number;
  status: 'active' | 'inactive' | 'terminated';
  avatar?: string;
  specialties: string[];
  certifications: string[];
  // Performance metrics
  totalCompletedJobs: number;
  averageJobTime: number; // in hours
  customerRating: number; // 1-5 stars
  attendanceRate: number; // percentage
  // Schedule
  workingHours: {
    monday: { start: string; end: string; } | null;
    tuesday: { start: string; end: string; } | null;
    wednesday: { start: string; end: string; } | null;
    thursday: { start: string; end: string; } | null;
    friday: { start: string; end: string; } | null;
    saturday: { start: string; end: string; } | null;
    sunday: { start: string; end: string; } | null;
  };
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  startTime: string;
  endTime: string;
  shiftType: 'morning' | 'afternoon' | 'evening' | 'night';
  status: 'scheduled' | 'checked-in' | 'checked-out' | 'absent' | 'late';
  actualStartTime?: string;
  actualEndTime?: string;
  notes?: string;
}

interface PerformanceRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  completedJobs: number;
  averageJobTime: number;
  customerRating: number;
  attendanceDays: number;
  totalWorkingDays: number;
  bonusEarned: number;
  notes?: string;
}

const StaffManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'schedule' | 'performance'>('list');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Mock data
  useEffect(() => {
    const mockEmployees: Employee[] = [
      {
        id: 'emp1',
        employeeCode: 'EMP001',
        firstName: 'Lê',
        lastName: 'Văn C',
        email: 'levanc@evservice.com',
        phone: '0987654321',
        role: 'technician',
        department: 'technical',
        position: 'Kỹ thuật viên cao cấp',
        hireDate: new Date('2020-03-15'),
        salary: 15000000,
        status: 'active',
        specialties: ['Bảo dưỡng định kỳ', 'Kiểm tra pin', 'Hệ thống điện'],
        certifications: ['EV Technician Level 2', 'Safety Training'],
        totalCompletedJobs: 145,
        averageJobTime: 2.5,
        customerRating: 4.8,
        attendanceRate: 96,
        workingHours: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: null,
          sunday: null
        }
      },
      {
        id: 'emp2',
        employeeCode: 'EMP002',
        firstName: 'Nguyễn',
        lastName: 'Thành E',
        email: 'nguyenthanhe@evservice.com',
        phone: '0976543210',
        role: 'technician',
        department: 'technical',
        position: 'Kỹ thuật viên trưởng',
        hireDate: new Date('2018-07-20'),
        salary: 18000000,
        status: 'active',
        specialties: ['Hệ thống điện', 'Sửa chữa phức tạp', 'Kiểm tra an toàn'],
        certifications: ['EV Technician Level 3', 'Team Leader', 'Safety Training'],
        totalCompletedJobs: 230,
        averageJobTime: 3.2,
        customerRating: 4.9,
        attendanceRate: 98,
        workingHours: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: { start: '08:00', end: '12:00' },
          sunday: null
        }
      },
      {
        id: 'emp3',
        employeeCode: 'EMP003',
        firstName: 'Trần',
        lastName: 'Thị D',
        email: 'tranthid@evservice.com',
        phone: '0965432109',
        role: 'staff',
        department: 'customer-service',
        position: 'Nhân viên tư vấn',
        hireDate: new Date('2021-01-10'),
        salary: 12000000,
        status: 'active',
        specialties: ['Tư vấn khách hàng', 'Lên lịch hẹn', 'Xử lý khiếu nại'],
        certifications: ['Customer Service Excellence', 'Communication Skills'],
        totalCompletedJobs: 320,
        averageJobTime: 0.5,
        customerRating: 4.7,
        attendanceRate: 94,
        workingHours: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          saturday: { start: '08:00', end: '17:00' },
          sunday: { start: '08:00', end: '17:00' }
        }
      }
    ];

    const mockShifts: Shift[] = [
      {
        id: 'shift1',
        employeeId: 'emp1',
        employeeName: 'Lê Văn C',
        date: new Date('2025-01-20'),
        startTime: '08:00',
        endTime: '17:00',
        shiftType: 'morning',
        status: 'checked-out',
        actualStartTime: '08:05',
        actualEndTime: '17:10'
      },
      {
        id: 'shift2',
        employeeId: 'emp2',
        employeeName: 'Nguyễn Thành E',
        date: new Date('2025-01-20'),
        startTime: '08:00',
        endTime: '17:00',
        shiftType: 'morning',
        status: 'checked-out',
        actualStartTime: '07:55',
        actualEndTime: '17:05'
      },
      {
        id: 'shift3',
        employeeId: 'emp3',
        employeeName: 'Trần Thị D',
        date: new Date('2025-01-20'),
        startTime: '08:00',
        endTime: '17:00',
        shiftType: 'morning',
        status: 'checked-out',
        actualStartTime: '08:10',
        actualEndTime: '17:00',
        notes: 'Đến muộn 10 phút'
      }
    ];

    const mockPerformanceRecords: PerformanceRecord[] = [
      {
        id: 'perf1',
        employeeId: 'emp1',
        month: 12,
        year: 2024,
        completedJobs: 28,
        averageJobTime: 2.3,
        customerRating: 4.8,
        attendanceDays: 22,
        totalWorkingDays: 22,
        bonusEarned: 1000000
      },
      {
        id: 'perf2',
        employeeId: 'emp2',
        month: 12,
        year: 2024,
        completedJobs: 35,
        averageJobTime: 3.1,
        customerRating: 4.9,
        attendanceDays: 24,
        totalWorkingDays: 24,
        bonusEarned: 1500000
      }
    ];

    setEmployees(mockEmployees);
    setShifts(mockShifts);
    setPerformanceRecords(mockPerformanceRecords);
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment;
    const matchesRole = filterRole === 'all' || emp.role === filterRole;
    return matchesDepartment && matchesRole;
  });

  const getRoleDisplay = (role: Employee['role']) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'manager': return 'Quản lý';
      case 'staff': return 'Nhân viên';
      case 'technician': return 'Kỹ thuật viên';
      case 'customer-service': return 'Chăm sóc KH';
      default: return role;
    }
  };

  const getDepartmentDisplay = (department: Employee['department']) => {
    switch (department) {
      case 'administration': return 'Hành chính';
      case 'technical': return 'Kỹ thuật';
      case 'customer-service': return 'Chăm sóc KH';
      case 'inventory': return 'Kho vận';
      default: return department;
    }
  };

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'terminated': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderEmployeesList = () => (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng nhân viên</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đang làm việc</p>
              <p className="text-2xl font-bold text-green-600">
                {employees.filter(emp => emp.status === 'active').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Award className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Kỹ thuật viên</p>
              <p className="text-2xl font-bold text-purple-600">
                {employees.filter(emp => emp.role === 'technician').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Điểm TB</p>
              <p className="text-2xl font-bold text-orange-600">
                {(employees.reduce((sum, emp) => sum + emp.customerRating, 0) / employees.length).toFixed(1)}
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
        >
          <option value="all">Tất cả phòng ban</option>
          <option value="administration">Hành chính</option>
          <option value="technical">Kỹ thuật</option>
          <option value="customer-service">Chăm sóc KH</option>
          <option value="inventory">Kho vận</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Quản trị viên</option>
          <option value="manager">Quản lý</option>
          <option value="staff">Nhân viên</option>
          <option value="technician">Kỹ thuật viên</option>
          <option value="customer-service">Chăm sóc KH</option>
        </select>

        <MDButton
          onClick={() => setShowAddEmployeeModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </MDButton>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <MDCard key={employee.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold">
                    {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {employee.lastName} {employee.firstName}
                  </h3>
                  <p className="text-sm text-gray-500">{employee.employeeCode}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                {employee.status === 'active' && 'Hoạt động'}
                {employee.status === 'inactive' && 'Tạm nghỉ'}
                {employee.status === 'terminated' && 'Nghỉ việc'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vị trí:</span>
                <span className="text-gray-900">{employee.position}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Phòng ban:</span>
                <span className="text-gray-900">{getDepartmentDisplay(employee.department)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Vai trò:</span>
                <span className="text-gray-900">{getRoleDisplay(employee.role)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lương CB:</span>
                <span className="text-gray-900 font-medium">
                  {(employee.salary / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{employee.customerRating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Đánh giá</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{employee.totalCompletedJobs}</p>
                  <p className="text-xs text-gray-500">Công việc</p>
                </div>
                <div>
                  <p className="text-sm font-medium">{employee.attendanceRate}%</p>
                  <p className="text-xs text-gray-500">Chuyên cần</p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Chuyên môn:</p>
              <div className="flex flex-wrap gap-1">
                {employee.specialties.slice(0, 2).map((specialty, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    {specialty}
                  </span>
                ))}
                {employee.specialties.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{employee.specialties.length - 2}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <MDButton
                onClick={() => {
                  setSelectedEmployee(employee);
                  setShowEditEmployeeModal(true);
                }}
                size="small"
                variant="outlined"
              >
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </MDButton>
              <MDButton
                onClick={() => {
                  setSelectedEmployee(employee);
                  setShowScheduleModal(true);
                }}
                size="small"
                variant="outlined"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Lịch làm
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Lịch làm việc hôm nay</h3>
      <div className="space-y-3">
        {shifts.filter(shift => 
          shift.date.toDateString() === new Date().toDateString()
        ).map((shift) => (
          <MDCard key={shift.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900">{shift.employeeName}</h4>
                <p className="text-sm text-gray-600">
                  {shift.startTime} - {shift.endTime}
                  {shift.actualStartTime && shift.actualEndTime && (
                    <span className="ml-2 text-gray-500">
                      (Thực tế: {shift.actualStartTime} - {shift.actualEndTime})
                    </span>
                  )}
                </p>
                {shift.notes && (
                  <p className="text-sm text-orange-600">{shift.notes}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  shift.status === 'checked-out' ? 'text-green-600 bg-green-100' :
                  shift.status === 'checked-in' ? 'text-blue-600 bg-blue-100' :
                  shift.status === 'late' ? 'text-orange-600 bg-orange-100' :
                  shift.status === 'absent' ? 'text-red-600 bg-red-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  {shift.status === 'scheduled' && 'Đã lên lịch'}
                  {shift.status === 'checked-in' && 'Đã check-in'}
                  {shift.status === 'checked-out' && 'Đã check-out'}
                  {shift.status === 'absent' && 'Vắng mặt'}
                  {shift.status === 'late' && 'Đến muộn'}
                </span>
              </div>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Báo cáo hiệu suất tháng 12/2024</h3>
      <div className="space-y-3">
        {performanceRecords.map((record) => {
          const employee = employees.find(emp => emp.id === record.employeeId);
          if (!employee) return null;

          return (
            <MDCard key={record.id} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {employee.lastName} {employee.firstName}
                  </h4>
                  <p className="text-sm text-gray-600">{employee.position}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-600">
                    +{record.bonusEarned.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-sm text-gray-500">Thưởng tháng</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-lg font-semibold">{record.completedJobs}</p>
                  <p className="text-xs text-gray-500">Công việc</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{record.averageJobTime.toFixed(1)}h</p>
                  <p className="text-xs text-gray-500">TB/công việc</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-lg font-semibold">{record.customerRating}</span>
                  </div>
                  <p className="text-xs text-gray-500">Đánh giá KH</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    {Math.round((record.attendanceDays / record.totalWorkingDays) * 100)}%
                  </p>
                  <p className="text-xs text-gray-500">Chuyên cần</p>
                </div>
              </div>
            </MDCard>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="staff-management p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý nhân sự</h1>
          <p className="text-gray-600">Quản lý nhân viên, lịch làm việc và hiệu suất</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'list', label: 'Danh sách nhân viên', icon: Users },
          { id: 'schedule', label: 'Lịch làm việc', icon: Calendar },
          { id: 'performance', label: 'Hiệu suất', icon: TrendingUp }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'list' && renderEmployeesList()}
      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'performance' && renderPerformance()}
    </div>
  );
};

export default StaffManagement;