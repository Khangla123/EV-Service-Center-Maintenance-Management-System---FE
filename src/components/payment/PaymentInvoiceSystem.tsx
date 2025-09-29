import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  FileText, 
  DollarSign, 
  Download, 
  Send, 
  Eye, 
  Search, 
  Filter,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Printer
} from 'lucide-react';
import MDButton from '../ui/MDButton';
import MDCard from '../ui/MDCard';

interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  vehiclePlate: string;
  amount: number;
  method: 'cash' | 'card' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paidAt?: Date;
  refundedAt?: Date;
  notes?: string;
  createdAt: Date;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  services: InvoiceService[];
  parts: InvoicePart[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  issuedDate: Date;
  paidDate?: Date;
  createdBy: string;
  notes?: string;
  paymentTerms: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceService {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoicePart {
  id: string;
  partId: string;
  name: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'bank_transfer' | 'e_wallet';
  provider?: string;
  isActive: boolean;
  processingFee: number;
  minAmount?: number;
  maxAmount?: number;
  credentials?: {
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
  };
}

const PaymentInvoiceSystem: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'methods' | 'reports'>('invoices');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Mock data
  useEffect(() => {
    const mockPayments: Payment[] = [
      {
        id: 'pay1',
        invoiceId: 'inv1',
        customerId: 'cust1',
        customerName: 'Nguyễn Văn A',
        vehiclePlate: '30A-12345',
        amount: 950000,
        method: 'bank_transfer',
        status: 'completed',
        transactionId: 'TXN123456789',
        paidAt: new Date('2025-01-20T15:30:00'),
        notes: 'Thanh toán qua Vietcombank',
        createdAt: new Date('2025-01-20T15:30:00')
      },
      {
        id: 'pay2',
        invoiceId: 'inv2',
        customerId: 'cust2',
        customerName: 'Trần Thị B',
        vehiclePlate: '51B-67890',
        amount: 1200000,
        method: 'momo',
        status: 'pending',
        transactionId: 'MOMO987654321',
        notes: 'Thanh toán qua MoMo',
        createdAt: new Date('2025-01-21T10:00:00')
      },
      {
        id: 'pay3',
        invoiceId: 'inv3',
        customerId: 'cust3',
        customerName: 'Lê Văn C',
        vehiclePlate: '29C-11111',
        amount: 750000,
        method: 'cash',
        status: 'completed',
        paidAt: new Date('2025-01-21T14:15:00'),
        notes: 'Thanh toán tiền mặt tại quầy',
        createdAt: new Date('2025-01-21T14:15:00')
      }
    ];

    const mockInvoices: Invoice[] = [
      {
        id: 'inv1',
        invoiceNumber: 'INV-2025-001',
        customerId: 'cust1',
        customerName: 'Nguyễn Văn A',
        customerPhone: '0987654321',
        customerEmail: 'nguyenvana@email.com',
        vehicleId: 'vehicle1',
        vehiclePlate: '30A-12345',
        vehicleMake: 'VinFast',
        vehicleModel: 'VF8',
        services: [
          {
            id: 'svc1',
            name: 'Bảo dưỡng định kỳ 20.000km',
            description: 'Thay dầu, kiểm tra hệ thống',
            quantity: 1,
            unitPrice: 500000,
            total: 500000
          },
          {
            id: 'svc2',
            name: 'Kiểm tra hệ thống phanh',
            description: 'Kiểm tra má phanh và dầu phanh',
            quantity: 1,
            unitPrice: 200000,
            total: 200000
          }
        ],
        parts: [
          {
            id: 'part1',
            partId: 'p001',
            name: 'Má phanh trước',
            partNumber: 'VF8-BP-001',
            quantity: 2,
            unitPrice: 125000,
            total: 250000
          }
        ],
        subtotal: 950000,
        discount: 0,
        tax: 0,
        total: 950000,
        status: 'paid',
        dueDate: new Date('2025-01-25'),
        issuedDate: new Date('2025-01-20'),
        paidDate: new Date('2025-01-20T15:30:00'),
        createdBy: 'tech1',
        paymentTerms: 'Thanh toán trong 5 ngày',
        createdAt: new Date('2025-01-20T14:00:00'),
        updatedAt: new Date('2025-01-20T15:30:00')
      },
      {
        id: 'inv2',
        invoiceNumber: 'INV-2025-002',
        customerId: 'cust2',
        customerName: 'Trần Thị B',
        customerPhone: '0912345678',
        customerEmail: 'tranthib@email.com',
        vehicleId: 'vehicle2',
        vehiclePlate: '51B-67890',
        vehicleMake: 'VinFast',
        vehicleModel: 'VF9',
        services: [
          {
            id: 'svc3',
            name: 'Bảo dưỡng định kỳ 40.000km',
            description: 'Bảo dưỡng toàn diện',
            quantity: 1,
            unitPrice: 800000,
            total: 800000
          }
        ],
        parts: [
          {
            id: 'part2',
            partId: 'p002',
            name: 'Lọc gió điều hòa',
            partNumber: 'VF9-AC-002',
            quantity: 1,
            unitPrice: 400000,
            total: 400000
          }
        ],
        subtotal: 1200000,
        discount: 0,
        tax: 0,
        total: 1200000,
        status: 'sent',
        dueDate: new Date('2025-01-26'),
        issuedDate: new Date('2025-01-21'),
        createdBy: 'tech2',
        paymentTerms: 'Thanh toán trong 5 ngày',
        createdAt: new Date('2025-01-21T09:00:00'),
        updatedAt: new Date('2025-01-21T09:00:00')
      },
      {
        id: 'inv3',
        invoiceNumber: 'INV-2025-003',
        customerId: 'cust3',
        customerName: 'Lê Văn C',
        customerPhone: '0923456789',
        customerEmail: 'levanc@email.com',
        vehicleId: 'vehicle3',
        vehiclePlate: '29C-11111',
        vehicleMake: 'VinFast',
        vehicleModel: 'VF8',
        services: [
          {
            id: 'svc4',
            name: 'Sửa chữa hệ thống điện',
            description: 'Thay thế cảm biến và kiểm tra',
            quantity: 1,
            unitPrice: 600000,
            total: 600000
          }
        ],
        parts: [
          {
            id: 'part3',
            partId: 'p003',
            name: 'Cảm biến áp suất lốp',
            partNumber: 'VF8-TPMS-001',
            quantity: 4,
            unitPrice: 37500,
            total: 150000
          }
        ],
        subtotal: 750000,
        discount: 0,
        tax: 0,
        total: 750000,
        status: 'paid',
        dueDate: new Date('2025-01-26'),
        issuedDate: new Date('2025-01-21'),
        paidDate: new Date('2025-01-21T14:15:00'),
        createdBy: 'tech3',
        paymentTerms: 'Thanh toán ngay',
        createdAt: new Date('2025-01-21T13:00:00'),
        updatedAt: new Date('2025-01-21T14:15:00')
      }
    ];

    const mockPaymentMethods: PaymentMethod[] = [
      {
        id: 'cash',
        name: 'Tiền mặt',
        type: 'cash',
        isActive: true,
        processingFee: 0
      },
      {
        id: 'card',
        name: 'Thẻ tín dụng/ghi nợ',
        type: 'card',
        provider: 'Visa/MasterCard',
        isActive: true,
        processingFee: 2.5,
        minAmount: 50000
      },
      {
        id: 'bank_transfer',
        name: 'Chuyển khoản ngân hàng',
        type: 'bank_transfer',
        provider: 'Vietcombank/Techcombank',
        isActive: true,
        processingFee: 0
      },
      {
        id: 'momo',
        name: 'Ví MoMo',
        type: 'e_wallet',
        provider: 'MoMo',
        isActive: true,
        processingFee: 1.5,
        credentials: {
          merchantId: 'MOMO_MERCHANT',
          apiKey: 'momo_api_key'
        }
      },
      {
        id: 'zalopay',
        name: 'ZaloPay',
        type: 'e_wallet',
        provider: 'ZaloPay',
        isActive: true,
        processingFee: 2.0,
        credentials: {
          merchantId: 'ZALO_MERCHANT',
          apiKey: 'zalo_api_key'
        }
      },
      {
        id: 'vnpay',
        name: 'VNPay',
        type: 'e_wallet',
        provider: 'VNPay',
        isActive: true,
        processingFee: 1.8,
        credentials: {
          merchantId: 'VNP_MERCHANT',
          apiKey: 'vnp_api_key'
        }
      }
    ];

    setPayments(mockPayments);
    setInvoices(mockInvoices);
    setPaymentMethods(mockPaymentMethods);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePayment = (invoiceId: string, method: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;

    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      invoiceId: invoiceId,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      vehiclePlate: invoice.vehiclePlate,
      amount: invoice.total,
      method: method as Payment['method'],
      status: method === 'cash' ? 'completed' : 'processing',
      transactionId: `TXN${Date.now()}`,
      paidAt: method === 'cash' ? new Date() : undefined,
      createdAt: new Date()
    };

    setPayments(prev => [...prev, newPayment]);
    
    if (method === 'cash') {
      setInvoices(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? { ...inv, status: 'paid', paidDate: new Date() }
            : inv
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash': return '💵';
      case 'card': return '💳';
      case 'bank_transfer': return '🏦';
      case 'momo': return '📱';
      case 'zalopay': return '⚡';
      case 'vnpay': return '🔴';
      default: return '💰';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderInvoices = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Chờ thanh toán</p>
              <p className="text-2xl font-bold text-yellow-600">
                {invoices.filter(inv => inv.status === 'sent').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">
                {invoices.filter(inv => inv.status === 'paid').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0))}
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      {/* Filters and Search */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm theo số hóa đơn, tên khách hàng, biển số xe..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Nháp</option>
          <option value="sent">Đã gửi</option>
          <option value="paid">Đã thanh toán</option>
          <option value="overdue">Quá hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>

        <MDButton
          onClick={() => setShowCreateInvoiceModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo hóa đơn
        </MDButton>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <MDCard key={invoice.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-gray-900">{invoice.invoiceNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status === 'draft' && 'Nháp'}
                    {invoice.status === 'sent' && 'Đã gửi'}
                    {invoice.status === 'paid' && 'Đã thanh toán'}
                    {invoice.status === 'overdue' && 'Quá hạn'}
                    {invoice.status === 'cancelled' && 'Đã hủy'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng</p>
                    <p className="font-medium text-gray-900">{invoice.customerName}</p>
                    <p className="text-sm text-gray-500">{invoice.customerPhone}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Xe</p>
                    <p className="font-medium text-gray-900">{invoice.vehicleMake} {invoice.vehicleModel}</p>
                    <p className="text-sm text-gray-500">Biển số: {invoice.vehiclePlate}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Tổng tiền</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(invoice.total)}</p>
                    <p className="text-sm text-gray-500">
                      Hạn: {invoice.dueDate.toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-1">Dịch vụ & phụ tùng:</p>
                  <div className="flex flex-wrap gap-2">
                    {invoice.services.map((service) => (
                      <span key={service.id} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {service.name}
                      </span>
                    ))}
                    {invoice.parts.map((part) => (
                      <span key={part.id} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        {part.name} x{part.quantity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <MDButton
                  onClick={() => setSelectedInvoice(invoice)}
                  size="small"
                  variant="outlined"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Xem
                </MDButton>
                
                <MDButton
                  size="small"
                  variant="outlined"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Tải PDF
                </MDButton>
                
                <MDButton
                  size="small"
                  variant="outlined"
                >
                  <Printer className="h-3 w-3 mr-1" />
                  In
                </MDButton>
                
                {invoice.status === 'sent' && (
                  <MDButton
                    onClick={() => setShowPaymentModal(true)}
                    size="small"
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CreditCard className="h-3 w-3 mr-1" />
                    Thanh toán
                  </MDButton>
                )}
                
                {invoice.status === 'draft' && (
                  <MDButton
                    size="small"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Gửi
                  </MDButton>
                )}
              </div>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MDCard className="p-4">
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Đang xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">
                {payments.filter(pay => pay.status === 'processing').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Thành công</p>
              <p className="text-2xl font-bold text-green-600">
                {payments.filter(pay => pay.status === 'completed').length}
              </p>
            </div>
          </div>
        </MDCard>

        <MDCard className="p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Tổng thu</p>
              <p className="text-xl font-bold text-purple-600">
                {formatCurrency(payments.filter(pay => pay.status === 'completed').reduce((sum, pay) => sum + pay.amount, 0))}
              </p>
            </div>
          </div>
        </MDCard>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {payments.map((payment) => (
          <MDCard key={payment.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">
                  {getPaymentMethodIcon(payment.method)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      Thanh toán #{payment.transactionId}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status === 'pending' && 'Chờ xử lý'}
                      {payment.status === 'processing' && 'Đang xử lý'}
                      {payment.status === 'completed' && 'Thành công'}
                      {payment.status === 'failed' && 'Thất bại'}
                      {payment.status === 'refunded' && 'Đã hoàn tiền'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Khách hàng</p>
                      <p className="font-medium">{payment.customerName}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Xe</p>
                      <p className="font-medium">{payment.vehiclePlate}</p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Phương thức</p>
                      <p className="font-medium capitalize">
                        {payment.method === 'cash' && 'Tiền mặt'}
                        {payment.method === 'card' && 'Thẻ tín dụng'}
                        {payment.method === 'bank_transfer' && 'Chuyển khoản'}
                        {payment.method === 'momo' && 'MoMo'}
                        {payment.method === 'zalopay' && 'ZaloPay'}
                        {payment.method === 'vnpay' && 'VNPay'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Thời gian</p>
                      <p className="font-medium">
                        {payment.paidAt ? payment.paidAt.toLocaleString('vi-VN') : 
                         payment.createdAt.toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  {payment.notes && (
                    <p className="text-sm text-gray-600 mt-2">{payment.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(payment.amount)}
                </p>
                
                {payment.status === 'failed' && (
                  <MDButton size="small" className="bg-blue-500 hover:bg-blue-600 mt-2">
                    Thử lại
                  </MDButton>
                )}
              </div>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Phương thức thanh toán</h3>
        <MDButton className="bg-blue-500 hover:bg-blue-600">
          <Plus className="h-4 w-4 mr-2" />
          Thêm phương thức
        </MDButton>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paymentMethods.map((method) => (
          <MDCard key={method.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-3">
                  {getPaymentMethodIcon(method.type)}
                </span>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  {method.provider && (
                    <p className="text-sm text-gray-600">{method.provider}</p>
                  )}
                </div>
              </div>
              
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                method.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
              }`}>
                {method.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Phí xử lý:</span>
                <span className="font-medium">{method.processingFee}%</span>
              </div>
              
              {method.minAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền tối thiểu:</span>
                  <span className="font-medium">{formatCurrency(method.minAmount)}</span>
                </div>
              )}
              
              {method.maxAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Số tiền tối đa:</span>
                  <span className="font-medium">{formatCurrency(method.maxAmount)}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <MDButton size="small" variant="outlined">
                Cấu hình
              </MDButton>
              <MDButton
                size="small"
                variant="outlined"
                className={method.isActive ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}
              >
                {method.isActive ? 'Tạm dừng' : 'Kích hoạt'}
              </MDButton>
            </div>
          </MDCard>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Báo cáo thanh toán</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MDCard className="p-4">
          <h4 className="font-medium text-gray-900 mb-4">Doanh thu theo phương thức</h4>
          
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const methodPayments = payments.filter(p => 
                p.method === method.id && p.status === 'completed'
              );
              const total = methodPayments.reduce((sum, p) => sum + p.amount, 0);
              const percentage = payments.length > 0 ? 
                (methodPayments.length / payments.filter(p => p.status === 'completed').length * 100) : 0;
              
              return (
                <div key={method.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getPaymentMethodIcon(method.type)}
                    </span>
                    <span className="text-sm text-gray-900">{method.name}</span>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(total)}</p>
                    <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </MDCard>

        <MDCard className="p-4">
          <h4 className="font-medium text-gray-900 mb-4">Thống kê theo trạng thái</h4>
          
          <div className="space-y-3">
            {['completed', 'processing', 'pending', 'failed'].map((status) => {
              const statusPayments = payments.filter(p => p.status === status);
              const total = statusPayments.reduce((sum, p) => sum + p.amount, 0);
              const count = statusPayments.length;
              
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status === 'completed' && 'Thành công'}
                    {status === 'processing' && 'Đang xử lý'}
                    {status === 'pending' && 'Chờ xử lý'}
                    {status === 'failed' && 'Thất bại'}
                  </span>
                  
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{count} giao dịch</p>
                    <p className="text-sm text-gray-600">{formatCurrency(total)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </MDCard>
      </div>
    </div>
  );

  return (
    <div className="payment-invoice-system p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hệ thống thanh toán & hóa đơn</h1>
          <p className="text-gray-600">Quản lý hóa đơn và xử lý thanh toán</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'invoices', label: 'Hóa đơn', icon: FileText },
          { id: 'payments', label: 'Thanh toán', icon: CreditCard },
          { id: 'methods', label: 'Phương thức', icon: DollarSign },
          { id: 'reports', label: 'Báo cáo', icon: AlertCircle }
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
      {activeTab === 'invoices' && renderInvoices()}
      {activeTab === 'payments' && renderPayments()}
      {activeTab === 'methods' && renderPaymentMethods()}
      {activeTab === 'reports' && renderReports()}
    </div>
  );
};

export default PaymentInvoiceSystem;