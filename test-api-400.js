// TEST API - Paste vào Console để xem chi tiết lỗi 400

console.clear();
console.log('🔍 Testing API with detailed error info...\n');

const token = localStorage.getItem('accessToken');

if (!token) {
    console.log('❌ No token found!');
} else {
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
        console.log('\n📄 Response Body:');
        console.log(text);
        
        try {
            const json = JSON.parse(text);
            console.log('\n📦 Parsed JSON:');
            console.log(json);
            
            if (json.message) {
                console.log('\n💬 Message:', json.message);
            }
            if (json.error) {
                console.log('\n❌ Error:', json.error);
            }
        } catch (e) {
            console.log('\n⚠️ Response is not JSON');
        }
    })
    .catch(err => console.error('Network error:', err));
}
