// Script để kiểm tra appointments đã COMPLETED
// Chạy trong DevTools Console

(async () => {
  console.log('🔍 Checking for COMPLETED appointments...');
  
  try {
    // Lấy token
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ No token found. Please login first.');
      return;
    }
    
    // Call API
    const response = await fetch('http://localhost:8080/api/appointments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('📋 API Response:', data);
    
    // Extract appointments array
    const appointments = data.result || data.appointments || data;
    console.log('Total appointments:', appointments.length);
    
    // Filter COMPLETED
    const completed = appointments.filter(apt => apt.status === 'COMPLETED');
    console.log('✅ COMPLETED appointments:', completed.length);
    
    if (completed.length > 0) {
      console.log('Completed appointments details:');
      completed.forEach((apt, index) => {
        console.log(`\n${index + 1}. Appointment:`, {
          id: apt.id,
          customerName: apt.customerName,
          vehicleLicensePlate: apt.vehicleLicensePlate,
          servicePackageName: apt.servicePackageName,
          technicianName: apt.technicianName,
          status: apt.status,
          appointmentDate: apt.appointmentDate,
          actualCompletion: apt.actualCompletion
        });
      });
    } else {
      console.log('⚠️ No COMPLETED appointments found.');
      console.log('All appointment statuses:', 
        [...new Set(appointments.map(apt => apt.status))].join(', ')
      );
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
