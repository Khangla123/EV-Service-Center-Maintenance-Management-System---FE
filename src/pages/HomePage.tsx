/**
 * HomePage.tsx - Landing Page Component
 * 
 * Trang chủ của ứng dụng, hiển thị thông tin về dịch vụ bảo dưỡng.
 * Cung cấp call-to-action để đặt lịch bảo dưỡng.
 * 
 * Features:
 * - Hiển thị thông tin về bảo dưỡng định kỳ
 * - CTA button để đặt lịch
 * - Tự động redirect tới login nếu chưa đăng nhập
 * - Hiển thị hình ảnh minh họa
 * 
 * @module pages/HomePage
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MDButton from '../components/ui/MDButton';
import './HomePage.css';

/**
 * HomePage Component
 * 
 * Component trang chủ với thông tin về dịch vụ bảo dưỡng EV.
 * 
 * @returns {JSX.Element} HomePage component
 */
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const user = state.user;

  /**
   * Handler: Xử lý khi user click nút "Đặt lịch dịch vụ"
   * 
   * Logic:
   * - Nếu đã đăng nhập -> chuyển tới trang booking
   * - Nếu chưa đăng nhập -> chuyển tới login với returnUrl
   */
  const handleBookAppointment = () => {
    if (state.isAuthenticated && user) {
      // User đã đăng nhập -> navigate trực tiếp tới booking
      navigate('/customer/booking');
    } else {
      // User chưa đăng nhập -> redirect to login với return URL
      // Sau khi login thành công sẽ quay lại trang booking
      navigate('/login', { state: { returnUrl: '/customer/booking' } });
    }
  };

  return (
    <div className="homepage">
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div>
              <h1 className="hero-title">Bảo dưỡng định kỳ</h1>
              <p className="hero-description">
                Bảo dưỡng định kỳ giúp duy trì trạng thái ổn định, kéo dài tuổi thọ của chi tiết; 
                phát hiện sớm những hư hỏng trong quá trình sử dụng và giúp xe luôn hoạt động ổn định, 
                an toàn, từ đó tiết kiệm chi phí và thời gian.
              </p>
              <p className="hero-subdescription">
                Bảo dưỡng định kỳ được thực hiện theo một chu kỳ nhất định quy định bằng quảng cáo 
                và thời gian sử dụng. Đây là điều kiện cần để được hưởng Chính sách Bảo hành.
              </p>
              <MDButton 
                variant="filled"
                size="large"
                onClick={handleBookAppointment}
                className="cta-button"
              >
                ĐẶT LỊCH DỊCH VỤ
              </MDButton>
            </div>
            <div className="hero-image">
              <img 
                src="/assets/images/bao_duong_VinFast.jpg" 
                alt="Bảo dưỡng định kỳ VinFast" 
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;