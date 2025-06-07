import axios from 'axios';

// Base URL for the API
const API_URL = 'http://localhost:3000';

// Test the browser pool API
async function testBrowserPoolAPI() {
  try {
    console.log('Testing browser pool API...');

    // Test creating a browser instance
    console.log('\n1. Creating a browser instance...');
    const createResponse = await axios.post(`${API_URL}/browsers`);
    console.log('Response:', createResponse.data);

    if (createResponse.status !== 201) {
      throw new Error(`Expected status 201, got ${createResponse.status}`);
    }

    const browserId = createResponse.data.id;
    const cdpUrl = createResponse.data.cdpUrl;

    if (!browserId || !cdpUrl) {
      throw new Error('Missing browser ID or CDP URL in response');
    }

    console.log(`Successfully created browser with ID: ${browserId}`);
    console.log(`CDP URL: ${cdpUrl}`);

    // Test getting browser pool status
    console.log('\n2. Getting browser pool status...');
    const statusResponse = await axios.get(`${API_URL}/browsers/status`);
    console.log('Response:', statusResponse.data);

    if (statusResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${statusResponse.status}`);
    }

    // Test releasing a browser instance
    console.log('\n3. Releasing the browser instance...');
    const releaseResponse = await axios.delete(`${API_URL}/browsers/${browserId}/release`);
    console.log('Response:', releaseResponse.data);

    if (releaseResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${releaseResponse.status}`);
    }

    if (!releaseResponse.data.success) {
      throw new Error('Failed to release browser instance');
    }

    console.log(`Successfully released browser with ID: ${browserId}`);

    // Create another browser to test destroy endpoint
    console.log('\n4. Creating another browser instance...');
    const createResponse2 = await axios.post(`${API_URL}/browsers`);
    const browserId2 = createResponse2.data.id;

    console.log(`Successfully created browser with ID: ${browserId2}`);

    // Test destroying a browser instance
    console.log('\n5. Destroying the browser instance...');
    const destroyResponse = await axios.delete(`${API_URL}/browsers/${browserId2}`);
    console.log('Response:', destroyResponse.data);

    if (destroyResponse.status !== 200) {
      throw new Error(`Expected status 200, got ${destroyResponse.status}`);
    }

    if (!destroyResponse.data.success) {
      throw new Error('Failed to destroy browser instance');
    }

    console.log(`Successfully destroyed browser with ID: ${browserId2}`);

    console.log('\nAll tests passed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error(error);
    }
  }
}

// Run the tests
console.log('Note: Make sure the server is running before executing this test.');
console.log('You can start the server with: npm start');
console.log('Press Ctrl+C to exit the test at any time.\n');

// Add a delay to allow time to start the server if needed
setTimeout(() => {
  testBrowserPoolAPI();
}, 1000);
