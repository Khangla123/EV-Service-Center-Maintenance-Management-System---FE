import React, { useState, useEffect } from 'react';
import { User, Calendar, Clock, Car, Wrench, CheckCircle, AlertCircle, Star, Badge } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialties: string[];
  experience: number; // years
  currentWorkload: number; // current assignments
  maxWorkload: number; // maximum assignments
  rating: number; // 1-5 stars
  status: 'available' | 'busy' | 'offline';
  avatar?: string;
}

interface Assignment {
  id: string;
  appointmentId: string;
  customerId: string;
  customerName: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  appointmentDate: Date;
  appointmentTime: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  technicianId?: string;
  technicianName?: string;
  status: 'unassigned' | 'assigned' | 'in-progress' | 'completed';
  assignedAt?: Date;
  completedAt?: Date;
}

const TechnicianAssignment: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockTechnicians: Technician[] = [
      {
        id: 'tech1',
        name: 'Lê Văn C',
        email: 'levanc@evservice.com',
        phone: '0987654321',
        specialties: ['Bảo dưỡng định kỳ', 'Kiểm tra pin', 'Hệ thống điện'],
        experience: 5,
        currentWorkload: 2,
        maxWorkload: 4,
        rating: 4.8,
        status: 'available'
      },
      {
        id: 'tech2',
        name: 'Nguyễn Thành E',
        email: 'nguyenthanhe@evservice.com',
        phone: '0976543210',
        specialties: ['Hệ thống điện', 'Sửa chữa phức tạp', 'Kiểm tra an toàn'],
        experience: 8,
        currentWorkload: 3,
        maxWorkload: 5,
        rating: 4.9,
        status: 'busy'
      },
      {
        id: 'tech3',
        name: 'Trần Văn F',
        email: 'tranvanf@evservice.com',
        phone: '0965432109',
        specialties: ['Bảo dưỡng định kỳ', 'Thay thế linh kiện', 'Kiểm tra pin'],
        experience: 3,
        currentWorkload: 1,
        maxWorkload: 3,
        rating: 4.5,
        status: 'available'
      },
      {
        id: 'tech4',
        name: 'Phạm Thị G',
        email: 'phamthig@evservice.com',
        phone: '0954321098',
        specialties: ['Kiểm tra an toàn', 'Bảo dưỡng định kỳ', 'Hệ thống phanh'],
        experience: 6,
        currentWorkload: 4,
        maxWorkload: 4,
        rating: 4.7,
        status: 'busy'
      }
    ];

    const mockAssignments: Assignment[] = [
      {
        id: 'assign1',
        appointmentId: 'apt1',
        customerId: 'cust1',
        customerName: 'Nguyễn Văn A',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF8',
        licensePlate: '30A-12345',
        serviceType: 'Bảo dưỡng định kỳ',
        appointmentDate: new Date('2025-01-20'),
        appointmentTime: '09:00',
        estimatedDuration: 2,
        priority: 'high',
        status: 'unassigned'
      },
      {
        id: 'assign2',
        appointmentId: 'apt2',
        customerId: 'cust2',
        customerName: 'Trần Thị B',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF5',
        licensePlate: '51G-98765',
        serviceType: 'Kiểm tra pin',
        appointmentDate: new Date('2025-01-20'),
        appointmentTime: '10:30',
        estimatedDuration: 1,
        priority: 'medium',
        technicianId: 'tech1',
        technicianName: 'Lê Văn C',
        status: 'assigned',
        assignedAt: new Date('2025-01-18T14:30:00')
      },
      {
        id: 'assign3',
        appointmentId: 'apt3',
        customerId: 'cust3',
        customerName: 'Phạm Văn D',
        vehicleBrand: 'Tesla',
        vehicleModel: 'Model 3',
        licensePlate: '29B-11111',
        serviceType: 'Sửa chữa hệ thống điện',
        appointmentDate: new Date('2025-01-21'),
        appointmentTime: '14:00',
        estimatedDuration: 4,
        priority: 'high',
        technicianId: 'tech2',
        technicianName: 'Nguyễn Thành E',
        status: 'in-progress',
        assignedAt: new Date('2025-01-19T09:00:00')
      }
    ];

    setTechnicians(mockTechnicians);
    setAssignments(mockAssignments);
  }, []);

  const handleAssignTechnician = (assignmentId: string, technicianId: string) => {
    const technician = technicians.find(t => t.id === technicianId);
    if (!technician) return;

    // Update assignment
    setAssignments(prev =>
      prev.map(assignment =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              technicianId,
              technicianName: technician.name,
              status: 'assigned',
              assignedAt: new Date()
            }
          : assignment
      )
    );

    // Update technician workload
    setTechnicians(prev =>
      prev.map(tech =>
        tech.id === technicianId
          ? {
              ...tech,
              currentWorkload: tech.currentWorkload + 1,
              status: tech.currentWorkload + 1 >= tech.maxWorkload ? 'busy' : 'available'
            }
          : tech
      )
    );
  };

  const handleUnassignTechnician = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment || !assignment.technicianId) return;

    // Update assignment
    setAssignments(prev =>
      prev.map(a =>
        a.id === assignmentId
          ? {
              ...a,
              technicianId: undefined,
              technicianName: undefined,
              status: 'unassigned',
              assignedAt: undefined
            }
          : a
      )
    );

    // Update technician workload
    setTechnicians(prev =>
      prev.map(tech =>
        tech.id === assignment.technicianId
          ? {
              ...tech,
              currentWorkload: Math.max(0, tech.currentWorkload - 1),
              status: 'available'
            }
          : tech
      )
    );
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'unassigned': return 'text-red-600 bg-red-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-purple-600 bg-purple-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: Assignment['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTechnicianStatusColor = (status: Technician['status']) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'busy': return 'text-orange-600 bg-orange-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const canAssignToTechnician = (technician: Technician, serviceType: string) => {
    return technician.status !== 'offline' && 
           technician.currentWorkload < technician.maxWorkload &&
           technician.specialties.includes(serviceType);
  };

  const unassignedWork = assignments.filter(a => a.status === 'unassigned');
  const allSpecialties = Array.from(new Set(technicians.flatMap(t => t.specialties)));

  return (
    <div className="technician-assignment p-6">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Phân công kỹ thuật viên</h1>
        <p className="text-gray-600">Quản lý và phân công kỹ thuật viên cho các công việc</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technicians Panel */}
        <div className="lg:col-span-1">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Kỹ thuật viên</h2>
            
            {/* Filters */}
            <div className="space-y-2 mb-4">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="all">Tất cả chuyên môn</option>
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
              
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Rảnh</option>
                <option value="busy">Bận</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {technicians
              .filter(tech => 
                (filterSpecialty === 'all' || tech.specialties.includes(filterSpecialty)) &&
                (filterStatus === 'all' || tech.status === filterStatus)
              )
              .map((technician) => (
                <MDCard 
                  key={technician.id} 
                  className={`p-4 cursor-pointer transition-all ${
                    selectedTechnician?.id === technician.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTechnician(technician)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{technician.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechnicianStatusColor(technician.status)}`}>
                      {technician.status === 'available' && 'Rảnh'}
                      {technician.status === 'busy' && 'Bận'}
                      {technician.status === 'offline' && 'Offline'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{technician.rating}/5</span>
                    <Badge className="h-4 w-4 text-gray-400 ml-2 mr-1" />
                    <span className="text-sm text-gray-600">{technician.experience} năm</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    Workload: {technician.currentWorkload}/{technician.maxWorkload}
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {technician.specialties.slice(0, 2).map((specialty, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        {specialty}
                      </span>
                    ))}
                    {technician.specialties.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                        +{technician.specialties.length - 2}
                      </span>
                    )}
                  </div>
                </MDCard>
              ))}
          </div>
        </div>

        {/* Assignments Panel */}
        <div className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Công việc cần phân công ({unassignedWork.length})
            </h2>
          </div>

          <div className="space-y-4">
            {assignments.map((assignment) => (
              <MDCard key={assignment.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {assignment.customerName} - {assignment.serviceType}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Car className="h-4 w-4 mr-2" />
                      {assignment.vehicleBrand} {assignment.vehicleModel} - {assignment.licensePlate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {assignment.appointmentDate.toLocaleDateString('vi-VN')}
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      {assignment.appointmentTime} ({assignment.estimatedDuration}h)
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {assignment.status === 'unassigned' && 'Chưa phân công'}
                      {assignment.status === 'assigned' && 'Đã phân công'}
                      {assignment.status === 'in-progress' && 'Đang thực hiện'}
                      {assignment.status === 'completed' && 'Hoàn thành'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                      {assignment.priority === 'high' && 'Ưu tiên cao'}
                      {assignment.priority === 'medium' && 'Ưu tiên trung bình'}
                      {assignment.priority === 'low' && 'Ưu tiên thấp'}
                    </span>
                  </div>
                </div>

                {assignment.technicianName && (
                  <div className="flex items-center text-sm text-blue-600 mb-3">
                    <User className="h-4 w-4 mr-2" />
                    Đã phân công: {assignment.technicianName}
                    {assignment.assignedAt && (
                      <span className="ml-2 text-gray-500">
                        ({assignment.assignedAt.toLocaleString('vi-VN')})
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {assignment.status === 'unassigned' && selectedTechnician && (
                    <MDButton
                      onClick={() => handleAssignTechnician(assignment.id, selectedTechnician.id)}
                      disabled={!canAssignToTechnician(selectedTechnician, assignment.serviceType)}
                      className={
                        canAssignToTechnician(selectedTechnician, assignment.serviceType)
                          ? "bg-blue-500 hover:bg-blue-600"
                          : "bg-gray-300 cursor-not-allowed"
                      }
                      size="small"
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Phân công cho {selectedTechnician.name}
                    </MDButton>
                  )}
                  
                  {assignment.status === 'assigned' && (
                    <MDButton
                      onClick={() => handleUnassignTechnician(assignment.id)}
                      variant="outlined"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      size="small"
                    >
                      Hủy phân công
                    </MDButton>
                  )}
                </div>

                {assignment.status === 'unassigned' && !selectedTechnician && (
                  <p className="text-sm text-gray-500 mt-2">
                    Chọn kỹ thuật viên từ danh sách bên trái để phân công
                  </p>
                )}

                {assignment.status === 'unassigned' && selectedTechnician && 
                 !canAssignToTechnician(selectedTechnician, assignment.serviceType) && (
                  <p className="text-sm text-red-500 mt-2">
                    {!selectedTechnician.specialties.includes(assignment.serviceType) 
                      ? "Kỹ thuật viên không có chuyên môn phù hợp"
                      : "Kỹ thuật viên đang quá tải"
                    }
                  </p>
                )}
              </MDCard>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Không có công việc nào cần phân công</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TechnicianAssignment;