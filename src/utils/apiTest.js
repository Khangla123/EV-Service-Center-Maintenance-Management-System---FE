/**
 * API Connection Test
 * 
 * File này dùng để test các API endpoints từ browser console
 * Mở browser console và copy-paste các đoạn code để test
 */

// Test 1: Service Centers
async function testServiceCenters() {
  console.log('Testing Service Centers API...');
  try {
    const response = await fetch('http://localhost:8080/api/service-centers');
    const data = await response.json();
    console.log('✅ Service Centers:', data);
    return data;
  } catch (error) {
    console.error('❌ Service Centers Error:', error);
  }
}

// Test 2: Service Packages
async function testServicePackages() {
  console.log('Testing Service Packages API...');
  try {
    const response = await fetch('http://localhost:8080/api/service-packages');
    const data = await response.json();
    console.log('✅ Service Packages:', data);
    return data;
  } catch (error) {
    console.error('❌ Service Packages Error:', error);
  }
}

// Test 3: Vehicles (requires auth or permit)
async function testVehicles() {
  console.log('Testing Vehicles API...');
  try {
    const response = await fetch('http://localhost:8080/api/vehicles/me', {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });
    const data = await response.json();
    console.log('✅ Vehicles:', data);
    return data;
  } catch (error) {
    console.error('❌ Vehicles Error:', error);
  }
}

// Test 4: Create Appointment
async function testCreateAppointment(appointmentData) {
  console.log('Testing Create Appointment API...');
  try {
    const response = await fetch('http://localhost:8080/api/appointments', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      },
      body: JSON.stringify(appointmentData)
    });
    const data = await response.json();
    console.log('✅ Appointment Created:', data);
    return data;
  } catch (error) {
    console.error('❌ Create Appointment Error:', error);
  }
}

// Test All
async function testAll() {
  console.log('🚀 Testing all API endpoints...\n');
  
  await testServiceCenters();
  console.log('\n---\n');
  
  await testServicePackages();
  console.log('\n---\n');
  
  await testVehicles();
  console.log('\n---\n');
  
  console.log('✨ All tests completed!');
}

// Sample appointment data
const sampleAppointment = {
  customerId: 'replace-with-real-uuid',
  vehicleId: 'replace-with-real-uuid',
  serviceCenterId: 'replace-with-real-uuid',
  servicePackageId: 'replace-with-real-uuid',
  appointmentDate: new Date().toISOString(),
  notes: 'Test booking from console'
};

// Export for use
console.log(`
🧪 API Test Functions Ready!

Run these in console:
- testServiceCenters()
- testServicePackages()
- testVehicles()
- testCreateAppointment(sampleAppointment)
- testAll()
`);
