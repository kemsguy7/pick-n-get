import { PickUp, IPickUp, PickUpStatus } from '../models/pickupModel.js';
import { Rider, RiderStatus } from '../interface/deliveryInterface.js';
// import { session } from '../config/db';
import mongoose from 'mongoose';

interface CreatePickupData {
  userId: number;
  itemId: number;
  customerName: string;
  customerPhoneNumber: string;
  pickupAddress: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  itemCategory: string;
  itemWeight: number;
  itemDescription?: string;
  itemImages?: string[];
  estimatedEarnings: number;
  riderId: number;
}

interface PickupCreationResult {
  success: boolean;
  data?: {
    trackingId: string;
    pickupId: string;
    riderId: number;
    riderName: string;
    riderPhoneNumber: string;
    estimatedEarnings: number;
    pickUpStatus: string;
  };
  error?: string;
}

/**
 * Create a new pickup request and assign to rider
 * Uses MongoDB transaction to ensure data consistency
 */
export async function createPickup(pickupData: CreatePickupData): Promise<PickupCreationResult> {
  const mongoSession = await mongoose.startSession();

  try {
    return await mongoSession.withTransaction(async () => {
      // Step 1: Find and validate rider
      const rider = await Rider.findOne({ id: pickupData.riderId }).session(mongoSession);

      if (!rider) {
        throw new Error('Rider not found');
      }

      if (rider.riderStatus !== RiderStatus.Available) {
        throw new Error('Rider is not available');
      }

      // Check if rider capacity can handle the weight
      if (rider.capacity < pickupData.itemWeight) {
        throw new Error(
          `Rider vehicle capacity (${rider.capacity}kg) is insufficient for item weight (${pickupData.itemWeight}kg)`,
        );
      }

      // Step 2: Check for existing pending pickup
      const existingPickup = await PickUp.findOne({
        userId: pickupData.userId,
        itemId: pickupData.itemId,
        pickUpStatus: { $in: [PickUpStatus.Pending, PickUpStatus.InTransit] },
      }).session(mongoSession);

      if (existingPickup) {
        throw new Error(
          `You already have a ${existingPickup.pickUpStatus.toLowerCase()} pickup for this item (${existingPickup.trackingId})`,
        );
      }

      // Step 3: Create pickup record
      const [newPickup] = await PickUp.create(
        [
          {
            riderId: rider._id,
            userId: pickupData.userId,
            itemId: pickupData.itemId,
            customerName: pickupData.customerName,
            customerPhoneNumber: pickupData.customerPhoneNumber,
            pickupAddress: pickupData.pickupAddress,
            pickupCoordinates: pickupData.pickupCoordinates,
            itemCategory: pickupData.itemCategory,
            itemWeight: pickupData.itemWeight,
            itemDescription: pickupData.itemDescription,
            itemImages: pickupData.itemImages || [],
            estimatedEarnings: pickupData.estimatedEarnings,
            pickUpStatus: PickUpStatus.Pending,
            requestedAt: new Date(),
          },
        ],
        { session: mongoSession },
      );

      // Step 4: Update rider status to OnTrip
      await Rider.findOneAndUpdate(
        { id: pickupData.riderId },
        { riderStatus: RiderStatus.OnTrip },
        { session: mongoSession, new: true },
      );

      console.log(
        `✅ Pickup created successfully: ${newPickup.trackingId} assigned to rider ${rider.name}`,
      );

      return {
        success: true,
        data: {
          trackingId: newPickup.trackingId,
          pickupId: (newPickup._id as mongoose.Types.ObjectId).toString(),
          riderId: rider.id,
          riderName: rider.name,
          riderPhoneNumber: rider.phoneNumber,
          estimatedEarnings: pickupData.estimatedEarnings,
          pickUpStatus: newPickup.pickUpStatus,
        },
      };
    });
  } catch (error: any) {
    console.error('Error creating pickup:', error);
    return {
      success: false,
      error: error.message || 'Failed to create pickup',
    };
  } finally {
    await mongoSession.endSession();
  }
}

/**
 * Get pickup by tracking ID
 */
export async function getPickupByTrackingId(trackingId: string): Promise<IPickUp | null> {
  try {
    const pickup = await PickUp.findOne({ trackingId }).populate('riderId');
    return pickup;
  } catch (error) {
    console.error('Error fetching pickup by tracking ID:', error);
    return null;
  }
}

/**
 * Get all pickups for a user
 */
export async function getUserPickups(userId: number): Promise<IPickUp[]> {
  try {
    const pickups = await PickUp.find({ userId }).populate('riderId').sort({ createdAt: -1 });
    return pickups;
  } catch (error) {
    console.error('Error fetching user pickups:', error);
    return [];
  }
}
