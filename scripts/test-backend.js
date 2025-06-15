const axios = require('axios');

const BACKEND_URL = 'https://meducate-4b014c640ca1.herokuapp.com';

async function testBackendConnection() {
  console.log('🔄 Testing backend connection...');
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  try {
    // Test root endpoint
    const response = await axios.get(`${BACKEND_URL}/`);
    console.log('✅ Backend connection successful!');
    console.log('Response:', response.data);
    
    // Test CORS
    try {
      const corsResponse = await axios.get(`${BACKEND_URL}/test-cors`);
      console.log('✅ CORS configuration working!');
    } catch (corsError) {
      console.log('⚠️  CORS endpoint not available, but main connection works');
    }
    
  } catch (error) {
    console.error('❌ Backend connection failed!');
    console.error('Error:', error.message);
    console.error('Please check:');
    console.error('1. Backend URL is correct');
    console.error('2. Backend is running and accessible');
    console.error('3. CORS is configured properly');
  }
}

testBackendConnection(); 