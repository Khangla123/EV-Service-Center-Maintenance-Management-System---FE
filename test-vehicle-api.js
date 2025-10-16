// TEST API /api/vehicles/me
// Paste vào Console của trình duyệt (F12) khi đã đăng nhập

console.log('=== TESTING /api/vehicles/me ===');
console.log('');

// 1. Kiểm tra token
const token = localStorage.getItem('accessToken');
console.log('1️⃣ Token check:');
console.log('   Token exists:', token ? '✅ YES' : '❌ NO');
if (token) {
    console.log('   Token preview:', token.substring(0, 20) + '...');
    
    // Decode JWT để xem payload
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('   Token payload:', payload);
        console.log('   User ID (sub):', payload.sub || payload.userId);
    } catch (e) {
        console.log('   ⚠️ Cannot decode token');
    }
}
console.log('');

// 2. Kiểm tra user trong localStorage
const userStr = localStorage.getItem('user');
console.log('2️⃣ User check:');
console.log('   User exists:', userStr ? '✅ YES' : '❌ NO');
if (userStr) {
    try {
        const user = JSON.parse(userStr);
        console.log('   User data:', user);
    } catch (e) {
        console.log('   ⚠️ Cannot parse user data');
    }
}
console.log('');

// 3. Test API call
console.log('3️⃣ Calling API /api/vehicles/me...');
fetch('http://localhost:8080/api/vehicles/me', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
    },
    credentials: 'include'
})
.then(response => {
    console.log('   Response status:', response.status);
    console.log('   Response ok:', response.ok);
    return response.json();
})
.then(data => {
    console.log('   ✅ Response data:', data);
    console.log('   Result:', data.result);
    console.log('   Number of vehicles:', data.result?.length || 0);
    
    if (data.result && data.result.length > 0) {
        console.log('   First vehicle:', data.result[0]);
    }
})
.catch(error => {
    console.log('   ❌ Error:', error);
    console.log('   Error details:', error.message);
});

console.log('');
console.log('=== END TEST ===');
