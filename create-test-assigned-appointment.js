// Script tạo test appointment với status ASSIGNED
// Chạy trong browser console sau khi đăng nhập

console.log('=== CREATE TEST ASSIGNED APPOINTMENT ===');

const token = localStorage.getItem('accessToken');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
    console.error('❌ Missing token or user data');
} else {
    const user = JSON.parse(userStr);
    console.log('Current user:', user);
    
    // Get technician staff ID
    fetch('http://localhost:8080/api/staff', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const allStaff = data.result || data;
        const myStaff = allStaff.find(s => s.userId === user.id);
        
        if (!myStaff) {
            throw new Error('Staff not found for user');
        }
        
        console.log('Found my staff:', myStaff);
        
        // Create appointment first
        return fetch('http://localhost:8080/api/appointments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: 'any-customer-id', // Will need real customer ID
                vehicleId: 'any-vehicle-id',   // Will need real vehicle ID
                serviceCenterId: 'any-service-center-id', // Will need real service center ID
                servicePackageId: 'any-service-package-id', // Will need real service package ID
                appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                notes: 'Test appointment được tạo để test hiển thị tab Đã phân công'
            })
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create appointment: ' + response.status);
        }
        return response.json();
    })
    .then(appointmentData => {
        console.log('Created appointment:', appointmentData);
        
        const appointment = appointmentData.result || appointmentData;
        
        // Update appointment to ASSIGNED status with technician
        return fetch(`http://localhost:8080/api/appointments/${appointment.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: 'ASSIGNED',
                technicianId: myStaff.id,
                notes: 'Test appointment - đã phân công cho technician'
            })
        });
    })
    .then(response => response.json())
    .then(updatedAppointment => {
        console.log('✅ Successfully created and assigned appointment:', updatedAppointment);
        console.log('Now refresh the technician tasks page to see the ASSIGNED task!');
    })
    .catch(error => {
        console.error('❌ Error creating test appointment:', error);
        
        // Alternative: Try to get existing data to see what's available
        console.log('Trying to get existing data instead...');
        
        Promise.all([
            fetch('http://localhost:8080/api/customers', {headers: {'Authorization': `Bearer ${token}`}}),
            fetch('http://localhost:8080/api/vehicles', {headers: {'Authorization': `Bearer ${token}`}}),
            fetch('http://localhost:8080/api/service-centers', {headers: {'Authorization': `Bearer ${token}`}}),
            fetch('http://localhost:8080/api/service-packages', {headers: {'Authorization': `Bearer ${token}`}})
        ])
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(([customers, vehicles, centers, packages]) => {
            console.log('Available data:');
            console.log('Customers:', customers);
            console.log('Vehicles:', vehicles);
            console.log('Service Centers:', centers);
            console.log('Service Packages:', packages);
        })
        .catch(err => console.error('Error getting existing data:', err));
    });
}

console.log('=== END CREATE TEST ===');