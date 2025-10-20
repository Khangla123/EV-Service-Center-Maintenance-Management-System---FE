import React from 'react';
import './Training.css';

const Training: React.FC = () => {
  return (
    <div className="tech-training">
      <h2>Chứng chỉ & Đào tạo</h2>
      <p>Quản lý chứng chỉ, theo dõi ngày hết hạn và đăng ký khóa học.</p>
      <div className="training-list">
        <div className="training-item">Chứng chỉ an toàn - Hợp lệ tới 2026</div>
        <div className="training-item">Khóa đào tạo pin EV</div>
      </div>
    </div>
  );
};

export default Training;
