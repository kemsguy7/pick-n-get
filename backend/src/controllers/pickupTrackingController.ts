import { Request, Response } from 'express';
import { PickUp, PickUpStatus } from '../models/pickupModel.js';
import { Rider } from '../interface/deliveryInterface.js';

/**
 * Track a pickup by ID
 * GET /api/v1/pickups/track/:pickupId
 */
export const trackPickup = async (req: Request, res: Response) => {
  try {
    const { pickupId } = req.params;

    const pickup = await PickUp.findById(pickupId).populate('riderId');

    if (!pickup) {
      return res.status(404).json({
        status: 'error',
        message: 'Pickup not found',
      });
    }

    // Get rider details
    const rider = await Rider.findOne({ _id: pickup.riderId });

    return res.status(200).json({
      status: 'success',
      data: {
        trackingId: pickup.trackingId,
        pickupId: pickup._id.toString(),
        customerName: pickup.customerName,
        customerPhoneNumber: pickup.userPhoneNumber,
        pickupAddress: pickup.pickUpAddress,
        pickupCoordinates: pickup.pickupCoordinates,
        itemCategory: pickup.itemCategory,
        itemWeight: pickup.itemWeight,
        itemDescription: pickup.itemDescription,
        estimatedEarnings: pickup.estimatedEarnings,
        pickUpStatus: pickup.pickUpStatus,
        riderId: rider?.id,
        riderName: rider?.name,
        riderPhoneNumber: rider?.phoneNumber,
        requestedAt: pickup.requestedAt,
        acceptedAt: pickup.acceptedAt,
        collectedAt: pickup.collectedAt,
        deliveredAt: pickup.deliveredAt,
      },
    });
  } catch (error: any) {
    console.error('Error tracking pickup:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to track pickup',
    });
  }
};

/**
 * Get user's active pickups
 * GET /api/v1/pickups/user/:userId/active
 */
export const getUserActivePickups = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const pickups = await PickUp.find({
      userId: parseInt(userId),
      pickUpStatus: { $in: [PickUpStatus.Pending, PickUpStatus.InTransit, PickUpStatus.PickedUp] },
    })
      .sort({ requestedAt: -1 })
      .populate('riderId');

    const pickupsWithRiderInfo = await Promise.all(
      pickups.map(async (pickup) => {
        const rider = await Rider.findOne({ _id: pickup.riderId });

        return {
          trackingId: pickup.trackingId,
          pickupId: pickup._id.toString(),
          customerName: pickup.customerName,
          customerPhoneNumber: pickup.userPhoneNumber,
          pickupAddress: pickup.pickUpAddress,
          pickupCoordinates: pickup.pickupCoordinates,
          itemCategory: pickup.itemCategory,
          itemWeight: pickup.itemWeight,
          estimatedEarnings: pickup.estimatedEarnings,
          pickUpStatus: pickup.pickUpStatus,
          riderId: rider?.id,
          riderName: rider?.name,
          riderPhoneNumber: rider?.phoneNumber,
          requestedAt: pickup.requestedAt,
          acceptedAt: pickup.acceptedAt,
        };
      }),
    );

    return res.status(200).json({
      status: 'success',
      count: pickupsWithRiderInfo.length,
      data: pickupsWithRiderInfo,
    });
  } catch (error: any) {
    console.error('Error fetching active pickups:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch active pickups',
    });
  }
};

/**
 * Get user's pickup history (completed/delivered)
 * GET /api/v1/pickups/user/:userId/history
 */
export const getUserPickupHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const pickups = await PickUp.find({
      userId: parseInt(userId),
      pickUpStatus: { $in: [PickUpStatus.Delivered, PickUpStatus.Cancelled] },
    })
      .sort({ deliveredAt: -1 })
      .limit(20);

    const pickupsWithRiderInfo = await Promise.all(
      pickups.map(async (pickup) => {
        const rider = await Rider.findOne({ _id: pickup.riderId });

        return {
          trackingId: pickup.trackingId,
          pickupId: pickup._id.toString(),
          itemCategory: pickup.itemCategory,
          itemWeight: pickup.itemWeight,
          estimatedEarnings: pickup.estimatedEarnings,
          pickUpStatus: pickup.pickUpStatus,
          riderName: rider?.name,
          requestedAt: pickup.requestedAt,
          deliveredAt: pickup.deliveredAt,
        };
      }),
    );

    return res.status(200).json({
      status: 'success',
      count: pickupsWithRiderInfo.length,
      data: pickupsWithRiderInfo,
    });
  } catch (error: any) {
    console.error('Error fetching pickup history:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch pickup history',
    });
  }
};
