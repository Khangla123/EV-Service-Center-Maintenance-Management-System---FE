import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import './FinanceManagement.css';

const FinanceManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedYear, setSelectedYear] = useState('2025');

  const financialStats = [
    {
      label: 'Doanh thu tháng này',
      value: '₫325,450,000',
      change: '+15.3%',
      isPositive: true,
      icon: <DollarSign size={24} />
    },
    {
      label: 'Chi phí tháng này',
      value: '₫180,200,000',
      change: '+8.5%',
      isPositive: false,
      icon: <TrendingDown size={24} />
    },
    {
      label: 'Lợi nhuận tháng này',
      value: '₫145,250,000',
      change: '+22.1%',
      isPositive: true,
      icon: <TrendingUp size={24} />
    },
    {
      label: 'Tỷ suất lợi nhuận',
      value: '44.6%',
      change: '+3.2%',
      isPositive: true,
      icon: <PieChart size={24} />
    }
  ];

  const revenueByMonth = [
    { month: 'T1', revenue: 280000000 },
    { month: 'T2', revenue: 295000000 },
    { month: 'T3', revenue: 310000000 },
    { month: 'T4', revenue: 290000000 },
    { month: 'T5', revenue: 305000000 },
    { month: 'T6', revenue: 315000000 },
    { month: 'T7', revenue: 298000000 },
    { month: 'T8', revenue: 312000000 },
    { month: 'T9', revenue: 320000000 },
    { month: 'T10', revenue: 325000000 }
  ];

  const topServices = [
    { name: 'Bảo dưỡng định kỳ', revenue: 112500000, percentage: 35, count: 45 },
    { name: 'Thay pin EV', revenue: 98000000, percentage: 30, count: 28 },
    { name: 'Kiểm tra hệ thống điện', revenue: 57000000, percentage: 17, count: 38 },
    { name: 'Sửa chữa khẩn cấp', revenue: 36000000, percentage: 11, count: 12 },
    { name: 'Khác', revenue: 21950000, percentage: 7, count: 23 }
  ];

  const expenses = [
    { category: 'Phụ tùng', amount: 95000000, percentage: 52.7 },
    { category: 'Lương nhân viên', amount: 60000000, percentage: 33.3 },
    { category: 'Vận hành', amount: 25200000, percentage: 14.0 }
  ];

  const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

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
          <button className="btn-export">
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

      {/* Expenses Breakdown */}
      <div className="finance-section expenses-section">
        <div className="section-header">
          <DollarSign size={20} />
          <h2>Chi tiết Chi phí</h2>
        </div>
        <div className="expenses-grid">
          {expenses.map((expense, index) => (
            <div key={index} className="expense-card">
              <div className="expense-header">
                <h4>{expense.category}</h4>
                <span className="expense-percentage">{expense.percentage}%</span>
              </div>
              <div className="expense-amount">{formatCurrency(expense.amount)}</div>
              <div className="expense-bar">
                <div 
                  className="expense-bar-fill"
                  style={{ width: `${expense.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceManagement;
