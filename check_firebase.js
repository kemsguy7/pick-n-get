import { database } from './config/firebase.js';

async function checkFirebaseData() {
  console.log('🔍 Checking Firebase data for rider 1759734077663...');

  try {
    const snapshot = await database.ref('riders/1759734077663').once('value');

    if (!snapshot.exists()) {
      console.log('❌ No data found in Firebase for this rider');
      return;
    }

    const data = snapshot.val();
    console.log('📊 Firebase data:', data);
    console.log('⏰ Last updated:', new Date(data.timestamp).toLocaleString());
    console.log('📍 Location:', data.lat, data.lng);
  } catch (error) {
    console.error('❌ Error checking Firebase:', error);
  }
}

checkFirebaseData();
