import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Download, 
  Filter,
  Users,
  Car,
  DollarSign,
  Wrench,
  AlertTriangle,
  Target,
  Clock,
  Star
} from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface RevenueData {
  period: string;
  revenue: number;
  services: number;
  parts: number;
  appointments: number;
}

interface ServiceAnalytics {
  serviceType: string;
  count: number;
  revenue: number;
  avgDuration: number;
  customerSatisfaction: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerRetentionRate: number;
  avgLifetimeValue: number;
}

interface VehicleStats {
  make: string;
  model: string;
  count: number;
  avgServiceCost: number;
  commonIssues: string[];
}

interface InventoryReport {
  partId: string;
  partName: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  turnoverRate: number;
  reorderStatus: 'ok' | 'low' | 'critical';
  lastOrdered: Date;
}

interface StaffPerformance {
  staffId: string;
  name: string;
  role: string;
  appointmentsCompleted: number;
  avgRating: number;
  efficiency: number;
  revenue: number;
}

interface ReportFilter {
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: Date;
  endDate?: Date;
  category?: 'all' | 'revenue' | 'service' | 'inventory' | 'staff';
  vehicleType?: string;
  serviceType?: string;
}

const ReportsAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'services' | 'inventory' | 'staff'>('overview');
  const [filter, setFilter] = useState<ReportFilter>({ dateRange: 'month', category: 'all' });
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceAnalytics, setServiceAnalytics] = useState<ServiceAnalytics[]>([]);
  const [customerMetrics, setCustomerMetrics] = useState<CustomerMetrics | null>(null);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats[]>([]);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport[]>([]);
  const [staffPerformance, setStaffPerformance] = useState<StaffPerformance[]>([]);

  // Mock data
  useEffect(() => {
    const mockRevenueData: RevenueData[] = [
      { period: 'T1/2025', revenue: 25000000, services: 15000000, parts: 10000000, appointments: 45 },
      { period: 'T2/2025', revenue: 28000000, services: 18000000, parts: 10000000, appointments: 52 },
      { period: 'T3/2025', revenue: 32000000, services: 20000000, parts: 12000000, appointments: 58 },
      { period: 'T4/2025', revenue: 30000000, services: 19000000, parts: 11000000, appointments: 55 },
    ];

    const mockServiceAnalytics: ServiceAnalytics[] = [
      {
        serviceType: 'Bảo dưỡng định kỳ',
        count: 125,
        revenue: 62500000,
        avgDuration: 120,
        customerSatisfaction: 4.5
      },
      {
        serviceType: 'Sửa chữa hệ thống điện',
        count: 45,
        revenue: 22500000,
        avgDuration: 180,
        customerSatisfaction: 4.2
      },
      {
        serviceType: 'Thay thế phụ tùng',
        count: 78,
        revenue: 31200000,
        avgDuration: 90,
        customerSatisfaction: 4.6
      },
      {
        serviceType: 'Kiểm tra toàn diện',
        count: 32,
        revenue: 9600000,
        avgDuration: 60,
        customerSatisfaction: 4.8
      }
    ];

    const mockCustomerMetrics: CustomerMetrics = {
      totalCustomers: 1250,
      newCustomers: 85,
      returningCustomers: 165,
      customerRetentionRate: 78.5,
      avgLifetimeValue: 4500000
    };

    const mockVehicleStats: VehicleStats[] = [
      {
        make: 'VinFast',
        model: 'VF8',
        count: 85,
        avgServiceCost: 950000,
        commonIssues: ['Hệ thống phanh', 'Cảm biến áp suất lốp', 'Hệ thống điện']
      },
      {
        make: 'VinFast',
        model: 'VF9',
        count: 42,
        avgServiceCost: 1200000,
        commonIssues: ['Hệ thống làm mát', 'Hệ thống điều hòa', 'Pin lithium']
      },
      {
        make: 'VinFast',
        model: 'VF e34',
        count: 28,
        avgServiceCost: 650000,
        commonIssues: ['Hệ thống sạc', 'Động cơ điện', 'Hệ thống BMS']
      }
    ];

    const mockInventoryReport: InventoryReport[] = [
      {
        partId: 'VF8-BP-001',
        partName: 'Má phanh trước VF8',
        currentStock: 15,
        minStock: 20,
        maxStock: 100,
        turnoverRate: 8.5,
        reorderStatus: 'low',
        lastOrdered: new Date('2025-01-15')
      },
      {
        partId: 'VF9-AC-002',
        partName: 'Lọc gió điều hòa VF9',
        currentStock: 5,
        minStock: 10,
        maxStock: 50,
        turnoverRate: 6.2,
        reorderStatus: 'critical',
        lastOrdered: new Date('2025-01-10')
      },
      {
        partId: 'VF8-TPMS-001',
        partName: 'Cảm biến áp suất lốp VF8',
        currentStock: 45,
        minStock: 20,
        maxStock: 80,
        turnoverRate: 12.3,
        reorderStatus: 'ok',
        lastOrdered: new Date('2025-01-18')
      }
    ];

    const mockStaffPerformance: StaffPerformance[] = [
      {
        staffId: 'tech1',
        name: 'Nguyễn Văn Tuấn',
        role: 'Kỹ thuật viên',
        appointmentsCompleted: 65,
        avgRating: 4.7,
        efficiency: 92,
        revenue: 32500000
      },
      {
        staffId: 'tech2',
        name: 'Trần Thị Lan',
        role: 'Kỹ thuật viên trưởng',
        appointmentsCompleted: 58,
        avgRating: 4.9,
        efficiency: 95,
        revenue: 29000000
      },
      {
        staffId: 'advisor1',
        name: 'Lê Văn Nam',
        role: 'Tư vấn dịch vụ',
        appointmentsCompleted: 120,
        avgRating: 4.6,
        efficiency: 88,
        revenue: 48000000
      }
    ];

    setRevenueData(mockRevenueData);
    setServiceAnalytics(mockServiceAnalytics);
    setCustomerMetrics(mockCustomerMetrics);
    setVehicleStats(mockVehicleStats);
    setInventoryReport(mockInventoryReport);
    setStaffPerformance(mockStaffPerformance);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getReorderStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'text-green-600 bg-green-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderOverview = () => {
    const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
    const totalAppointments = revenueData.reduce((sum, data) => sum + data.appointments, 0);
    const avgAppointmentValue = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

    return (
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MDCard className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-green-500">+12.5% so với kỳ trước</p>
              </div>
            </div>
          </MDCard>

          <MDCard className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tổng lịch hẹn</p>
                <p className="text-2xl font-bold text-blue-600">{totalAppointments}</p>
                <p className="text-xs text-blue-500">+8.2% so với kỳ trước</p>
              </div>
            </div>
          </MDCard>

          <MDCard className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Khách hàng</p>
                <p className="text-2xl font-bold text-purple-600">
                  {customerMetrics?.totalCustomers || 0}
                </p>
                <p className="text-xs text-purple-500">
                  {customerMetrics?.newCustomers || 0} khách hàng mới
                </p>
              </div>
            </div>
          </MDCard>

          <MDCard className="p-4">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Giá trị TB/Lịch hẹn</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(avgAppointmentValue)}
                </p>
                <p className="text-xs text-orange-500">+5.1% so với kỳ trước</p>
              </div>
            </div>
          </MDCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MDCard className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng doanh thu</h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {revenueData.map((data, index) => {
                const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
                const height = (data.revenue / maxRevenue) * 200;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 rounded-t w-12 transition-all duration-500"
                      style={{ height: `${height}px` }}
                    ></div>
                    <p className="text-xs text-gray-600 mt-2">{data.period}</p>
                    <p className="text-xs font-medium text-gray-900">
                      {formatCurrency(data.revenue)}
                    </p>
                  </div>
                );
              })}
            </div>
          </MDCard>

          <MDCard className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích dịch vụ</h3>
            <div className="space-y-3">
              {serviceAnalytics.slice(0, 4).map((service, index) => {
                const maxCount = Math.max(...serviceAnalytics.map(s => s.count));
                const width = (service.count / maxCount) * 100;
                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{service.serviceType}</span>
                      <span className="font-medium text-gray-900">{service.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${width}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </MDCard>
        </div>

        {/* Recent Alerts */}
        <MDCard className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            Cảnh báo cần chú ý
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Tồn kho thấp</p>
                <p className="text-xs text-red-600">
                  {inventoryReport.filter(item => item.reorderStatus === 'critical').length} phụ tùng cần nhập gấp
                </p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Lịch hẹn đang chờ</p>
                <p className="text-xs text-yellow-600">15 lịch hẹn chưa được xử lý</p>
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Hiệu suất tăng</p>
                <p className="text-xs text-blue-600">Doanh thu tháng này tăng 12.5%</p>
              </div>
            </div>
          </div>
        </MDCard>
      </div>
    );
  };

  const renderRevenueAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Doanh thu dịch vụ</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(revenueData.reduce((sum, data) => sum + data.services, 0))}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Doanh thu phụ tùng</p>
              <p className="text-xl font-bold text-blue-600">
                {formatCurrency(revenueData.reduce((sum, data) => sum + data.parts, 0))}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tăng trưởng</p>
              <p className="text-xl font-bold text-purple-600">+12.5%</p>
            </div>
          </div>
        </MDCard>
      </div>

      <MDCard className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết doanh thu theo thời gian</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Thời gian</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Doanh thu dịch vụ</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Doanh thu phụ tùng</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Tổng doanh thu</th>
                <th className="text-right py-2 text-sm font-medium text-gray-600">Số lịch hẹn</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((data, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{data.period}</td>
                  <td className="py-3 text-sm text-right text-green-600">
                    {formatCurrency(data.services)}
                  </td>
                  <td className="py-3 text-sm text-right text-blue-600">
                    {formatCurrency(data.parts)}
                  </td>
                  <td className="py-3 text-sm text-right font-medium text-gray-900">
                    {formatCurrency(data.revenue)}
                  </td>
                  <td className="py-3 text-sm text-right text-gray-600">{data.appointments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MDCard>
    </div>
  );

  const renderServiceAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {serviceAnalytics.map((service, index) => (
          <MDCard key={index} className="p-4">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 mb-2">{service.serviceType}</h4>
              <p className="text-2xl font-bold text-blue-600 mb-1">{service.count}</p>
              <p className="text-sm text-gray-600 mb-2">lần thực hiện</p>
              
              <div className="flex items-center justify-center mb-2">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{service.customerSatisfaction}/5.0</span>
              </div>
              
              <div className="space-y-1 text-xs text-gray-600">
                <p>Doanh thu: {formatCurrency(service.revenue)}</p>
                <p>Thời gian TB: {service.avgDuration} phút</p>
              </div>
            </div>
          </MDCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MDCard className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê xe theo hãng</h3>
          <div className="space-y-4">
            {vehicleStats.map((vehicle, index) => (
              <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-900">
                    {vehicle.make} {vehicle.model}
                  </h4>
                  <span className="text-sm text-gray-600">{vehicle.count} xe</span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  Chi phí dịch vụ TB: {formatCurrency(vehicle.avgServiceCost)}
                </p>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">Vấn đề thường gặp:</p>
                  <div className="flex flex-wrap gap-1">
                    {vehicle.commonIssues.map((issue, issueIndex) => (
                      <span
                        key={issueIndex}
                        className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MDCard>

        <MDCard className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Đánh giá khách hàng</h3>
          <div className="space-y-4">
            {customerMetrics && (
              <>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {customerMetrics.customerRetentionRate}%
                  </p>
                  <p className="text-sm text-blue-700">Tỷ lệ giữ chân khách hàng</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-bold text-green-600">{customerMetrics.newCustomers}</p>
                    <p className="text-xs text-gray-600">Khách hàng mới</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-600">{customerMetrics.returningCustomers}</p>
                    <p className="text-xs text-gray-600">Khách hàng quay lại</p>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(customerMetrics.avgLifetimeValue)}
                  </p>
                  <p className="text-sm text-gray-600">Giá trị trung bình/Khách hàng</p>
                </div>
              </>
            )}
          </div>
        </MDCard>
      </div>
    </div>
  );

  const renderInventoryReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Cần nhập gấp</p>
              <p className="text-2xl font-bold text-red-600">
                {inventoryReport.filter(item => item.reorderStatus === 'critical').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tồn kho thấp</p>
              <p className="text-2xl font-bold text-yellow-600">
                {inventoryReport.filter(item => item.reorderStatus === 'low').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Vòng quay TB</p>
              <p className="text-2xl font-bold text-blue-600">
                {(inventoryReport.reduce((sum, item) => sum + item.turnoverRate, 0) / inventoryReport.length).toFixed(1)}
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      <MDCard className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết tồn kho</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Mã phụ tùng</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Tên phụ tùng</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Tồn kho</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Min/Max</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Vòng quay</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Trạng thái</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Lần nhập cuối</th>
              </tr>
            </thead>
            <tbody>
              {inventoryReport.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-sm text-gray-900">{item.partId}</td>
                  <td className="py-3 text-sm text-gray-900">{item.partName}</td>
                  <td className="py-3 text-sm text-center">
                    <span className={`font-medium ${
                      item.currentStock <= item.minStock ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.currentStock}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-center text-gray-600">
                    {item.minStock}/{item.maxStock}
                  </td>
                  <td className="py-3 text-sm text-center text-blue-600">
                    {item.turnoverRate}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReorderStatusColor(item.reorderStatus)}`}>
                      {item.reorderStatus === 'ok' && 'Đủ'}
                      {item.reorderStatus === 'low' && 'Thấp'}
                      {item.reorderStatus === 'critical' && 'Cần gấp'}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-center text-gray-600">
                    {item.lastOrdered.toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </MDCard>
    </div>
  );

  const renderStaffReports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng nhân viên</p>
              <p className="text-2xl font-bold text-blue-600">{staffPerformance.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-bold text-yellow-600">
                {(staffPerformance.reduce((sum, staff) => sum + staff.avgRating, 0) / staffPerformance.length).toFixed(1)}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Hiệu suất TB</p>
              <p className="text-2xl font-bold text-green-600">
                {(staffPerformance.reduce((sum, staff) => sum + staff.efficiency, 0) / staffPerformance.length).toFixed(0)}%
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      <MDCard className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiệu suất nhân viên</h3>
        <div className="space-y-4">
          {staffPerformance.map((staff, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{staff.name}</h4>
                  <p className="text-sm text-gray-600">{staff.role}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(staff.revenue)}
                  </p>
                  <p className="text-sm text-gray-600">Doanh thu</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-900">{staff.appointmentsCompleted}</p>
                  <p className="text-xs text-gray-600">Lịch hẹn hoàn thành</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-center mb-1">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-lg font-bold text-yellow-600">{staff.avgRating}</span>
                  </div>
                  <p className="text-xs text-gray-600">Đánh giá trung bình</p>
                </div>
                
                <div>
                  <p className="text-lg font-bold text-green-600">{staff.efficiency}%</p>
                  <p className="text-xs text-gray-600">Hiệu suất làm việc</p>
                </div>
              </div>
              
              {/* Performance bars */}
              <div className="mt-3 space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Hiệu suất</span>
                    <span>{staff.efficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${staff.efficiency}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Đánh giá</span>
                    <span>{staff.avgRating}/5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(staff.avgRating / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </MDCard>
    </div>
  );

  return (
    <div className="reports-analytics p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Báo cáo & Phân tích</h1>
          <p className="text-gray-600">Theo dõi hiệu suất kinh doanh và phân tích dữ liệu</p>
        </div>
        
        <div className="flex gap-3">
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={filter.dateRange}
            onChange={(e) => setFilter({...filter, dateRange: e.target.value as ReportFilter['dateRange']})}
          >
            <option value="week">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
            <option value="custom">Tùy chọn</option>
          </select>
          
          <MDButton className="bg-blue-500 hover:bg-blue-600">
            <Download className="h-4 w-4 mr-2" />
            Xuất báo cáo
          </MDButton>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Tổng quan', icon: BarChart },
          { id: 'revenue', label: 'Doanh thu', icon: DollarSign },
          { id: 'services', label: 'Dịch vụ', icon: Wrench },
          { id: 'inventory', label: 'Tồn kho', icon: Car },
          { id: 'staff', label: 'Nhân viên', icon: Users }
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
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'revenue' && renderRevenueAnalysis()}
      {activeTab === 'services' && renderServiceAnalysis()}
      {activeTab === 'inventory' && renderInventoryReports()}
      {activeTab === 'staff' && renderStaffReports()}
    </div>
  );
};

export default ReportsAnalytics;