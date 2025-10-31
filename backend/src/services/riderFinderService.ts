import { Rider, RiderStatus, ApprovalStatus } from '../interface/deliveryInterface.ts';
import { VehicleType } from '../interface/deliveryInterface.ts';
import { database } from '../config/db.ts';
import fetch from 'node-fetch';

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY;

interface RiderLocation {
  riderId: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  capacity: number;
  rating?: number;
  totalPickups?: number;
  profileImage?: string;
  lat: number;
  lng: number;
  distance?: number; // in meters
  duration?: number; // in seconds
  eta?: string; // formatted ETA
}

interface GeocodingResult {
  features: Array<{
    center: [number, number]; // [lng, lat]
    place_name: string;
  }>;
}

interface MatrixResult {
  durations: number[][];
  distances: number[][];
}

/**
 * Geocode an address to coordinates using Mapbox Geocoding API
 */
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_API_KEY}&limit=1`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = (await response.json()) as GeocodingResult;

    if (!data.features || data.features.length === 0) {
      console.error('No geocoding results found for address:', address);
      return null;
    }

    const [lng, lat] = data.features[0].center;
    return { lat, lng };
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Get rider locations from Firebase Realtime Database
 */
async function getRiderLocations(
  riderIds: number[],
): Promise<Map<number, { lat: number; lng: number }>> {
  const locations = new Map<number, { lat: number; lng: number }>();

  for (const riderId of riderIds) {
    try {
      const snapshot = await database.ref(`riders/${riderId}`).get();
      if (snapshot.exists()) {
        const location = snapshot.val();
        if (location.lat && location.lng) {
          locations.set(riderId, {
            lat: parseFloat(location.lat),
            lng: parseFloat(location.lng),
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching location for rider ${riderId}:`, error);
    }
  }

  return locations;
}

/**
 * Calculate distances and durations using Mapbox Matrix API
 */
async function calculateDistancesAndDurations(
  pickupCoords: { lat: number; lng: number },
  riderCoords: Array<{ riderId: number; lat: number; lng: number }>,
): Promise<Array<{ riderId: number; distance: number; duration: number }>> {
  try {
    // Build coordinates string: pickup;rider1;rider2;...
    const coordinates = [
      `${pickupCoords.lng},${pickupCoords.lat}`,
      ...riderCoords.map((r) => `${r.lng},${r.lat}`),
    ].join(';');

    const url = `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}?sources=0&annotations=distance,duration&access_token=${MAPBOX_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Matrix API error:', response.statusText);
      return [];
    }

    const data = (await response.json()) as MatrixResult;

    // Extract distances and durations for each rider
    const results = riderCoords.map((rider, index) => ({
      riderId: rider.riderId,
      distance: data.distances[0][index + 1], // +1 because source is at index 0
      duration: data.durations[0][index + 1],
    }));

    return results;
  } catch (error) {
    console.error('Error calculating distances:', error);
    return [];
  }
}

/**
 * Format duration in seconds to readable ETA string
 */
// function formatETA(durationInSeconds: number): string {
//   if (durationInSeconds < 60) {
//     return '< 1 min';
//   } else if (durationInSeconds < 3600) {
//     const minutes = Math.round(durationInSeconds / 60);
//     return `${minutes} min${minutes > 1 ? 's' : ''}`;
//   } else {
//     const hours = Math.floor(durationInSeconds / 3600);
//     const minutes = Math.round((durationInSeconds % 3600) / 60);
//     return `${hours}h ${minutes}m`;
//   }
// }
function formatETA(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} secs`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)} mins`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.round((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
/**
 * Find nearest available riders for a pickup request
 * Returns up to 5 riders sorted by distance
 */
export async function findNearestRiders(
  pickupAddress: string,
  vehicleType: VehicleType,
  country: string,
  itemWeight: number,
): Promise<RiderLocation[]> {
  try {
    // Step 1: Geocode pickup address
    console.log(`Geocoding address: ${pickupAddress}`);
    const pickupCoords = await geocodeAddress(pickupAddress);

    if (!pickupCoords) {
      console.error('Failed to geocode pickup address');
      return [];
    }

    // Step 2: Find eligible riders from database
    console.log(`Finding riders with vehicle type: ${vehicleType}, country: ${country}`);
    const eligibleRiders = await Rider.find({
      vehicleType: { $regex: new RegExp(vehicleType, 'i') },
      riderStatus: RiderStatus.Available,
      approvalStatus: ApprovalStatus.Approve,
      country: { $regex: new RegExp(country, 'i') },
      capacity: { $gte: itemWeight },
    }).limit(20); // Get more than needed for filtering

    if (eligibleRiders.length === 0) {
      console.log('No eligible riders found');
      return [];
    }

    console.log(`Found ${eligibleRiders.length} eligible riders`);

    // Step 3: Get rider locations from Firebase
    const riderIds = eligibleRiders.map((r) => r.id);
    const riderLocations = await getRiderLocations(riderIds);

    if (riderLocations.size === 0) {
      console.log('No rider locations found in Firebase');
      return [];
    }

    // Step 4: Prepare data for distance calculation
    const ridersWithCoords = eligibleRiders
      .filter((rider) => riderLocations.has(rider.id))
      .map((rider) => {
        const location = riderLocations.get(rider.id)!;
        return {
          riderId: rider.id,
          lat: location.lat,
          lng: location.lng,
        };
      });

    if (ridersWithCoords.length === 0) {
      return [];
    }

    // Step 5: Calculate distances and durations
    console.log(`Calculating distances for ${ridersWithCoords.length} riders`);
    const distanceResults = await calculateDistancesAndDurations(pickupCoords, ridersWithCoords);

    // Step 6: Combine all data and format
    const riderLocationsWithDistance: RiderLocation[] = [];

    for (const rider of eligibleRiders) {
      const location = riderLocations.get(rider.id);
      const distanceData = distanceResults.find((d) => d.riderId === rider.id);

      if (location && distanceData) {
        riderLocationsWithDistance.push({
          riderId: rider.id,
          name: rider.name,
          phoneNumber: rider.phoneNumber,
          vehicleNumber: rider.vehicleNumber,
          vehicleType: rider.vehicleType,
          capacity: rider.capacity,
          profileImage: rider.profileImage,
          lat: location.lat,
          lng: location.lng,
          distance: distanceData.distance,
          duration: distanceData.duration,
          eta: formatETA(distanceData.duration),
        });
      }
    }

    // Step 7: Sort by distance and return top 5
    riderLocationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return riderLocationsWithDistance.slice(0, 5);
  } catch (error) {
    console.error('Error in findNearestRiders:', error);
    return [];
  }
}
