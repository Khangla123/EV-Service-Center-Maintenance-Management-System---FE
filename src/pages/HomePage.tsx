import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MaintenanceReminderPopup, PaymentReminderPopup } from '../components/customer/notifications';
import { MaintenanceReminder, PaymentReminder, Vehicle, MaintenancePackage, ReminderType, PaymentReminderType } from '../types';
import MDButton from '../components/ui/MDButton';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const user = state.user;
  
  // State for notifications
  const [showMaintenanceReminder, setShowMaintenanceReminder] = useState(false);
  const [showPaymentReminder, setShowPaymentReminder] = useState(false);
  const [maintenanceReminders, setMaintenanceReminders] = useState<MaintenanceReminder[]>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [packages, setPackages] = useState<MaintenancePackage[]>([]);

  const loadMaintenanceReminders = useCallback(() => {
    // Mock maintenance reminders
    const mockReminders: MaintenanceReminder[] = [
      {
        id: '1',
        vehicleId: 'vehicle1',
        customerId: user?.id || '',
        reminderType: ReminderType.REGULAR_MAINTENANCE,
        dueDate: new Date('2024-10-01'),
        dueKilometers: 15000,
        currentKilometers: 14800,
        serviceType: 'regular_maintenance',
        isOverdue: false,
        isActive: true
      },
      {
        id: '2',
        vehicleId: 'vehicle2',
        customerId: user?.id || '',
        reminderType: ReminderType.BATTERY_CHECK,
        dueDate: new Date('2024-09-15'),
        serviceType: 'battery_check',
        isOverdue: true,
        lastReminderSent: new Date('2024-09-10'),
        isActive: true
      }
    ];

    setMaintenanceReminders(mockReminders);
    if (mockReminders.length > 0) {
      setShowMaintenanceReminder(true);
    }
  }, [user?.id]);

  const loadPaymentReminders = useCallback(() => {
    // Mock payment reminders
    const mockReminders: PaymentReminder[] = [
      {
        id: '1',
        customerId: user?.id || '',
        type: PaymentReminderType.MAINTENANCE_PACKAGE,
        amount: 2500000,
        dueDate: new Date('2024-10-05'),
        description: 'Gói bảo dưỡng Premium - Gia hạn 12 tháng',
        servicePackageId: 'package1',
        isOverdue: false
      },
      {
        id: '2',
        customerId: user?.id || '',
        type: PaymentReminderType.OUTSTANDING_BILL,
        amount: 1200000,
        dueDate: new Date('2024-09-20'),
        description: 'Hóa đơn bảo dưỡng lần cuối chưa thanh toán',
        isOverdue: true,
        lastReminderSent: new Date('2024-09-18')
      }
    ];

    setPaymentReminders(mockReminders);
  }, [user?.id]);

  const loadVehicles = useCallback(() => {
    // Mock vehicles
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle1',
        customerId: user?.id || '',
        make: 'VinFast',
        model: 'VF 8',
        year: 2023,
        vin: 'VF8ABC123456789',
        licensePlate: '30A-12345',
        color: 'Đen',
        batteryCapacity: 87.7,
        mileage: 14800,
        purchaseDate: new Date('2023-05-15'),
        warrantyExpiration: new Date('2026-05-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vehicle2',
        customerId: user?.id || '',
        make: 'VinFast',
        model: 'VF 9',
        year: 2023,
        vin: 'VF9XYZ987654321',
        licensePlate: '30B-67890',
        color: 'Trắng',
        batteryCapacity: 123,
        mileage: 8500,
        purchaseDate: new Date('2023-08-10'),
        warrantyExpiration: new Date('2026-08-10'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    setVehicles(mockVehicles);
  }, [user?.id]);

  const loadPackages = useCallback(() => {
    // Mock packages
    const mockPackages: MaintenancePackage[] = [
      {
        id: 'package1',
        name: 'Gói Bảo Dưỡng Premium',
        description: 'Gói bảo dưỡng toàn diện cho xe điện VinFast',
        duration: 12,
        price: 2500000,
        services: [],
        benefits: [
          'Bảo dưỡng định kỳ miễn phí',
          'Kiểm tra pin chuyên sâu',
          'Cập nhật phần mềm',
          'Hỗ trợ 24/7',
          'Ưu tiên đặt lịch'
        ],
        isActive: true,
        popularity: 85
      }
    ];

    setPackages(mockPackages);
  }, []);

  // Mock data - replace with actual API calls
  useEffect(() => {
    if (user && user.role === 'customer') {
      // Simulate loading reminders after login
      const timer = setTimeout(() => {
        loadMaintenanceReminders();
        loadPaymentReminders();
        loadVehicles();
        loadPackages();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, loadMaintenanceReminders, loadPaymentReminders, loadVehicles, loadPackages]);

  const handleBookAppointment = () => {
    if (state.isAuthenticated && user) {
      navigate('/customer/booking');
    } else {
      // Redirect to login if not authenticated
      navigate('/login');
    }
  };

  // Notification handlers
  const handleScheduleService = (reminderId: string) => {
    console.log('Schedule service for reminder:', reminderId);
    if (state.isAuthenticated && user) {
      navigate('/customer/booking');
    } else {
      navigate('/login');
    }
    setShowMaintenanceReminder(false);
  };

  const handleSnoozeMaintenanceReminder = (reminderId: string, days: number) => {
    console.log('Snooze maintenance reminder:', reminderId, 'for', days, 'days');
    setMaintenanceReminders(prev => 
      prev.filter(r => r.id !== reminderId)
    );
    if (maintenanceReminders.length <= 1) {
      setShowMaintenanceReminder(false);
    }
  };

  const handlePayNow = (reminderId: string) => {
    console.log('Pay now for reminder:', reminderId);
    navigate('/payment');
    setShowPaymentReminder(false);
  };

  const handleViewPaymentDetails = (reminderId: string) => {
    console.log('View payment details for reminder:', reminderId);
    navigate('/payment-details');
    setShowPaymentReminder(false);
  };

  const handleSnoozePaymentReminder = (reminderId: string, days: number) => {
    console.log('Snooze payment reminder:', reminderId, 'for', days, 'days');
    setPaymentReminders(prev => 
      prev.filter(r => r.id !== reminderId)
    );
    if (paymentReminders.length <= 1) {
      setShowPaymentReminder(false);
    }
  };

  // Show payment reminders after maintenance reminders are closed
  useEffect(() => {
    if (!showMaintenanceReminder && paymentReminders.length > 0) {
      const timer = setTimeout(() => {
        setShowPaymentReminder(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showMaintenanceReminder, paymentReminders.length]);

  const vehicleCategories = [
    { id: 'vf5', name: 'VF 5' },
    { id: 'vf6', name: 'VF 6' },
    { id: 'vf7', name: 'VF 7' },
    { id: 'vf8', name: 'VF 8' },
    { id: 'vf9', name: 'VF 9' }
  ];

  return (
    <div className="homepage">
      {/* Maintenance Reminder Popup */}
      <MaintenanceReminderPopup
        reminders={maintenanceReminders}
        vehicles={vehicles}
        isOpen={showMaintenanceReminder}
        onClose={() => setShowMaintenanceReminder(false)}
        onScheduleService={handleScheduleService}
        onSnooze={handleSnoozeMaintenanceReminder}
      />

      {/* Payment Reminder Popup */}
      <PaymentReminderPopup
        reminders={paymentReminders}
        packages={packages}
        isOpen={showPaymentReminder}
        onClose={() => setShowPaymentReminder(false)}
        onPayNow={handlePayNow}
        onViewDetails={handleViewPaymentDetails}
        onSnooze={handleSnoozePaymentReminder}
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

