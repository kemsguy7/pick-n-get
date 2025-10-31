#!/bin/bash

echo "🚗 Starting rider location simulation..."
echo "This will simulate a rider moving towards a pickup location"

# Starting point (rider's initial location)
START_LAT=6.5244
START_LNG=3.3792

# Pickup location
PICKUP_LAT=6.4281
PICKUP_LNG=3.4219

# Number of simulation steps (increased for slower movement)
STEPS=20

# Calculate increments for smooth movement
LAT_INCREMENT=$(echo "scale=6; ($PICKUP_LAT - $START_LAT) / $STEPS" | bc)
LNG_INCREMENT=$(echo "scale=6; ($PICKUP_LNG - $START_LNG) / $STEPS" | bc)

echo "📍 Starting location: ($START_LAT, $START_LNG)"
echo "🎯 Pickup location: ($PICKUP_LAT, $PICKUP_LNG)"
echo "📈 Steps: $STEPS"
echo "🐢 Moving slower for better visibility..."
echo "📱 Make sure your frontend is open on the tracking page!"

for ((i=0; i<=STEPS; i++)); do
  # Calculate current position
  CURRENT_LAT=$(echo "scale=6; $START_LAT + ($LAT_INCREMENT * $i)" | bc)
  CURRENT_LNG=$(echo "scale=6; $START_LNG + ($LNG_INCREMENT * $i)" | bc)
  
  # Calculate progress percentage
  PROGRESS=$(( (i * 100) / STEPS ))
  
  # Calculate heading (direction towards pickup)
  HEADING=$(( 45 + (i * 5) % 360 )) # Slower heading change
  
  echo "🔄 Step $i/$STEPS (${PROGRESS}%) - Updating location..."
  
  # Send location update to backend
  RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/location/update \
    -H "Content-Type: application/json" \
    -d "{
      \"riderId\": 1759734077663,
      \"lat\": $CURRENT_LAT,
      \"lng\": $CURRENT_LNG,
      \"heading\": $HEADING
    }")
  
  if [[ $RESPONSE == *"success"* ]]; then
    echo "✅ Location updated: ($CURRENT_LAT, $CURRENT_LNG), Heading: $HEADING°"
  else
    echo "❌ Failed to update location"
    echo "Full response: $RESPONSE"
  fi
  
  # Wait 5 seconds between updates (slower movement)
  echo "⏳ Waiting 5 seconds..."
  sleep 5
done

echo "🎉 Rider simulation completed!"
echo "👀 Check your frontend - you should see smooth rider movement!"