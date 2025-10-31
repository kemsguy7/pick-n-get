/**
 * Calculate required vehicle type based on item weight
 */
export function calculateVehicleType(weightInKg: number): string {
  if (weightInKg < 5) {
    return 'Bike';
  } else if (weightInKg < 50) {
    return 'Car';
  } else if (weightInKg < 200) {
    return 'Van';
  } else {
    return 'Truck';
  }
}
