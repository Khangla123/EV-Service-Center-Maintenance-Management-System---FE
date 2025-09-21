import React from 'react';
import { useNavigate } from 'react-router-dom';
import MDButton from '../components/ui/MDButton';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBookAppointment = () => {
    navigate('/appointments');
  };

  const vehicleCategories = [
    { id: 'vf5', name: 'VF 5' },
    { id: 'vf6', name: 'VF 6' },
    { id: 'vf7', name: 'VF 7' },
    { id: 'vf8', name: 'VF 8' },
    { id: 'vf9', name: 'VF 9' }
  ];

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
                Bảo dưỡng định kỳ được thực hiện theo một chu kỳ nhất định  quy định bằng quãng đường 
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

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Danh mục bảo dưỡng</h2>
          <div className="categories-grid">
            {vehicleCategories.map((category) => (
              <div key={category.id} className="category-item">
                <span className="category-name">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

