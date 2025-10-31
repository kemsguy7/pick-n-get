import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testLocationAPI() {
  console.log('🧪 Testing Location API Endpoints...\n');

  // Test 1: Update location
  console.log('1. Testing location update...');
  try {
    const updateResponse = await fetch(`${BASE_URL}/location/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        riderId: 1759734077663,
        lat: 6.5244,
        lng: 3.3792,
        heading: 45,
      }),
    });

    const updateData = await updateResponse.json();
    console.log('📍 Update Response:', updateData);
    console.log('📍 HTTP Status:', updateResponse.status);
  } catch (error) {
    console.log('❌ Update failed:', error.message);
  }

  // Test 2: Get location
  console.log('\n2. Testing location retrieval...');
  try {
    const getResponse = await fetch(`${BASE_URL}/location/1759734077663`);
    const getData = await getResponse.json();
    console.log('📍 Get Response:', getData);
    console.log('📍 HTTP Status:', getResponse.status);
  } catch (error) {
    console.log('❌ Get failed:', error.message);
  }

  // Test 3: Check Firebase directly
  console.log('\n3. Checking Firebase data...');
  try {
    // This would require your Firebase admin instance
    console.log('📍 You need to check Firebase Console manually');
    console.log('📍 Go to: https://console.firebase.google.com/');
    console.log('📍 Project: pick-n-get-7e039');
    console.log('📍 Realtime Database → check riders/1759734077663');
  } catch (error) {
    console.log('❌ Firebase check failed:', error.message);
  }
}

testLocationAPI();
