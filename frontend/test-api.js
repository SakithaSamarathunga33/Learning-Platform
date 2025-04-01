// Simple script to test API connectivity
const fetch = require('node-fetch');
const AbortController = require('abort-controller');

async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function testApiConnection() {
  const apiUrl = 'http://localhost:8080';
  console.log(`Testing API connection to ${apiUrl}...`);
  
  try {
    console.log('Sending request...');
    const response = await fetchWithTimeout(`${apiUrl}/api/achievements`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const status = response.status;
    console.log(`Response status: ${status}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`Successfully fetched data:`, data);
        console.log(`Array length: ${Array.isArray(data) ? data.length : 'Not an array'}`);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError.message);
        const text = await response.text();
        console.log('Raw response:', text);
      }
    } else {
      console.log(`Failed with status ${status}`);
      try {
        const text = await response.text();
        console.log('Error response body:', text);
      } catch (e) {
        console.log('Could not read error response body');
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out after 5000ms');
    } else {
      console.error('Network error connecting to API:', error.message);
      console.error('Error type:', error.name);
    }
  }
  console.log('Test 1 completed');
}

// Also try with direct URL
async function testDirectEndpoint() {
  console.log('\nTesting direct endpoint with fetch...');
  try {
    const response = await fetchWithTimeout('http://localhost:8080/api/achievements', {}, 5000);
    console.log(`Direct fetch status: ${response.status}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response text length:', text.length);
      console.log('First 100 chars:', text.substring(0, 100));
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Direct request timed out after 5000ms');
    } else {
      console.error('Direct fetch error:', error.message);
      console.error('Error type:', error.name);
    }
  }
  console.log('Test 2 completed');
}

// Run both tests
async function runTests() {
  await testApiConnection();
  await testDirectEndpoint();
  console.log('All tests completed');
}

console.log('Starting API tests...');
runTests().then(() => {
  console.log('Tests finished');
}).catch(error => {
  console.error('Unexpected error in test runner:', error);
}); 