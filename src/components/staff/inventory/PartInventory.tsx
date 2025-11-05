// Placeholder components - to be fully implemented
import React from 'react';

export const PartInventory: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Quản lý Phụ tùng</h2>
      <p>Component đang được phát triển...</p>
      <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
        <li>Theo dõi số lượng phụ tùng EV</li>
        <li>Kiểm soát lượng tồn tối thiểu</li>
        <li>AI gợi ý nhu cầu phụ tùng</li>
        <li>Cảnh báo phụ tùng sắp hết</li>
      </ul>
    </div>
  );
};

export const StaffManagement: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Quản lý Nhân sự</h2>
      <p>Component đang được phát triển...</p>
      <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
        <li>Phân công kỹ thuật viên theo ca/lịch</li>
        <li>Theo dõi hiệu suất làm việc</li>
        <li>Quản lý thời gian làm việc</li>
        <li>Quản lý chứng chỉ chuyên môn EV</li>
      </ul>
    </div>
  );
};

export const FinanceReports: React.FC = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>Tài chính & Báo cáo</h2>
      <p>Component đang được phát triển...</p>
      <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
        <li>Báo giá dịch vụ → hóa đơn → thanh toán</li>
        <li>Quản lý doanh thu, chi phí, lợi nhuận</li>
        <li>Thống kê loại dịch vụ phổ biến</li>
        <li>Xu hướng hỏng hóc EV</li>
      </ul>
    </div>
  );
};
