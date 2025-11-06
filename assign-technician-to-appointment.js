// Script để phân công technician và update status sang ASSIGNED
// Chạy trong browser console sau khi đăng nhập

console.log('=== ASSIGN TECHNICIAN TO APPOINTMENT ===');

const token = localStorage.getItem('accessToken');
const userStr = localStorage.getItem('user');

if (!token || !userStr) {
    console.error('❌ Missing token or user data');
} else {
    const user = JSON.parse(userStr);
    console.log('Current user:', user);
    
    // Get all appointments
    fetch('http://localhost:8080/api/appointments', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const appointments = data.result || data;
        console.log('📋 All appointments:', appointments);
        
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
                throw new Error('Staff not found for user');
            }
            
            console.log('👤 My staff:', myStaff);
            console.log('Staff ID:', myStaff.id);
            
            // Find appointments that can be assigned (CONFIRMED or PENDING)
            const assignableAppointments = appointments.filter(apt => 
                apt.status === 'CONFIRMED' || apt.status === 'PENDING'
            );
            
            console.log('📝 Assignable appointments:', assignableAppointments);
            
            if (assignableAppointments.length === 0) {
                console.log('⚠️ No assignable appointments found');
                console.log('Trying to update first appointment anyway...');
                
                // Take first appointment
                const firstAppointment = appointments[0];
                
                return fetch(`http://localhost:8080/api/appointments/${firstAppointment.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'ASSIGNED',
                        technicianId: myStaff.id,
                        notes: 'Đã phân công cho kỹ thuật viên - Test'
                    })
                });
            }
            
            // Assign first available appointment
            const appointmentToAssign = assignableAppointments[0];
            console.log('🎯 Assigning appointment:', appointmentToAssign);
            
            return fetch(`http://localhost:8080/api/appointments/${appointmentToAssign.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'ASSIGNED',
                    technicianId: myStaff.id,
                    notes: 'Đã phân công cho kỹ thuật viên'
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
            console.log('✅ SUCCESS!');
            console.log('Updated appointment:', result);
            console.log('');
            console.log('🎉 Appointment đã được phân công với status ASSIGNED');
            console.log('📱 Refresh trang technician/tasks để xem công việc!');
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
}

console.log('=== END ASSIGN ===');