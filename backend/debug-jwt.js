const jwt = require('jsonwebtoken');
const axios = require('axios');

async function debugJWT() {
  try {
    // First, authenticate
    console.log('🔐 Authenticating...');
    const authResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'websocket@test.com',
      password: 'test123'
    });
    
    const token = authResponse.data.access_token;
    console.log('✅ Authentication successful');
    console.log('Token:', token.substring(0, 50) + '...');
    
    // Decode the JWT without verification
    const decoded = jwt.decode(token);
    console.log('🔍 JWT Payload:', JSON.stringify(decoded, null, 2));
    
    // Try to verify with the default secret
    try {
      const verified = jwt.verify(token, 'your-super-secret-jwt-key-change-this-in-production');
      console.log('✅ JWT verified with default secret');
    } catch (error) {
      console.log('❌ JWT verification failed with default secret:', error.message);
    }
    
    // Try to verify with a different secret
    try {
      const verified = jwt.verify(token, 'your-super-secret-jwt-key');
      console.log('✅ JWT verified with alternative secret');
    } catch (error) {
      console.log('❌ JWT verification failed with alternative secret:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugJWT(); 