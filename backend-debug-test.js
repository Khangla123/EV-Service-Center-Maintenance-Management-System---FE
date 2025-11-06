// Test script để debug backend data
// Copy và chạy trong browser console

console.log('=== BACKEND DEBUG TEST ===');

const token = localStorage.getItem('accessToken');
if (!token) {
    console.error('❌ No access token found');
} else {
    console.log('✅ Access token found');
    
    // Test debug endpoints
    const baseUrl = 'http://localhost:8080/api';
    
    // 1. Debug appointments
    fetch(`${baseUrl}/debug/appointments`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Debug appointments response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('=== APPOINTMENTS DEBUG ===');
        console.log(data);
    })
    .catch(error => {
        console.error('❌ Appointments debug error:', error);
    });

    // 2. Debug staff
    fetch(`${baseUrl}/debug/staff`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Debug staff response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('=== STAFF DEBUG ===');
        console.log(data);
    })
    .catch(error => {
        console.error('❌ Staff debug error:', error);
    });

    // 3. Debug technician user
    fetch(`${baseUrl}/debug/technician-user`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Debug technician user response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('=== TECHNICIAN USER DEBUG ===');
        console.log(data);
    })
    .catch(error => {
        console.error('❌ Technician user debug error:', error);
    });

    // 4. Test existing my-tasks endpoint
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        console.log('Current user:', user);
        
        // Get staff by user ID
        fetch(`${baseUrl}/staff`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            const allStaff = data.result || data;
            const myStaff = allStaff.find(s => s.userId === user.id);
            
            if (myStaff) {
                console.log('Found my staff:', myStaff);
                
                // Test my-tasks endpoint
                return fetch(`${baseUrl}/appointments/my-tasks?technicianId=${myStaff.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                console.error('❌ Staff not found for user:', user.id);
                throw new Error('Staff not found');
            }
        })
        .then(response => {
            console.log('My-tasks response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('=== MY TASKS RESULT ===');
            console.log(data);
            const tasks = data.result || data;
            console.log('Number of tasks:', tasks.length);
        })
        .catch(error => {
            console.error('❌ My-tasks error:', error);
        });
    }
}

console.log('=== END DEBUG TEST ===');