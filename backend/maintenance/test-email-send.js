const axios = require('axios');

async function testEmailSend() {
  try {
    console.log('🧪 Testing email service...');
    
    // First, let's clear the cooldown issue
    console.log('📧 Attempting to send verification email...');
    
    const response = await axios.post('http://localhost:3001/send-verification', {
      email: 'softoworktech10@gmail.com',
      firstName: 'Emerson',
      userId: 25
    });
    
    console.log('✅ Response:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Also test if service is running
async function checkHealth() {
  try {
    const response = await axios.get('http://localhost:3001/health');
    console.log('💚 Email service health:', response.data);
    return true;
  } catch (error) {
    console.log('💔 Email service not responding:', error.message);
    return false;
  }
}

async function runTests() {
  const isHealthy = await checkHealth();
  if (isHealthy) {
    await testEmailSend();
  } else {
    console.log('🚨 Please start the email service first with: npm run dev');
  }
}

runTests();
