import React, { useState, useEffect } from 'react';
import { Users, Car, Plus, Edit, Trash2, Search, Eye, History, Phone, Mail, MapPin } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Customer {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  registrationDate: Date;
  status: 'active' | 'inactive' | 'vip';
  totalSpent: number;
  totalVisits: number;
  lastVisit?: Date;
  preferredContact: 'phone' | 'email' | 'sms';
  notes?: string;
  vehicles: Vehicle[];
}

interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  color: string;
  batteryCapacity?: number;
  mileage: number;
  purchaseDate: Date;
  warrantyExpiration?: Date;
  lastServiceDate?: Date;
  nextServiceDue?: Date;
  status: 'active' | 'inactive' | 'sold';
  serviceHistory: ServiceHistory[];
}

interface ServiceHistory {
  id: string;
  vehicleId: string;
  serviceDate: Date;
  serviceType: string;
  description: string;
  cost: number;
  mileageAtService: number;
  technicianName: string;
  partsUsed: string[];
  nextServiceRecommendation?: string;
  customerSatisfaction?: number;
}

const CustomerVehicleManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [showCustomerDetailsModal, setShowCustomerDetailsModal] = useState(false);
  const [showVehicleHistoryModal, setShowVehicleHistoryModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'customers' | 'vehicles'>('customers');

  // Mock data
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: 'cust1',
        customerCode: 'KH001',
        firstName: 'Nguyễn',
        lastName: 'Văn A',
        email: 'nguyenvana@email.com',
        phone: '0987654321',
        address: '123 Nguyễn Huệ, Q.1, TP.HCM',
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        registrationDate: new Date('2023-03-15'),
        status: 'vip',
        totalSpent: 15500000,
        totalVisits: 8,
        lastVisit: new Date('2025-01-15'),
        preferredContact: 'phone',
        notes: 'Khách hàng VIP, ưu tiên cao',
        vehicles: [
          {
            id: 'vehicle1',
            customerId: 'cust1',
            make: 'VinFast',
            model: 'VF8',
            year: 2023,
            vin: 'VF8ABC123456789',
            licensePlate: '30A-12345',
            color: 'Đen',
            batteryCapacity: 87.7,
            mileage: 15000,
            purchaseDate: new Date('2023-05-20'),
            warrantyExpiration: new Date('2026-05-20'),
            lastServiceDate: new Date('2025-01-15'),
            nextServiceDue: new Date('2025-07-15'),
            status: 'active',
            serviceHistory: [
              {
                id: 'service1',
                vehicleId: 'vehicle1',
                serviceDate: new Date('2025-01-15'),
                serviceType: 'Bảo dưỡng định kỳ',
                description: 'Thay má phanh, dầu phanh, kiểm tra tổng thể',
                cost: 950000,
                mileageAtService: 15000,
                technicianName: 'Lê Văn C',
                partsUsed: ['Má phanh trước', 'Dầu phanh DOT4'],
                nextServiceRecommendation: 'Kiểm tra sau 6 tháng hoặc 5000km',
                customerSatisfaction: 5
              },
              {
                id: 'service2',
                vehicleId: 'vehicle1',
                serviceDate: new Date('2024-07-10'),
                serviceType: 'Kiểm tra định kỳ',
                description: 'Kiểm tra hệ thống điện, pin, phanh',
                cost: 300000,
                mileageAtService: 8000,
                technicianName: 'Nguyễn Thành E',
                partsUsed: [],
                customerSatisfaction: 4
              }
            ]
          }
        ]
      },
      {
        id: 'cust2',
        customerCode: 'KH002',
        firstName: 'Trần',
        lastName: 'Thị B',
        email: 'tranthib@email.com',
        phone: '0976543210',
        address: '456 Lê Lợi, Q.3, TP.HCM',
        dateOfBirth: new Date('1990-08-20'),
        gender: 'female',
        registrationDate: new Date('2023-06-10'),
        status: 'active',
        totalSpent: 8200000,
        totalVisits: 5,
        lastVisit: new Date('2024-12-20'),
        preferredContact: 'email',
        vehicles: [
          {
            id: 'vehicle2',
            customerId: 'cust2',
            make: 'VinFast',
            model: 'VF5',
            year: 2023,
            vin: 'VF5DEF987654321',
            licensePlate: '51G-98765',
            color: 'Trắng',
            batteryCapacity: 59.6,
            mileage: 12000,
            purchaseDate: new Date('2023-06-15'),
            warrantyExpiration: new Date('2026-06-15'),
            lastServiceDate: new Date('2024-12-20'),
            nextServiceDue: new Date('2025-06-20'),
            status: 'active',
            serviceHistory: [
              {
                id: 'service3',
                vehicleId: 'vehicle2',
                serviceDate: new Date('2024-12-20'),
                serviceType: 'Kiểm tra pin',
                description: 'Kiểm tra sức khỏe pin, cập nhật phần mềm',
                cost: 200000,
                mileageAtService: 12000,
                technicianName: 'Lê Văn C',
                partsUsed: [],
                customerSatisfaction: 5
              }
            ]
          },
          {
            id: 'vehicle3',
            customerId: 'cust2',
            make: 'Tesla',
            model: 'Model 3',
            year: 2022,
            vin: 'TESLA123456789',
            licensePlate: '29B-11111',
            color: 'Xanh',
            mileage: 25000,
            purchaseDate: new Date('2022-03-10'),
            lastServiceDate: new Date('2024-11-15'),
            nextServiceDue: new Date('2025-05-15'),
            status: 'active',
            serviceHistory: [
              {
                id: 'service4',
                vehicleId: 'vehicle3',
                serviceDate: new Date('2024-11-15'),
                serviceType: 'Sửa chữa',
                description: 'Sửa hệ thống điều hòa không khí',
                cost: 2500000,
                mileageAtService: 25000,
                technicianName: 'Nguyễn Thành E',
                partsUsed: ['Compressor điều hòa', 'Gas R134a'],
                customerSatisfaction: 4
              }
            ]
          }
        ]
      },
      {
        id: 'cust3',
        customerCode: 'KH003',
        firstName: 'Lê',
        lastName: 'Văn C',
        email: 'levanc@email.com',
        phone: '0965432109',
        address: '789 Pasteur, Q.1, TP.HCM',
        registrationDate: new Date('2024-01-20'),
        status: 'active',
        totalSpent: 1200000,
        totalVisits: 2,
        lastVisit: new Date('2024-11-10'),
        preferredContact: 'sms',
        vehicles: []
      }
    ];

    setCustomers(mockCustomers);
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.customerCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const allVehicles = customers.flatMap(customer => 
    customer.vehicles.map(vehicle => ({
      ...vehicle,
      customerName: `${customer.lastName} ${customer.firstName}`,
      customerPhone: customer.phone
    }))
  );

  const filteredVehicles = allVehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'vip': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getVehicleStatusColor = (status: Vehicle['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'sold': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderCustomers = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng khách hàng</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Khách hàng hoạt động</p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'active' || c.status === 'vip').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Khách hàng VIP</p>
              <p className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.status === 'vip').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng xe đăng ký</p>
              <p className="text-2xl font-bold text-orange-600">{allVehicles.length}</p>
            </div>
          </div>
        </MDCard>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <MDCard key={customer.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {customer.lastName} {customer.firstName}
                </h3>
                <p className="text-sm text-gray-500">{customer.customerCode}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                {customer.status === 'active' && 'Hoạt động'}
                {customer.status === 'inactive' && 'Không hoạt động'}
                {customer.status === 'vip' && 'VIP'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="line-clamp-1">{customer.address}</span>
              </div>
            </div>

            {/* Customer Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-lg font-semibold">{customer.vehicles.length}</p>
                <p className="text-xs text-gray-500">Xe đăng ký</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{customer.totalVisits}</p>
                <p className="text-xs text-gray-500">Lần ghé thăm</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">
                  {(customer.totalSpent / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500">Tổng chi tiêu</p>
              </div>
            </div>

            {/* Vehicles List */}
            {customer.vehicles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Xe của khách hàng:</p>
                <div className="space-y-1">
                  {customer.vehicles.slice(0, 2).map((vehicle) => (
                    <div key={vehicle.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-900">
                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          setShowVehicleHistoryModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {customer.vehicles.length > 2 && (
                    <p className="text-sm text-gray-500">+{customer.vehicles.length - 2} xe khác</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <MDButton
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowCustomerDetailsModal(true);
                }}
                size="small"
                variant="outlined"
              >
                <Eye className="h-4 w-4 mr-1" />
                Chi tiết
              </MDButton>
              <MDButton
                onClick={() => {
                  setSelectedCustomer(customer);
                  setShowAddVehicleModal(true);
                }}
                size="small"
                className="bg-green-500 hover:bg-green-600"
              >
                <Car className="h-4 w-4 mr-1" />
                Thêm xe
              </MDButton>
              <MDButton
                onClick={() => {
                  setSelectedCustomer(customer);
                  // setShowEditCustomerModal(true);
                }}
                size="small"
                variant="outlined"
              >
                <Edit className="h-4 w-4 mr-1" />
                Sửa
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <MDCard key={vehicle.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-gray-900">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-sm text-gray-500">{vehicle.licensePlate}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVehicleStatusColor(vehicle.status)}`}>
                {vehicle.status === 'active' && 'Hoạt động'}
                {vehicle.status === 'inactive' && 'Không hoạt động'}
                {vehicle.status === 'sold' && 'Đã bán'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chủ xe:</span>
                <span className="text-gray-900">{vehicle.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Năm sản xuất:</span>
                <span className="text-gray-900">{vehicle.year}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Số km:</span>
                <span className="text-gray-900">{vehicle.mileage.toLocaleString('vi-VN')}</span>
              </div>
              {vehicle.batteryCapacity && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dung lượng pin:</span>
                  <span className="text-gray-900">{vehicle.batteryCapacity} kWh</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Bảo dưỡng cuối:</span>
                <span className="text-gray-900">
                  {vehicle.lastServiceDate?.toLocaleDateString('vi-VN') || 'Chưa có'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <MDButton
                onClick={() => {
                  setSelectedVehicle(vehicle);
                  setShowVehicleHistoryModal(true);
                }}
                size="small"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <History className="h-4 w-4 mr-1" />
                Lịch sử
              </MDButton>
              <MDButton
                onClick={() => {
                  // Navigate to appointment booking
                }}
                size="small"
                className="bg-green-500 hover:bg-green-600"
              >
                Đặt lịch
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  return (
    <div className="customer-vehicle-management p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Quản lý khách hàng & phương tiện</h1>
          <p className="text-gray-600">Quản lý thông tin khách hàng và xe của họ</p>
        </div>
        <MDButton
          onClick={() => setShowAddCustomerModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm khách hàng
        </MDButton>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'customers', label: 'Khách hàng', icon: Users },
          { id: 'vehicles', label: 'Phương tiện', icon: Car }
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

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'customers' ? "Tìm kiếm khách hàng..." : "Tìm kiếm xe..."}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'customers' && (
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="vip">VIP</option>
          </select>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'customers' && renderCustomers()}
      {activeTab === 'vehicles' && renderVehicles()}

      {/* Vehicle History Modal */}
      {showVehicleHistoryModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-5/6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Lịch sử dịch vụ - {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.licensePlate})
              </h3>
              <button
                onClick={() => setShowVehicleHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {selectedVehicle.serviceHistory.length > 0 ? (
                selectedVehicle.serviceHistory.map((service) => (
                  <MDCard key={service.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{service.serviceType}</h4>
                        <p className="text-sm text-gray-600">{service.serviceDate.toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {service.cost.toLocaleString('vi-VN')}đ
                        </p>
                        {service.customerSatisfaction && (
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < service.customerSatisfaction! ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{service.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Kỹ thuật viên: </span>
                        <span className="text-gray-900">{service.technicianName}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Số km: </span>
                        <span className="text-gray-900">{service.mileageAtService.toLocaleString('vi-VN')}</span>
                      </div>
                    </div>

                    {service.partsUsed.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Phụ tùng sử dụng: </span>
                        <span className="text-sm text-gray-900">{service.partsUsed.join(', ')}</span>
                      </div>
                    )}

                    {service.nextServiceRecommendation && (
                      <div className="mt-2 p-2 bg-blue-50 rounded">
                        <span className="text-sm text-blue-700">
                          💡 {service.nextServiceRecommendation}
                        </span>
                      </div>
                    )}
                  </MDCard>
                ))
              ) : (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có lịch sử dịch vụ</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerVehicleManagement;