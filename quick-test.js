// TEST API NHANH - Paste vào Console (F12)

console.clear();
console.log('🔍 Testing /api/vehicles/me...\n');

const token = localStorage.getItem('accessToken');
console.log('Token:', token ? 'EXISTS ✅' : 'MISSING ❌');

if (!token) {
    console.log('❌ Please login first!');
} else {
    // Decode token để xem userId
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('User ID:', payload.sub || payload.userId);
    } catch (e) {
        console.log('⚠️ Cannot decode token');
    }
    
    console.log('\n📡 Calling API...');
    
    fetch('http://localhost:8080/api/vehicles/me', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    })
    .then(async response => {
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Response:', text);
        
        if (response.status === 400) {
            console.log('\n❌ 400 BAD REQUEST');
            console.log('Possible causes:');
            console.log('1. Token cannot be decoded by backend');
            console.log('2. Authentication object is null');
            console.log('3. UserId format error');
            console.log('\n👉 CHECK BACKEND LOGS in IntelliJ!');
        }
        
        try {
            return JSON.parse(text);
        } catch {
            return text;
        }
    })
    .then(data => {
        console.log('\nParsed data:', data);
    })
    .catch(err => {
        console.log('\n❌ Network error:', err.message);
    });
}
