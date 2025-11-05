// Test script to check invoice API
// Run with: node test-invoice-api.js

const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function testInvoiceAPI() {
  try {
    console.log('Testing Invoice API...\n');
    
    // Get token from login (use a test account)
    console.log('1. Logging in as staff...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'staff@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.result?.token || loginResponse.data.token;
    console.log('✓ Login successful');
    console.log('Token:', token?.substring(0, 20) + '...\n');
    
    // Get all invoices
    console.log('2. Fetching all invoices...');
    const invoicesResponse = await axios.get(`${API_URL}/invoices`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const invoices = invoicesResponse.data.result || invoicesResponse.data;
    console.log('✓ Invoices fetched successfully');
    console.log('Total invoices:', invoices.length);
    
    if (invoices.length > 0) {
      console.log('\nSample invoice:');
      console.log(JSON.stringify(invoices[0], null, 2));
    } else {
      console.log('\n⚠ No invoices found in database');
      console.log('Invoices are created automatically when appointments are completed.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n⚠ Authentication failed. Please check credentials.');
    }
  }
}

testInvoiceAPI();
