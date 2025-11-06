// Debug script để test technician tasks
// Chạy trong browser console sau khi đăng nhập

console.log('=== DEBUG TECHNICIAN TASKS ===');

// 1. Kiểm tra user trong localStorage
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('accessToken');

console.log('1. User từ localStorage:', userStr);
console.log('2. Access token:', token ? 'Có token' : 'Không có token');

if (!userStr) {
    console.error('❌ Không có user trong localStorage!');
} else {
    const user = JSON.parse(userStr);
    console.log('3. Parsed user:', user);
    
    // 2. Test API /staff để tìm staff với userId
    fetch('http://localhost:8080/api/staff', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('4. Staff API response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('5. Staff API data:', data);
        
        const allStaff = data.result || data;
        console.log('6. All staff:', allStaff);
        
        const myStaff = allStaff.find(s => s.userId === user.id);
        console.log('7. My staff:', myStaff);
        
        if (!myStaff) {
            console.error('❌ Không tìm thấy staff cho userId:', user.id);
            console.log('Available staff userIds:', allStaff.map(s => s.userId));
        } else {
            // 3. Test API /appointments/my-tasks
            const staffId = myStaff.id;
            console.log('8. Gọi API my-tasks với staffId:', staffId);
            
            return fetch(`http://localhost:8080/api/appointments/my-tasks?technicianId=${staffId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        }
    })
    .then(response => {
        if (response) {
            console.log('9. My-tasks API response status:', response.status);
            return response.json();
        }
    })
    .then(data => {
        if (data) {
            console.log('10. My-tasks API data:', data);
            const appointments = data.result || data;
            console.log('11. Appointments:', appointments);
            console.log('12. Number of appointments:', appointments.length);
        }
    })
    .catch(error => {
        console.error('❌ Error:', error);
    });
}

console.log('=== END DEBUG ===');