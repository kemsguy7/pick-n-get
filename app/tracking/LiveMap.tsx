'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface LiveMapProps {
  riderId: number;
  pickupAddress: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface RiderLocation {
  lat: number;
  lng: number;
  heading?: number;
  timestamp: number;
}

export default function LiveMap({ riderId, pickupAddress, pickupCoordinates }: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [eta, setEta] = useState<string>('--');
  const [distance, setDistance] = useState<string>('--');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [error, setError] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch location function
  const fetchLocation = useCallback(async () => {
    try {
      const timestamp = Date.now();
      const response = await fetch(`${baseUrl}/location/${riderId}?t=${timestamp}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'success' && data.data) {
        setRiderLocation(data.data);
        setLastUpdate(new Date());
        setError('');
      } else {
        setError('No location data');
      }
    } catch (error) {
      console.error('❌ Error fetching location:', error);
      setError('Unable to fetch location');
    }
  }, [riderId]);

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxgl.accessToken) return;

    try {
      const center: [number, number] = pickupCoordinates
        ? [pickupCoordinates.lng, pickupCoordinates.lat]
        : [3.3792, 6.5244];

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: 14,
        pitch: 45, // Add 3D tilt
        bearing: 0,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: false,
        }),
        'top-right',
      );

      map.current.on('load', () => {
        // Add pickup marker with custom design
        if (pickupCoordinates && map.current) {
          // Create custom pickup marker element
          const pickupEl = document.createElement('div');
          pickupEl.className = 'pickup-marker';
          pickupEl.innerHTML = `
            <div class="w-10 h-10 bg-green-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-pulse">
              <span class="text-white text-xl">📦</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-green-500"></div>
          `;

          pickupMarker.current = new mapboxgl.Marker({
            element: pickupEl,
            anchor: 'bottom',
          })
            .setLngLat([pickupCoordinates.lng, pickupCoordinates.lat])
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                closeButton: false,
                className: 'pickup-popup',
              }).setHTML(`
                <div class="p-2">
                  <strong class="text-green-600">📦 Pickup Location</strong>
                  <p class="text-sm text-gray-600 mt-1">${pickupAddress}</p>
                </div>
              `),
            )
            .addTo(map.current);

          // Show popup initially
          pickupMarker.current.togglePopup();
        }

        setIsMapInitialized(true);
      });
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [pickupAddress, pickupCoordinates]);

  // Poll rider location every 3 seconds
  useEffect(() => {
    if (!isMapInitialized || !riderId) return;

    fetchLocation();
    const interval = setInterval(fetchLocation, 3000);

    return () => clearInterval(interval);
  }, [riderId, isMapInitialized, fetchLocation]);

  // Update rider marker, route, and auto-pan
  useEffect(() => {
    if (!map.current || !riderLocation || !isMapInitialized) return;

    const riderPos: [number, number] = [riderLocation.lng, riderLocation.lat];

    // Update or create rider marker with smooth animation
    if (riderMarker.current) {
      // Animate marker movement
      riderMarker.current.setLngLat(riderPos);

      // Update rotation based on heading
      if (riderLocation.heading !== undefined) {
        const markerElement = riderMarker.current.getElement();
        markerElement.style.transform = `rotate(${riderLocation.heading}deg)`;
      }
    } else {
      // Create custom rider marker
      const riderEl = document.createElement('div');
      riderEl.className = 'rider-marker';
      riderEl.innerHTML = `
        <div class="relative">
          <div class="w-14 h-14 bg-blue-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center relative">
            <div class="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            <span class="text-2xl z-10">🚗</span>
          </div>
          <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        </div>
      `;

      riderMarker.current = new mapboxgl.Marker({
        element: riderEl,
        anchor: 'center',
        rotationAlignment: 'map',
      })
        .setLngLat(riderPos)
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
          }).setHTML(`
            <div class="p-2">
              <strong class="text-blue-600">🚗 Rider En Route</strong>
              <p class="text-xs text-gray-500 mt-1">Live tracking</p>
            </div>
          `),
        )
        .addTo(map.current);
    }

    // Calculate route and ETA
    if (pickupCoordinates) {
      const pickupPos: [number, number] = [pickupCoordinates.lng, pickupCoordinates.lat];
      fetchRouteAndUpdateMap(riderPos, pickupPos);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderLocation, pickupCoordinates, isMapInitialized]);

  const fetchRouteAndUpdateMap = async (start: [number, number], end: [number, number]) => {
    if (!map.current) return;

    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&steps=true&access_token=${mapboxgl.accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const durationSeconds = route.duration;
        const distanceMeters = route.distance;

        // Format ETA
        const minutes = Math.floor(durationSeconds / 60);
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        if (hours > 0) {
          setEta(`${hours}h ${remainingMinutes}m`);
        } else if (minutes > 0) {
          setEta(`${minutes} min`);
        } else {
          setEta('< 1 min');
        }

        // Format distance
        const distanceKm = distanceMeters / 1000;
        if (distanceKm < 1) {
          setDistance(`${Math.round(distanceMeters)} m`);
        } else {
          setDistance(`${distanceKm.toFixed(1)} km`);
        }

        // Draw route
        drawRoute(route.geometry);

        // Auto-fit bounds with smooth animation
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(start);
        bounds.extend(end);

        map.current.fitBounds(bounds, {
          padding: { top: 100, bottom: 100, left: 100, right: 100 },
          maxZoom: 15,
          duration: 2000, // Smooth 2-second animation
          essential: true,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching route:', error);
      // Fallback: straight-line calculation
      const distance = calculateDistance(start[1], start[0], end[1], end[0]);
      const estimatedTime = Math.round(distance * 3); // 3 min per km
      setEta(`~${estimatedTime} min`);
      setDistance(`${distance.toFixed(1)} km`);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const drawRoute = (geometry: GeoJSON.Geometry) => {
    if (!map.current) return;

    const routeLayerId = 'route-layer';
    const routeSourceId = 'route-source';

    // Remove existing route
    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeSourceId)) {
      map.current.removeSource(routeSourceId);
    }

    // Add new route with gradient effect
    map.current.addSource(routeSourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: geometry,
      },
    });

    map.current.addLayer({
      id: routeLayerId,
      type: 'line',
      source: routeSourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 6,
        'line-opacity': 0.9,
        'line-blur': 1,
      },
    });
  };

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainer} className="h-full w-full rounded-lg" />

      {/* ETA and Distance Card - Uber Style */}
      {riderLocation && pickupCoordinates && (
        <div className="absolute top-4 right-4 left-4 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-2xl backdrop-blur-sm md:right-auto md:w-auto">
          <div className="flex items-center gap-4">
            {/* Live Indicator */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-4 w-4 animate-ping rounded-full bg-blue-500 opacity-75"></div>
                <div className="absolute top-0 left-0 h-4 w-4 rounded-full bg-blue-500"></div>
              </div>
              <span className="mt-1 text-xs font-medium text-blue-600">LIVE</span>
            </div>

            {/* ETA and Distance */}
            <div className="flex-1">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{eta}</span>
                <span className="text-sm text-gray-500">away</span>
              </div>
              <div className="text-sm text-gray-600">
                {distance} • Rider #{riderId}
              </div>
              {lastUpdate && (
                <div className="mt-1 text-xs text-gray-400">
                  Updated {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchLocation}
              className="rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
              title="Refresh location"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-4 right-4 max-w-sm rounded-lg border border-red-200 bg-red-50/95 p-3 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 rounded-lg border border-white/20 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm">
        <div className="mb-2 font-semibold text-gray-700">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
            <span>Rider Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <span>Pickup Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-blue-500"></div>
            <span>Route</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
        }
        .mapboxgl-popup-tip {
          display: none;
        }
        .rider-marker,
        .pickup-marker {
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .rider-marker:hover,
        .pickup-marker:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}
