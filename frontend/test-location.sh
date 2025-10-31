for i in {1..10}; do
  LAT=$(echo "6.5244 + $i * 0.001" | bc)
  LNG=$(echo "3.3792 + $i * 0.001" | bc)
  
  curl -X POST http://localhost:5000/api/v1/location/update \
    -H "Content-Type: application/json" \
    -d "{\"riderId\": 123, \"lat\": $LAT, \"lng\": $LNG, \"heading\": 45}"
  
  echo "\nLocation updated: $LAT, $LNG"
  sleep 5
done