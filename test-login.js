const axios = require('axios');

const testLogin = async () => {
  const accounts = [
    { email: 'admin@evservice.vn', password: '123456', role: 'ADMIN' },
    { email: 'customer@evservice.vn', password: '123456', role: 'CUSTOMER' },
    { email: 'staff@evservice.vn', password: '123456', role: 'STAFF' },
    { email: 'technician@evservice.vn', password: '123456', role: 'TECHNICIAN' }
  ];

  console.log('🔍 Testing login API...\n');

  for (const account of accounts) {
    try {
      console.log(`Testing ${account.role} - ${account.email}`);
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: account.email,
        password: account.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.result) {
        console.log(`✅ SUCCESS - ${account.role}`);
        console.log(`   Token: ${response.data.result.accessToken.substring(0, 50)}...`);
        console.log(`   UserId: ${response.data.result.userId}`);
        console.log(`   Role: ${response.data.result.role}\n`);
      } else {
        console.log(`❌ FAILED - ${account.role}: Invalid response format\n`);
      }
    } catch (error) {
      console.log(`❌ FAILED - ${account.role}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Message: ${error.response.data.message || 'No message'}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
      console.log('');
    }
  }

  // Test wrong password
  console.log('Testing wrong password...');
  try {
    await axios.post('http://localhost:8080/api/auth/login', {
      email: 'admin@evservice.vn',
      password: 'wrongpassword'
    });
    console.log('❌ Should have failed with wrong password\n');
  } catch (error) {
    console.log(`✅ Correctly rejected wrong password`);
    console.log(`   Status: ${error.response.status}`);
    console.log(`   Message: ${error.response.data.message}\n`);
  }
};

testLogin();
