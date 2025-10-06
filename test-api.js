// Test script to verify API connection
// Run with: node test-api.js

const API_BASE_URL = 'https://ddlsandeep7-libraryconnekto1.hf.space/api/v1';

async function testAPI() {
  console.log('🔍 Testing API connection...');
  console.log(`📍 API URL: ${API_BASE_URL}`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is accessible!');
      console.log('📊 Response:', data);
    } else {
      console.log('❌ API returned error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Failed to connect to API:', error.message);
    console.log('💡 Make sure the backend is running and accessible');
  }
}

// Test the main API endpoint
async function testMainAPI() {
  try {
    const response = await fetch(API_BASE_URL);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Main API endpoint is accessible!');
      console.log('📊 Available endpoints:', data.endpoints);
    } else {
      console.log('❌ Main API returned error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Failed to connect to main API:', error.message);
  }
}

// Run tests
console.log('🚀 Library Connekto API Test');
console.log('============================');
testAPI().then(() => {
  console.log('\n');
  return testMainAPI();
}).then(() => {
  console.log('\n✨ Test completed!');
});
