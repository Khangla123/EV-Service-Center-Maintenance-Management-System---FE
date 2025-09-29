import React, { useState, useEffect } from 'react';
import { CheckCircle, FileText, Camera, Phone, Mail, Clock, DollarSign, Star, MessageSquare, Send } from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface ServiceCompletion {
  id: string;
  appointmentId: string;
  vehicleId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleBrand: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  technicianId: string;
  technicianName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  status: 'in-progress' | 'completed' | 'delivered' | 'invoiced';
  serviceDetails: ServiceDetail[];
  totalCost: number;
  customerSatisfaction?: number; // 1-5 stars
  customerFeedback?: string;
  invoiceGenerated: boolean;
  completionNotes?: string;
  beforeImages: ServiceImage[];
  afterImages: ServiceImage[];
  createdAt: Date;
  completedAt?: Date;
}

interface ServiceDetail {
  id: string;
  description: string;
  category: 'maintenance' | 'repair' | 'replacement' | 'inspection';
  cost: number;
  timeSpent: number; // in minutes
  partsUsed: string[];
  notes?: string;
}

interface ServiceImage {
  id: string;
  url: string;
  description: string;
  type: 'before' | 'after' | 'process' | 'issue';
  uploadedAt: Date;
}

const ServiceCompletion: React.FC = () => {
  const [completions, setCompletions] = useState<ServiceCompletion[]>([]);
  const [selectedCompletion, setSelectedCompletion] = useState<ServiceCompletion | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [customerFeedback, setCustomerFeedback] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockCompletions: ServiceCompletion[] = [
      {
        id: 'comp1',
        appointmentId: 'apt1',
        vehicleId: 'vehicle1',
        customerId: 'cust1',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0987654321',
        customerEmail: 'nguyenvana@email.com',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF8',
        licensePlate: '30A-12345',
        serviceType: 'Bảo dưỡng định kỳ',
        technicianId: 'tech1',
        technicianName: 'Lê Văn C',
        startTime: new Date('2025-01-20T09:00:00'),
        endTime: new Date('2025-01-20T15:30:00'),
        duration: 390, // 6.5 hours
        status: 'completed',
        serviceDetails: [
          {
            id: 'detail1',
            description: 'Thay dầu phanh',
            category: 'maintenance',
            cost: 150000,
            timeSpent: 60,
            partsUsed: ['Dầu phanh DOT4 - 1L'],
            notes: 'Thay dầu phanh theo định kỳ'
          },
          {
            id: 'detail2',
            description: 'Thay má phanh trước',
            category: 'replacement',
            cost: 800000,
            timeSpent: 120,
            partsUsed: ['Má phanh trước VF8 - 1 bộ'],
            notes: 'Má phanh mòn 85%, cần thay thế'
          },
          {
            id: 'detail3',
            description: 'Kiểm tra hệ thống điện',
            category: 'inspection',
            cost: 0,
            timeSpent: 90,
            partsUsed: [],
            notes: 'Tất cả thông số bình thường'
          }
        ],
        totalCost: 950000,
        customerSatisfaction: 5,
        customerFeedback: 'Dịch vụ tuyệt vời, kỹ thuật viên chuyên nghiệp và nhiệt tình',
        invoiceGenerated: true,
        completionNotes: 'Hoàn thành tốt, khách hàng hài lòng. Khuyến nghị kiểm tra lại sau 6 tháng.',
        beforeImages: [
          {
            id: 'before1',
            url: '/api/images/brake-pad-before.jpg',
            description: 'Má phanh cũ đã mòn',
            type: 'before',
            uploadedAt: new Date('2025-01-20T10:30:00')
          }
        ],
        afterImages: [
          {
            id: 'after1',
            url: '/api/images/brake-pad-after.jpg',
            description: 'Má phanh mới sau khi thay',
            type: 'after',
            uploadedAt: new Date('2025-01-20T14:30:00')
          }
        ],
        createdAt: new Date('2025-01-20T09:00:00'),
        completedAt: new Date('2025-01-20T15:30:00')
      },
      {
        id: 'comp2',
        appointmentId: 'apt2',
        vehicleId: 'vehicle2',
        customerId: 'cust2',
        customerName: 'Trần Thị B',
        customerPhone: '0976543210',
        customerEmail: 'tranthib@email.com',
        vehicleBrand: 'VinFast',
        vehicleModel: 'VF5',
        licensePlate: '51G-98765',
        serviceType: 'Kiểm tra pin',
        technicianId: 'tech1',
        technicianName: 'Lê Văn C',
        startTime: new Date('2025-01-20T10:30:00'),
        endTime: new Date('2025-01-20T11:30:00'),
        duration: 60,
        status: 'in-progress',
        serviceDetails: [
          {
            id: 'detail4',
            description: 'Kiểm tra sức khỏe pin',
            category: 'inspection',
            cost: 0,
            timeSpent: 60,
            partsUsed: [],
            notes: 'Tất cả thông số pin đều bình thường'
          }
        ],
        totalCost: 0,
        invoiceGenerated: false,
        beforeImages: [],
        afterImages: [],
        createdAt: new Date('2025-01-20T10:30:00')
      }
    ];

    setCompletions(mockCompletions);
  }, []);

  const handleCompleteService = (completionId: string, notes: string) => {
    setCompletions(prev =>
      prev.map(completion =>
        completion.id === completionId
          ? {
              ...completion,
              status: 'completed',
              endTime: new Date(),
              duration: Math.floor((new Date().getTime() - completion.startTime.getTime()) / (1000 * 60)),
              completionNotes: notes,
              completedAt: new Date()
            }
          : completion
      )
    );

    setCompletionNotes('');
    setShowCompletionModal(false);
  };

  const handleGenerateInvoice = (completionId: string) => {
    setCompletions(prev =>
      prev.map(completion =>
        completion.id === completionId
          ? { ...completion, invoiceGenerated: true, status: 'invoiced' }
          : completion
      )
    );
    
    setShowInvoiceModal(false);
  };

  const handleCustomerFeedback = (completionId: string, rating: number, feedback: string) => {
    setCompletions(prev =>
      prev.map(completion =>
        completion.id === completionId
          ? {
              ...completion,
              customerSatisfaction: rating,
              customerFeedback: feedback,
              status: 'delivered'
            }
          : completion
      )
    );

    setCustomerFeedback('');
    setSatisfactionRating(0);
  };

  const handleNotifyCustomer = (completion: ServiceCompletion) => {
    // In real app, this would send SMS/email notification
    alert(`Đã gửi thông báo hoàn thành dịch vụ đến ${completion.customerName} qua SMS và Email`);
  };

  const getStatusColor = (status: ServiceCompletion['status']) => {
    switch (status) {
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'delivered': return 'text-purple-600 bg-purple-100';
      case 'invoiced': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: ServiceDetail['category']) => {
    switch (category) {
      case 'maintenance': return '🔧';
      case 'repair': return '🛠️';
      case 'replacement': return '🔄';
      case 'inspection': return '🔍';
      default: return '⚙️';
    }
  };

  const filteredCompletions = completions.filter(completion => 
    filterStatus === 'all' || completion.status === filterStatus
  );

  return (
    <div className="service-completion p-6">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Hoàn tất dịch vụ</h1>
        <p className="text-gray-600">Quản lý việc hoàn tất dịch vụ và thông báo khách hàng</p>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="in-progress">Đang thực hiện</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="invoiced">Đã xuất hóa đơn</option>
          <option value="delivered">Đã giao xe</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Completions List */}
        <div className="space-y-4">
          {filteredCompletions.map((completion) => (
            <MDCard 
              key={completion.id} 
              className={`p-4 cursor-pointer transition-all ${
                selectedCompletion?.id === completion.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedCompletion(completion)}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {completion.vehicleBrand} {completion.vehicleModel} - {completion.licensePlate}
                  </h3>
                  <p className="text-sm text-gray-600">{completion.customerName}</p>
                  <p className="text-sm text-gray-500">{completion.serviceType}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(completion.status)}`}>
                  {completion.status === 'in-progress' && 'Đang thực hiện'}
                  {completion.status === 'completed' && 'Đã hoàn thành'}
                  {completion.status === 'invoiced' && 'Đã xuất hóa đơn'}
                  {completion.status === 'delivered' && 'Đã giao xe'}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Clock className="h-4 w-4 mr-2" />
                Bắt đầu: {completion.startTime.toLocaleString('vi-VN')}
                {completion.duration && (
                  <span className="ml-4">
                    Thời gian: {Math.floor(completion.duration / 60)}h {completion.duration % 60}m
                  </span>
                )}
              </div>

              <div className="flex items-center text-sm text-gray-600 mb-3">
                <DollarSign className="h-4 w-4 mr-2" />
                Tổng chi phí: {completion.totalCost.toLocaleString('vi-VN')}đ
              </div>

              {completion.customerSatisfaction && (
                <div className="flex items-center text-sm text-yellow-600">
                  <Star className="h-4 w-4 mr-2 fill-current" />
                  {completion.customerSatisfaction}/5 sao
                </div>
              )}

              <div className="flex gap-2 mt-3">
                {completion.status === 'in-progress' && (
                  <MDButton
                    onClick={() => {
                      setSelectedCompletion(completion);
                      setShowCompletionModal(true);
                    }}
                    size="small"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Hoàn thành
                  </MDButton>
                )}

                {completion.status === 'completed' && !completion.invoiceGenerated && (
                  <MDButton
                    onClick={() => {
                      setSelectedCompletion(completion);
                      setShowInvoiceModal(true);
                    }}
                    size="small"
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Xuất hóa đơn
                  </MDButton>
                )}

                {(completion.status === 'completed' || completion.status === 'invoiced') && (
                  <MDButton
                    onClick={() => handleNotifyCustomer(completion)}
                    size="small"
                    variant="outlined"
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Thông báo KH
                  </MDButton>
                )}
              </div>
            </MDCard>
          ))}
        </div>

        {/* Completion Details */}
        {selectedCompletion && (
          <div className="space-y-4">
            {/* Customer Info */}
            <MDCard className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 w-20">Họ tên:</span>
                  <span className="text-gray-900">{selectedCompletion.customerName}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{selectedCompletion.customerPhone}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{selectedCompletion.customerEmail}</span>
                </div>
              </div>
            </MDCard>

            {/* Service Details */}
            <MDCard className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Chi tiết dịch vụ</h3>
              <div className="space-y-3">
                {selectedCompletion.serviceDetails.map((detail) => (
                  <div key={detail.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getCategoryIcon(detail.category)}</span>
                        <span className="font-medium text-gray-900">{detail.description}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {detail.cost.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Thời gian: {Math.floor(detail.timeSpent / 60)}h {detail.timeSpent % 60}m
                    </p>
                    {detail.partsUsed.length > 0 && (
                      <div className="text-sm text-gray-600 mb-2">
                        <strong>Linh kiện:</strong> {detail.partsUsed.join(', ')}
                      </div>
                    )}
                    {detail.notes && (
                      <p className="text-sm text-gray-500">{detail.notes}</p>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Tổng cộng:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {selectedCompletion.totalCost.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </MDCard>

            {/* Customer Feedback */}
            {selectedCompletion.customerSatisfaction && (
              <MDCard className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Phản hồi khách hàng</h3>
                <div className="flex items-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= selectedCompletion.customerSatisfaction!
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedCompletion.customerSatisfaction}/5
                  </span>
                </div>
                {selectedCompletion.customerFeedback && (
                  <p className="text-gray-700">{selectedCompletion.customerFeedback}</p>
                )}
              </MDCard>
            )}

            {/* Completion Notes */}
            {selectedCompletion.completionNotes && (
              <MDCard className="p-4">
                <h3 className="font-medium text-gray-900 mb-3">Ghi chú hoàn thành</h3>
                <p className="text-gray-700">{selectedCompletion.completionNotes}</p>
              </MDCard>
            )}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompletionModal && selectedCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoàn thành dịch vụ</h3>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Nhập ghi chú hoàn thành (không bắt buộc)..."
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <MDButton
                onClick={() => handleCompleteService(selectedCompletion.id, completionNotes)}
                className="bg-green-500 hover:bg-green-600"
                size="small"
              >
                Xác nhận hoàn thành
              </MDButton>
              <MDButton
                onClick={() => {
                  setShowCompletionModal(false);
                  setCompletionNotes('');
                }}
                variant="outlined"
                size="small"
              >
                Hủy
              </MDButton>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedCompletion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Xuất hóa đơn</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Khách hàng: {selectedCompletion.customerName}</p>
              <p className="text-sm text-gray-600 mb-2">Xe: {selectedCompletion.vehicleBrand} {selectedCompletion.vehicleModel}</p>
              <p className="text-lg font-semibold text-gray-900">
                Tổng tiền: {selectedCompletion.totalCost.toLocaleString('vi-VN')}đ
              </p>
            </div>
            <div className="flex gap-2">
              <MDButton
                onClick={() => handleGenerateInvoice(selectedCompletion.id)}
                className="bg-orange-500 hover:bg-orange-600"
                size="small"
              >
                Xuất hóa đơn
              </MDButton>
              <MDButton
                onClick={() => setShowInvoiceModal(false)}
                variant="outlined"
                size="small"
              >
                Hủy
              </MDButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCompletion;