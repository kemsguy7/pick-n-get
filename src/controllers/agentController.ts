import { Request, Response } from 'express';
import { PickUp, PickUpStatus } from '../models/pickupModel.js';
import { Rider, RiderStatus } from '../interface/deliveryInterface.js';

/**
 * Get agent's active pickups
 * GET /api/v1/agents/:riderId/pickups/active
 */
export const getAgentActivePickups = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    // Find rider by ID
    const rider = await Rider.findOne({ id: parseInt(riderId) });
    if (!rider) {
      return res.status(404).json({
        status: 'error',
        message: 'Rider not found',
      });
    }

    // Get active pickups for this rider
    const pickups = await PickUp.find({
      riderId: rider._id,
      pickUpStatus: { $in: [PickUpStatus.Pending, PickUpStatus.InTransit, PickUpStatus.PickedUp] },
    }).sort({ requestedAt: -1 });

    const formattedPickups = pickups.map((pickup) => ({
      trackingId: pickup.trackingId,
      pickupId: pickup._id.toString(),
      customerName: pickup.customerName,
      customerPhoneNumber: pickup.customerPhoneNumber,
      pickupAddress: pickup.pickUpAddress,
      pickupCoordinates: pickup.pickupCoordinates,
      itemCategory: pickup.itemCategory,
      itemWeight: pickup.itemWeight,
      estimatedEarnings: pickup.estimatedEarnings,
      pickUpStatus: pickup.pickUpStatus,
      requestedAt: pickup.requestedAt,
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        riderId: parseInt(riderId),
        riderName: rider.name,
        pickups: formattedPickups,
      },
    });
  } catch (error: any) {
    console.error('Error fetching agent active pickups:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch active pickups',
    });
  }
};

/**
 * Get available pickup jobs for agent
 * GET /api/v1/agents/:riderId/pickups/available
 */
export const getAvailableJobs = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    // Find rider by ID
    const rider = await Rider.findOne({ id: parseInt(riderId) });
    if (!rider) {
      return res.status(404).json({
        status: 'error',
        message: 'Rider not found',
      });
    }

    // Find available jobs (pending status, compatible vehicle type, within capacity)
    const availableJobs = await PickUp.find({
      pickUpStatus: PickUpStatus.Pending,
      riderId: { $exists: false }, // No rider assigned yet
      itemWeight: { $lte: rider.capacity },
    })
      .sort({ requestedAt: 1 }) // Oldest first
      .limit(10);

    const formattedJobs = availableJobs.map((job) => ({
      trackingId: job.trackingId,
      pickupId: job._id.toString(),
      customerName: job.customerName,
      customerPhoneNumber: job.customerPhoneNumber,
      pickupAddress: job.pickUpAddress,
      itemCategory: job.itemCategory,
      itemWeight: job.itemWeight,
      estimatedEarnings: job.estimatedEarnings,
      requestedAt: job.requestedAt,
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        jobs: formattedJobs,
      },
    });
  } catch (error: any) {
    console.error('Error fetching available jobs:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch available jobs',
    });
  }
};

/**
 * Accept a pickup job
 * POST /api/v1/agents/:riderId/pickups/:pickupId/accept
 */
export const acceptPickupJob = async (req: Request, res: Response) => {
  try {
    const { riderId, pickupId } = req.params;

    // Find rider
    const rider = await Rider.findOne({ id: parseInt(riderId) });
    if (!rider) {
      return res.status(404).json({
        status: 'error',
        message: 'Rider not found',
      });
    }

    // Check if rider is available
    if (rider.riderStatus !== RiderStatus.Available) {
      return res.status(400).json({
        status: 'error',
        message: 'Rider is not available',
      });
    }

    // Find pickup
    const pickup = await PickUp.findById(pickupId);
    if (!pickup) {
      return res.status(404).json({
        status: 'error',
        message: 'Pickup not found',
      });
    }

    // Check if pickup is still pending
    if (pickup.pickUpStatus !== PickUpStatus.Pending) {
      return res.status(400).json({
        status: 'error',
        message: 'Pickup is no longer available',
      });
    }

    // Assign rider to pickup
    pickup.riderId = rider._id;
    pickup.pickUpStatus = PickUpStatus.InTransit;
    pickup.acceptedAt = new Date();
    await pickup.save();

    // Update rider status
    rider.riderStatus = RiderStatus.OnTrip;
    await rider.save();

    return res.status(200).json({
      status: 'success',
      message: 'Pickup job accepted successfully',
      data: {
        pickupId: pickup._id.toString(),
        trackingId: pickup.trackingId,
        pickUpStatus: pickup.pickUpStatus,
        riderStatus: rider.riderStatus,
      },
    });
  } catch (error: any) {
    console.error('Error accepting pickup job:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to accept pickup job',
    });
  }
};

