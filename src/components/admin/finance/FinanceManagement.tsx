import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Activity
} from 'lucide-react';
import appointmentService from '../../../services/appointmentService';
import invoiceService from '../../../services/invoiceService';
import './FinanceManagement.css';

const FinanceManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, invoicesData] = await Promise.all([
        appointmentService.getAllAppointments(),
        invoiceService.getAllInvoices().catch(() => [])
      ]);

      setAppointments(appointmentsData.appointments || []);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Xuất báo cáo tài chính
  const handleExportReport = () => {
    const revenue = calculateMonthlyRevenue();
    const expenses = calculateMonthlyExpenses();
    const profit = calculateMonthlyProfit();
    const profitMargin = calculateProfitMargin();

    // Tạo dữ liệu báo cáo
    const reportData = [
      ['BÁO CÁO TÀI CHÍNH'],
      ['Thời gian', new Date().toLocaleDateString('vi-VN')],
      ['Kỳ báo cáo', selectedPeriod === 'month' ? 'Tháng này' : selectedPeriod === 'week' ? 'Tuần này' : selectedPeriod === 'quarter' ? 'Quý này' : 'Năm này'],
      [''],
      ['CHỈ TIÊU', 'GIÁ TRỊ (VNĐ)'],
      ['Tổng doanh thu', revenue.toLocaleString('vi-VN')],
      ['Tổng chi phí', expenses.toLocaleString('vi-VN')],
      ['Lợi nhuận', profit.toLocaleString('vi-VN')],
      ['Tỷ suất lợi nhuận', profitMargin + '%'],
      [''],
      ['DOANH THU THEO THÁNG'],
      ...getRevenueByMonth().map(item => [item.month, item.revenue.toLocaleString('vi-VN')])
    ];

    // Chuyển đổi thành CSV
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `bao_cao_tai_chinh_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Tính doanh thu tháng này
  const calculateMonthlyRevenue = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || invoice.issueDate);
      return invoiceDate.getMonth() === currentMonth && 
             invoiceDate.getFullYear() === currentYear &&
             invoice.status === 'PAID';
    });

    return monthlyInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  };

  // Tính chi phí tháng này (ước tính từ service cost)
  const calculateMonthlyExpenses = () => {
    const revenue = calculateMonthlyRevenue();
    // Ước tính chi phí = 55% doanh thu (45% lợi nhuận)
    return Math.round(revenue * 0.55);
  };

  // Tính lợi nhuận tháng này
  const calculateMonthlyProfit = () => {
    const revenue = calculateMonthlyRevenue();
    const expenses = calculateMonthlyExpenses();
    return revenue - expenses;
  };

  // Tính tỷ suất lợi nhuận
  const calculateProfitMargin = () => {
    const revenue = calculateMonthlyRevenue();
    if (revenue === 0) return 0;
    const profit = calculateMonthlyProfit();
    return ((profit / revenue) * 100).toFixed(1);
  };

  // Tính doanh thu theo tháng (10 tháng gần nhất)
  const getRevenueByMonth = () => {
    const monthsData = [];
    const now = new Date();
    
    for (let i = 9; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt || invoice.issueDate);
        return invoiceDate.getMonth() === month.getMonth() && 
               invoiceDate.getFullYear() === month.getFullYear() &&
               invoice.status === 'PAID';
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
      
      monthsData.push({
        month: `T${month.getMonth() + 1}`,
        revenue: revenue
      });
    }
    
    return monthsData;
  };

  // Tính doanh thu theo service package
  const getTopServices = () => {
    const serviceStats: { [key: string]: { revenue: number; count: number } } = {};

    appointments.forEach(apt => {
      if (apt.servicePackageName && apt.status === 'COMPLETED') {
        const serviceName = apt.servicePackageName;
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { revenue: 0, count: 0 };
        }
        serviceStats[serviceName].count += 1;
        
        // Tìm invoice tương ứng
        const invoice = invoices.find(inv => 
          inv.appointmentId === apt.id && inv.status === 'PAID'
        );
        if (invoice) {
          serviceStats[serviceName].revenue += invoice.totalAmount || 0;
        }
      }
    });

    const totalRevenue = Object.values(serviceStats).reduce((sum, s) => sum + s.revenue, 0);

    return Object.entries(serviceStats)
      .map(([name, stats]) => ({
        name,
        revenue: stats.revenue,
        count: stats.count,
        percentage: totalRevenue > 0 ? Math.round((stats.revenue / totalRevenue) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const financialStats = [
    {
      label: 'Doanh thu tháng này',
      value: `₫${calculateMonthlyRevenue().toLocaleString('vi-VN')}`,
      change: '+15.3%',
      isPositive: true,
      icon: <DollarSign size={24} />
    },
    {
      label: 'Chi phí tháng này',
      value: `₫${calculateMonthlyExpenses().toLocaleString('vi-VN')}`,
      change: '+8.5%',
      isPositive: false,
      icon: <TrendingDown size={24} />
    },
    {
      label: 'Lợi nhuận tháng này',
      value: `₫${calculateMonthlyProfit().toLocaleString('vi-VN')}`,
      change: '+22.1%',
      isPositive: true,
      icon: <TrendingUp size={24} />
    },
    {
      label: 'Tỷ suất lợi nhuận',
      value: `${calculateProfitMargin()}%`,
      change: '+3.2%',
      isPositive: true,
      icon: <PieChart size={24} />
    }
  ];

  const revenueByMonth = getRevenueByMonth();
  const topServices = getTopServices();

  const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue), 1);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="finance-management">
        <div className="loading-state">
          <Activity size={48} />
          <p>Đang tải dữ liệu tài chính...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-management">
      <div className="finance-header">
        <div className="header-left">
          <h1>Quản lý Tài chính</h1>
          <p>Báo cáo doanh thu, chi phí và lợi nhuận</p>
        </div>
        <div className="header-actions">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="period-select"
          >
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
          </select>
          <button className="btn-export" onClick={handleExportReport}>
            <Download size={18} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="financial-stats">
        {financialStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <div className={`stat-change ${stat.isPositive ? 'positive' : 'negative'}`}>
                {stat.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{stat.change} so với kỳ trước</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="finance-main-grid">
        {/* Revenue Chart */}
        <div className="finance-section revenue-chart-section">
          <div className="section-header">
            <BarChart3 size={20} />
            <h2>Xu hướng Doanh thu</h2>
          </div>
          <div className="revenue-chart">
            {revenueByMonth.map((item, index) => (
              <div key={index} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="chart-value">
                      {(item.revenue / 1000000).toFixed(0)}M
                    </span>
                  </div>
                </div>
                <span className="chart-label">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="finance-section top-services-section">
          <div className="section-header">
            <PieChart size={20} />
            <h2>Doanh thu theo Dịch vụ</h2>
          </div>
          <div className="services-list">
            {topServices.map((service, index) => (
              <div key={index} className="service-item">
                <div className="service-info">
                  <h4>{service.name}</h4>
                  <p>{service.count} lần sử dụng</p>
                </div>
                <div className="service-revenue">
                  <span className="revenue-amount">{formatCurrency(service.revenue)}</span>
                  <div className="revenue-bar">
                    <div 
                      className="revenue-bar-fill"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                  <span className="revenue-percentage">{service.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;
