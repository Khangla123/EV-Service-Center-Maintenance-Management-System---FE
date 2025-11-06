// Script để update appointment thật thành ASSIGNED
// Chạy trong browser console

console.log('=== UPDATE REAL APPOINTMENT TO ASSIGNED ===');

const token = localStorage.getItem('accessToken');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
    console.error('❌ Missing token or user data');
} else {
    const user = JSON.parse(userStr);
    
    // First get all appointments
    fetch('http://localhost:8080/api/appointments', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const appointments = data.result || data;
        console.log('All appointments:', appointments);
        
        if (appointments.length === 0) {
            console.log('❌ No appointments found');
            return;
        }
        
        // Get staff ID
        return fetch('http://localhost:8080/api/staff', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(staffData => {
            const allStaff = staffData.result || staffData;
            const myStaff = allStaff.find(s => s.userId === user.id);
            
            if (!myStaff) {
                throw new Error('Staff not found');
            }
            
            console.log('My staff:', myStaff);
            
            // Find first appointment to update
            const firstAppointment = appointments[0];
            console.log('Updating appointment:', firstAppointment);
            
            // Update appointment to ASSIGNED with technician
            return fetch(`http://localhost:8080/api/appointments/${firstAppointment.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'ASSIGNED',
                    technicianId: myStaff.id,
                    notes: 'Updated to ASSIGNED for testing start functionality'
                })
            });
        });
    })
    .then(response => {
        if (!response) return;
        
        console.log('Update response status:', response.status);
        return response.json();
    })
    .then(result => {
        if (result) {
            console.log('✅ Successfully updated appointment to ASSIGNED:', result);
            console.log('Now refresh the page and try clicking "Bắt đầu" on the real appointment!');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
}

console.log('=== END UPDATE ===');