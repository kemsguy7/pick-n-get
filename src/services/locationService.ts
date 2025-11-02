import { database } from '../config/db.js';

interface LocationData {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: number;
}

interface LocationUpdateResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Update rider location in Firebase Realtime Database
 */
export async function updateRiderLocation(
  riderId: number,
  location: LocationData,
): Promise<LocationUpdateResult> {
  try {
    console.log(`🔄 Updating location for rider ${riderId}:`, location);

    // Validate location data
    if (location.lat === undefined || location.lng === undefined) {
      throw new Error('Invalid location data: latitude and longitude are required');
    }

    if (location.lat < -90 || location.lat > 90) {
      throw new Error('Invalid latitude: must be between -90 and 90');
    }

    if (location.lng < -180 || location.lng > 180) {
      throw new Error('Invalid longitude: must be between -180 and 180');
    }

    // Create location data with CURRENT timestamp
    const locationData = {
      lat: location.lat,
      lng: location.lng,
      heading: location.heading || 0,
      timestamp: Date.now(), // Always use current timestamp
      lastUpdated: new Date().toISOString(),
    };

    console.log(`📝 Saving to Firebase:`, locationData);

    // Update location in Firebase Realtime Database
    await database.ref(`riders/${riderId}`).set(locationData);

    console.log(
      `✅ Location updated for rider ${riderId}: (${location.lat}, ${location.lng}) at ${locationData.timestamp}`,
    );

    return {
      success: true,
      message: 'Location updated successfully',
    };
  } catch (error) {
    console.error('❌ Error updating rider location:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update location';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get rider's current location from Firebase
 */
export async function getRiderLocation(riderId: number): Promise<LocationData | null> {
  try {
    console.log(`🔍 Fetching location for rider ${riderId}`);

    const snapshot = await database.ref(`riders/${riderId}`).once('value');

    if (!snapshot.exists()) {
      console.log(`❌ No location found for rider ${riderId}`);
      return null;
    }

    const data = snapshot.val();
    console.log(`📍 Location data for rider ${riderId}:`, data);

    return {
      lat: data.lat,
      lng: data.lng,
      heading: data.heading || 0,
      timestamp: data.timestamp || Date.now(),
    };
  } catch (error) {
    console.error('❌ Error fetching rider location:', error);
    return null;
  }
}

/**
 * Delete rider location (when they go offline)
 */
export async function deleteRiderLocation(riderId: number): Promise<LocationUpdateResult> {
  try {
    await database.ref(`riders/${riderId}`).remove();
    console.log(`✅ Location removed for rider ${riderId}`);
    return {
      success: true,
      message: 'Location removed successfully',
    };
  } catch (error) {
    console.error('❌ Error removing rider location:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove location';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
