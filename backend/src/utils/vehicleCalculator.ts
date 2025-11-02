import { VehicleType } from '../interface/deliveryInterface.js';

/**
 * Calculate required vehicle type based on item weight
 * Weight thresholds:
 * - < 5kg: Bike
 * - 5-50kg: Car
 * - 50-200kg: Van
 * - 200kg+: Truck
 */
export function calculateVehicleType(weightInKg: number): VehicleType {
  if (weightInKg < 5) {
    return VehicleType.Bike;
  } else if (weightInKg < 50) {
    return VehicleType.Car;
  } else if (weightInKg < 200) {
    return VehicleType.Van;
  } else {
    return VehicleType.Truck;
  }
}

/**
 * Get minimum capacity required for vehicle type
 */
export function getMinimumCapacity(vehicleType: VehicleType): number {
  const capacityMap = {
    [VehicleType.Bike]: 5,
    [VehicleType.Car]: 50,
    [VehicleType.Van]: 200,
    [VehicleType.Truck]: 500,
  };
  return capacityMap[vehicleType] || 0;
}

/**
 * Check if rider's vehicle can handle the weight
 */
export function canHandleWeight(
  riderCapacity: number,
  itemWeight: number,
  vehicleType: VehicleType,
): boolean {
  const minimumRequired = getMinimumCapacity(vehicleType);
  return riderCapacity >= minimumRequired && riderCapacity >= itemWeight;
}
