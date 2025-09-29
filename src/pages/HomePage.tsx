import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationContext } from '../context/NotificationContext';
import UnifiedNotificationPopup from '../components/customer/notifications/UnifiedNotificationPopup';
import NotificationHistory from '../components/customer/notifications/NotificationHistory';
import MDButton from '../components/ui/MDButton';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Use notification context
  const {
    maintenanceReminders,
    paymentReminders,
    vehicles,
    packages,
    showUnifiedPopup,
    showHistory,
    handleClosePopup,
    handleCloseHistory,
    handleScheduleService,
    handlePayNow,
    handleViewPaymentDetails,
    handleSnooze
  } = useNotificationContext();

  // Mock vehicle categories for display
  const vehicleCategories = [
    { id: 1, name: 'VinFast VF8' },
    { id: 2, name: 'VinFast VF9' },
    { id: 3, name: 'VinFast VF e34' },
    { id: 4, name: 'VinFast Klara A1' },
  ];

  const handleBookAppointment = () => {
    navigate('/booking');
  };

  return (
    <div className="homepage">
      {/* Unified Notification Popup */}
      <UnifiedNotificationPopup
        maintenanceReminders={maintenanceReminders}
        paymentReminders={paymentReminders}
        vehicles={vehicles}
        packages={packages}
        isOpen={showUnifiedPopup}
        onClose={handleClosePopup}
        onScheduleService={handleScheduleService}
        onPayNow={handlePayNow}
        onViewDetails={handleViewPaymentDetails}
        onSnooze={handleSnooze}
      />

      {/* Notification History Modal */}
      <NotificationHistory
        isOpen={showHistory}
        onClose={handleCloseHistory}
      />

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