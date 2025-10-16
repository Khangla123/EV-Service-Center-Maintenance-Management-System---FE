// DEBUG SCRIPT - Test /api/vehicles/me với token hiện tại
// Paste toàn bộ script này vào Console (F12) của trình duyệt

console.clear();
console.log('='.repeat(60));
console.log('🔍 DEBUGGING /api/vehicles/me');
console.log('='.repeat(60));
console.log('');

// 1. Check Token
const token = localStorage.getItem('accessToken');
const user = localStorage.getItem('user');

console.log('1️⃣ LOCAL STORAGE CHECK');
console.log('   Token exists:', token ? '✅ YES' : '❌ NO');
console.log('   User exists:', user ? '✅ YES' : '❌ NO');

if (token) {
    console.log('   Token preview:', token.substring(0, 30) + '...');
    
    try {
        const parts = token.split('.');
        if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('   Token payload:');
            console.log('     - sub (userId):', payload.sub);
            console.log('     - exp:', payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A');
            console.log('     - iat:', payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A');
            
            // Check if expired
            if (payload.exp) {
                const isExpired = Date.now() >= payload.exp * 1000;
                console.log('     - expired:', isExpired ? '❌ YES (need re-login)' : '✅ NO');
            }
        }
    } catch (e) {
        console.log('   ⚠️ Cannot decode token:', e.message);
    }
}

if (user) {
    try {
        const userData = JSON.parse(user);
        console.log('   User data:', userData);
    } catch (e) {
        console.log('   ⚠️ Cannot parse user data');
    }
}

console.log('');

if (!token) {
    console.log('❌ NO TOKEN FOUND!');
    console.log('   → Please login at: /login');
    console.log('');
} else {
    console.log('2️⃣ TESTING API');
    console.log('   Calling: GET http://localhost:8080/api/vehicles/me');
    console.log('   With: Authorization: Bearer ' + token.substring(0, 20) + '...');
    console.log('');
    
    fetch('http://localhost:8080/api/vehicles/me', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include'
    })
    .then(response => {
        console.log('3️⃣ RESPONSE RECEIVED');
        console.log('   Status:', response.status, response.statusText);
        console.log('   OK:', response.ok);
        console.log('   Headers:');
        response.headers.forEach((value, key) => {
            console.log('     -', key + ':', value);
        });
        console.log('');
        
        if (!response.ok) {
            console.log('   ❌ ERROR RESPONSE');
            if (response.status === 400) {
                console.log('   → 400 Bad Request: Request format is invalid');
            } else if (response.status === 401) {
                console.log('   → 401 Unauthorized: Token is invalid or expired');
            } else if (response.status === 403) {
                console.log('   → 403 Forbidden: No permission');
            } else if (response.status === 404) {
                console.log('   → 404 Not Found: Endpoint does not exist');
            } else if (response.status === 500) {
                console.log('   → 500 Internal Server Error: Backend error');
            }
        }
        
        return response.text();
    })
    .then(text => {
        console.log('4️⃣ RESPONSE BODY');
        console.log('   Raw text:', text);
        console.log('');
        
        try {
            const data = JSON.parse(text);
            console.log('   ✅ Parsed JSON:');
            console.log(data);
            console.log('');
            
            if (data.message) {
                console.log('   Message:', data.message);
            }
            
            if (data.result) {
                console.log('   Result type:', Array.isArray(data.result) ? 'Array' : typeof data.result);
                console.log('   Result length:', Array.isArray(data.result) ? data.result.length : 'N/A');
                
                if (Array.isArray(data.result) && data.result.length > 0) {
                    console.log('   First vehicle:', data.result[0]);
                } else if (Array.isArray(data.result)) {
                    console.log('   ⚠️ Empty array - no vehicles found');
                    console.log('   → Check database: Does this user have vehicles?');
                }
            }
            
            if (data.error || data.errors) {
                console.log('   ❌ Error details:', data.error || data.errors);
            }
            
        } catch (e) {
            console.log('   ⚠️ Response is not JSON:', e.message);
        }
    })
    .catch(error => {
        console.log('❌ NETWORK ERROR');
        console.log('   Error:', error.message);
        console.log('   Type:', error.name);
        console.log('');
        console.log('   Possible causes:');
        console.log('   - Backend is not running (port 8080)');
        console.log('   - CORS issue');
        console.log('   - Network connectivity problem');
        console.log('');
        console.log('   → Try: Check if backend is running');
        console.log('   → Try: curl http://localhost:8080/api/service-centers');
    });
}

console.log('');
console.log('='.repeat(60));
console.log('💡 TIP: Expand objects (▶) to see full details');
console.log('='.repeat(60));