/**
 * Update pickup status
 * PATCH /api/v1/agents/:riderId/pickups/:pickupId/status
 */
export const updatePickupStatus = async (req: Request, res: Response) => {
  try {
    const { riderId, pickupId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!Object.values(PickUpStatus).includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pickup status',
      });
    }

    // Find rider
    const rider = await Rider.findOne({ id: parseInt(riderId) });
    if (!rider) {
      return res.status(404).json({
        status: 'error',
        message: 'Rider not found',
      });
    }

    // Find pickup and verify it belongs to this rider
    const pickup = await PickUp.findOne({
      _id: pickupId,
      riderId: rider._id,
    });

    if (!pickup) {
      return res.status(404).json({
        status: 'error',
        message: 'Pickup not found or not assigned to this rider',
      });
    }

    // Update pickup status
    pickup.pickUpStatus = status;

    // Set appropriate timestamps
    if (status === PickUpStatus.PickedUp) {
      pickup.collectedAt = new Date();
    } else if (status === PickUpStatus.Delivered) {
      pickup.deliveredAt = new Date();
      // Free up the rider
      rider.riderStatus = RiderStatus.Available;
      await rider.save();
    }

    await pickup.save();

    return res.status(200).json({
      status: 'success',
      message: 'Pickup status updated successfully',
      data: {
        pickupId: pickup._id.toString(),
        trackingId: pickup.trackingId,
        pickUpStatus: pickup.pickUpStatus,
        collectedAt: pickup.collectedAt,
        deliveredAt: pickup.deliveredAt,
      },
    });
  } catch (error: any) {
    console.error('Error updating pickup status:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update pickup status',
    });
  }
};

/**
 * Get agent statistics
 * GET /api/v1/agents/:riderId/stats
 */
export const getAgentStats = async (req: Request, res: Response) => {
  try {
    const { riderId } = req.params;

    // Find rider
    const rider = await Rider.findOne({ id: parseInt(riderId) });
    if (!rider) {
      return res.status(404).json({
        status: 'error',
        message: 'Rider not found',
      });
    }

    // Calculate stats
    const totalPickups = await PickUp.countDocuments({
      riderId: rider._id,
      pickUpStatus: PickUpStatus.Delivered,
    });

    const weeklyPickups = await PickUp.countDocuments({
      riderId: rider._id,
      pickUpStatus: PickUpStatus.Delivered,
      deliveredAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    });

    const completedPickups = await PickUp.find({
      riderId: rider._id,
      pickUpStatus: PickUpStatus.Delivered,
    });

    const totalEarnings = completedPickups.reduce(
      (sum, pickup) => sum + (pickup.estimatedEarnings || 0),
      0,
    );

    // Mock rating for now (would be calculated from customer reviews)
    const rating = 4.8;

    // Calculate completion rate (assuming all assigned pickups should be completed)
    const totalAssigned = await PickUp.countDocuments({ riderId: rider._id });
    const completionRate =
      totalAssigned > 0 ? Math.round((totalPickups / totalAssigned) * 100) : 100;

    return res.status(200).json({
      status: 'success',
      data: {
        totalPickups,
        totalEarnings,
        weeklyPickups,
        rating,
        completionRate,
      },
    });
  } catch (error: any) {
    console.error('Error fetching agent stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to fetch agent stats',
    });
  }
};
