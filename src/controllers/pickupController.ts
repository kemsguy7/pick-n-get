import { Request, Response } from 'express';
import { findNearestRiders } from '../services/riderFinderService.ts';
import { createPickup } from '../services/pickupService.ts';
import { calculateVehicleType } from '../utils/vehicleCalculator.ts';
// import { VehicleType } from '../interface/deliveryInterface';

/**
 * Find nearest available riders for a pickup request
 * POST /api/v1/pickups/find-riders
 */
export const findRiders = async (req: Request, res: Response) => {
  try {
    const { pickupAddress, itemWeight, country } = req.body;

    // Validate required fields
    if (!pickupAddress || !itemWeight || !country) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: pickupAddress, itemWeight, country',
      });
    }

    // Validate weight
    const weight = parseFloat(itemWeight);
    if (isNaN(weight) || weight <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid weight. Must be a positive number',
      });
    }

    // Calculate required vehicle type
    const vehicleType = calculateVehicleType(weight);

    console.log(`Finding riders for ${weight}kg (${vehicleType}) in ${country}`);

    // Find nearest riders
    const riders = await findNearestRiders(pickupAddress, vehicleType, country, weight);

    if (riders.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No available riders found in your area',
        data: {
          riders: [],
          vehicleType,
          itemWeight: weight,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      message: `Found ${riders.length} available rider${riders.length > 1 ? 's' : ''}`,
      data: {
        riders,
        vehicleType,
        itemWeight: weight,
      },
    });
  } catch (error: any) {
    console.error('Error finding riders:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to find riders',
    });
  }
};

/**
 * Create a new pickup request
 * POST /api/v1/pickups/create
 */
export const createPickupRequest = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      itemId,
      customerName,
      customerPhoneNumber,
      pickupAddress,
      pickupCoordinates,
      itemCategory,
      itemWeight,
      itemDescription,
      itemImages,
      estimatedEarnings,
      riderId,
    } = req.body;
    // Validate required fields
    const missingFields: string[] = [];

    if (!userId) missingFields.push('userId');
    if (!itemId) missingFields.push('itemId');
    if (!customerName) missingFields.push('customerName');
    if (!customerPhoneNumber) missingFields.push('customerPhoneNumber');
    if (!pickupAddress) missingFields.push('pickupAddress');
    if (!itemCategory) missingFields.push('itemCategory');
    if (!itemWeight) missingFields.push('itemWeight');
    if (!estimatedEarnings) missingFields.push('estimatedEarnings');
    if (!riderId) missingFields.push('riderId');

    if (missingFields.length > 0) {
      console.error('❌ Missing fields:', missingFields); // Debug log
      console.error('❌ Received payload:', req.body); // Debug log

      return res.status(400).json({
        status: 'error',
        message: `Missing required fields: ${missingFields.join(', ')}`,
        received: req.body, // ✅ Show what was received
      });
    }
    // Validate numeric fields
    const parsedUserId = parseInt(userId);
    const parsedItemId = parseInt(itemId);
    const parsedWeight = parseFloat(itemWeight);
    const parsedEarnings = parseFloat(estimatedEarnings);
    const parsedRiderId = parseInt(riderId);

    if (
      isNaN(parsedUserId) ||
      isNaN(parsedItemId) ||
      isNaN(parsedWeight) ||
      isNaN(parsedEarnings) ||
      isNaN(parsedRiderId)
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid numeric values provided',
      });
    }

    // Create pickup
    const result = await createPickup({
      userId: parsedUserId,
      itemId: parsedItemId,
      customerName,
      customerPhoneNumber,
      pickupAddress,
      pickupCoordinates,
      itemCategory,
      itemWeight: parsedWeight,
      itemDescription,
      itemImages: itemImages || [],
      estimatedEarnings: parsedEarnings,
      riderId: parsedRiderId,
    });

    if (!result.success) {
      return res.status(400).json({
        status: 'error',
        message: result.error || 'Failed to create pickup',
      });
    }

    return res.status(201).json({
      status: 'success',
      message: 'Pickup created successfully',
      data: result.data,
    });
  } catch (error: any) {
    console.error('Error creating pickup:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create pickup',
    });
  }
};
