import React from 'react';
import { useNavigate } from 'react-router-dom';
import AppointmentBooking from '../components/customer/appointments/AppointmentBooking';

const AppointmentBookingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBookingComplete = (appointmentId: string) => {
    navigate('/appointments/success', { 
      state: { appointmentId },
      replace: true 
    });
  };

  return (
    <div className="appointment-booking-page">
      <AppointmentBooking onBookingComplete={handleBookingComplete} />
    </div>
  );
};

export default AppointmentBookingPage;