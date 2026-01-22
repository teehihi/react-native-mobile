const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPIConnection() {
  console.log('Testing API connection from React Native app...');
  console.log('API Base URL:', API_BASE_URL);
  console.log('=====================================');
  
  try {
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/health`);
    console.log('Health Status:', healthResponse.status);
    console.log('API Status:', healthResponse.data.data.status);
    
    // Test 2: Auth endpoints info
    console.log('\n2. Testing auth endpoints...');
    const authResponse = await axios.get(`${API_BASE_URL}/auth`);
    console.log('Auth Status:', authResponse.status);
    console.log('Available endpoints:', Object.keys(authResponse.data.endpoints));
    
    // Test 3: Test registration
    console.log('\n3. Testing registration...');
    const testUser = {
      username: 'mobiletest2',
      email: 'mobiletest2@example.com',
      password: 'password123',
      fullName: 'Mobile Test User 2',
      phoneNumber: '0123456789'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      console.log('Registration Status:', registerResponse.status);
      console.log('New user:', registerResponse.data.data.user.username);
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('Registration failed (user may already exist):', error.response.data.message);
      } else {
        throw error;
      }
    }
    
    // Test 4: Test login with admin account
    console.log('\n4. Testing login with admin account...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      emailOrUsername: 'admin@dacsanviet.com',
      password: 'admin123'
    });
    console.log('Login Status:', loginResponse.status);
    console.log('Session ID:', loginResponse.data.data.session.sessionId);
    console.log('User role:', loginResponse.data.data.user.role);
    
    console.log('\n=====================================');
    console.log('API connection test completed successfully!');
    console.log('React Native app can connect to MySQL API.');
    
  } catch (error) {
    console.error('\nAPI connection test failed:');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.error('\nPlease make sure:');
    console.error('1. MySQL API server is running on localhost:3001');
    console.error('2. Database connection is working');
    console.error('3. No firewall blocking the connection');
  }
}

testAPIConnection();