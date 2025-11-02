import { PickUp, PickUpStatus } from '../models/pickupModel.js';
import { Rider, RiderStatus } from '../interface/deliveryInterface.js';
import mongoose, { Document } from 'mongoose';

// Helper type to ensure Mongoose document with _id
type RiderDocument = Document & {
  _id: mongoose.Types.ObjectId;
  id: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  riderStatus: RiderStatus;
  // Add other fields as needed
};

interface AgentPickup {
  trackingId: string;
  pickupId: string;
  customerName: string;
  customerPhoneNumber: string;
  pickupAddress: string;
  itemCategory: string;
  itemWeight: number;
  itemDescription?: string;
  estimatedEarnings: number;
  pickUpStatus: string;
  requestedAt: Date;
  acceptedAt?: Date;
  distance?: string;
}

interface PickupUpdateResult {
  success: boolean;
  message?: string;
  data?: {
    trackingId: string;
    newStatus: string;
  };
  error?: string;
}

/**
 * Get all active pickups for an agent (InTransit, PickedUp)
 */
export async function getAgentActivePickups(riderId: number): Promise<AgentPickup[]> {
  try {
    const rider = (await Rider.findOne({ id: riderId })) as RiderDocument | null;
    if (!rider) {
      throw new Error('Rider not found');
    }

    const activePickups = await PickUp.find({
      riderId: rider._id,
      pickUpStatus: { $in: [PickUpStatus.InTransit, PickUpStatus.PickedUp] },
    }).sort({ requestedAt: -1 });

    return activePickups.map((pickup) => ({
      trackingId: pickup.trackingId,
      pickupId: (pickup._id as mongoose.Types.ObjectId).toString(),
      customerName: pickup.customerName,
      customerPhoneNumber: pickup.customerPhoneNumber,
      pickupAddress: pickup.pickupAddress,
      itemCategory: pickup.itemCategory,
      itemWeight: pickup.itemWeight,
      itemDescription: pickup.itemDescription,
      estimatedEarnings: pickup.estimatedEarnings,
      pickUpStatus: pickup.pickUpStatus,
      requestedAt: pickup.requestedAt,
      acceptedAt: pickup.acceptedAt,
    }));
  } catch (error) {
    console.error('Error fetching active pickups:', error);
    throw error;
  }
}

/**
 * Get available pickup jobs for an agent (Pending status only)
 */
export async function getAvailablePickupJobs(
  riderId: number,
  limit: number = 10,
): Promise<AgentPickup[]> {
  try {
    const rider = (await Rider.findOne({ id: riderId })) as RiderDocument | null;
    if (!rider) {
      throw new Error('Rider not found');
    }

    const availableJobs = await PickUp.find({
      riderId: rider._id,
      pickUpStatus: PickUpStatus.Pending,
    })
      .sort({ requestedAt: -1 })
      .limit(limit);

    return availableJobs.map((pickup) => ({
      trackingId: pickup.trackingId,
      pickupId: (pickup._id as mongoose.Types.ObjectId).toString(),
      customerName: pickup.customerName,
      customerPhoneNumber: pickup.customerPhoneNumber,
      pickupAddress: pickup.pickupAddress,
      itemCategory: pickup.itemCategory,
      itemWeight: pickup.itemWeight,
      itemDescription: pickup.itemDescription,
      estimatedEarnings: pickup.estimatedEarnings,
      pickUpStatus: pickup.pickUpStatus,
      requestedAt: pickup.requestedAt,
    }));
  } catch (error) {
    console.error('Error fetching available jobs:', error);
    throw error;
  }
}

/**
 * Accept a pickup job (Pending -> InTransit)
 */
export async function acceptPickupJob(
  riderId: number,
  pickupId: string,
): Promise<PickupUpdateResult> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const rider = (await Rider.findOne({ id: riderId }).session(session)) as RiderDocument | null;
      if (!rider) {
        throw new Error('Rider not found');
      }

      const pickup = await PickUp.findById(pickupId).session(session);
      if (!pickup) {
        throw new Error('Pickup not found');
      }

      // Verify pickup belongs to this rider
      if ((pickup.riderId as mongoose.Types.ObjectId).toString() !== rider._id.toString()) {
        throw new Error('This pickup is not assigned to you');
      }

      // Check current status
      if (pickup.pickUpStatus !== PickUpStatus.Pending) {
        throw new Error(`Cannot accept pickup with status: ${pickup.pickUpStatus}`);
      }

      // Update pickup status
      pickup.pickUpStatus = PickUpStatus.InTransit;
      pickup.acceptedAt = new Date();
      await pickup.save({ session });

      // Update rider status
      await Rider.findOneAndUpdate(
        { id: riderId },
        { riderStatus: RiderStatus.OnTrip },
        { session, new: true },
      );

      console.log(`✅ Pickup ${pickup.trackingId} accepted by rider ${rider.name}`);

      return {
        success: true,
        message: 'Pickup accepted successfully',
        data: {
          trackingId: pickup.trackingId,
          newStatus: pickup.pickUpStatus,
        },
      };
    });
  } catch (error) {
    console.error('Error accepting pickup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to accept pickup';
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    await session.endSession();
  }
}

/**
 * Update pickup status (InTransit -> PickedUp -> Delivered)
 */
export async function updatePickupStatus(
  riderId: number,
  pickupId: string,
  newStatus: PickUpStatus,
): Promise<PickupUpdateResult> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const rider = (await Rider.findOne({ id: riderId }).session(session)) as RiderDocument | null;
      if (!rider) {
        throw new Error('Rider not found');
      }

      const pickup = await PickUp.findById(pickupId).session(session);
      if (!pickup) {
        throw new Error('Pickup not found');
      }

      if ((pickup.riderId as mongoose.Types.ObjectId).toString() !== rider._id.toString()) {
        throw new Error('This pickup is not assigned to you');
      }

      const validTransitions: Record<PickUpStatus, PickUpStatus[]> = {
        [PickUpStatus.Pending]: [PickUpStatus.InTransit, PickUpStatus.Cancelled],
        [PickUpStatus.InTransit]: [PickUpStatus.PickedUp, PickUpStatus.Cancelled],
        [PickUpStatus.PickedUp]: [PickUpStatus.Delivered],
        [PickUpStatus.Delivered]: [],
        [PickUpStatus.Cancelled]: [],
      };

      const allowedStatuses = validTransitions[pickup.pickUpStatus as PickUpStatus];
      if (!allowedStatuses.includes(newStatus)) {
        throw new Error(`Cannot transition from ${pickup.pickUpStatus} to ${newStatus}`);
      }

      pickup.pickUpStatus = newStatus;

      if (newStatus === PickUpStatus.PickedUp) {
        pickup.collectedAt = new Date();
      } else if (newStatus === PickUpStatus.Delivered) {
        pickup.deliveredAt = new Date();
        await Rider.findOneAndUpdate(
          { id: riderId },
          { riderStatus: RiderStatus.Available },
          { session, new: true },
        );
      }

      await pickup.save({ session });

      console.log(
        `✅ Pickup ${pickup.trackingId} status updated to ${newStatus} by rider ${rider.name}`,
      );

      return {
        success: true,
        message: `Pickup status updated to ${newStatus}`,
        data: {
          trackingId: pickup.trackingId,
          newStatus: newStatus,
        },
      };
    });
  } catch (error) {
    console.error('Error updating pickup status:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    await session.endSession();
  }
}
/**
 * Cancel a pickup (can only cancel Pending or InTransit)
 */
export async function cancelPickup(
  riderId: number,
  pickupId: string,
  reason?: string,
): Promise<PickupUpdateResult> {
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const rider = (await Rider.findOne({ id: riderId }).session(session)) as RiderDocument | null;
      if (!rider) {
        throw new Error('Rider not found');
      }

      const pickup = await PickUp.findById(pickupId).session(session);
      if (!pickup) {
        throw new Error('Pickup not found');
      }

      // Verify pickup belongs to this rider
      if ((pickup.riderId as mongoose.Types.ObjectId).toString() !== rider._id.toString()) {
        throw new Error('This pickup is not assigned to you');
      }

      // Can only cancel Pending or InTransit
      if (![PickUpStatus.Pending, PickUpStatus.InTransit].includes(pickup.pickUpStatus)) {
        throw new Error(`Cannot cancel pickup with status: ${pickup.pickUpStatus}`);
      }

      // Update pickup
      pickup.pickUpStatus = PickUpStatus.Cancelled;
      if (reason) {
        pickup.notes = reason;
      }
      await pickup.save({ session });

      // Make rider available again
      await Rider.findOneAndUpdate(
        { id: riderId },
        { riderStatus: RiderStatus.Available },
        { session, new: true },
      );

      console.log(`⚠️ Pickup ${pickup.trackingId} cancelled by rider ${rider.name}`);

      return {
        success: true,
        message: 'Pickup cancelled successfully',
        data: {
          trackingId: pickup.trackingId,
          newStatus: PickUpStatus.Cancelled,
        },
      };
    });
  } catch (error) {
    console.error('Error cancelling pickup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to cancel pickup';
    return {
      success: false,
      error: errorMessage,
    };
  } finally {
    await session.endSession();
  }
}

/**
 * Get agent statistics
 */
export async function getAgentStats(riderId: number) {
  try {
    const rider = (await Rider.findOne({ id: riderId })) as RiderDocument | null;
    if (!rider) {
      throw new Error('Rider not found');
    }

    const totalPickups = await PickUp.countDocuments({
      riderId: rider._id,
      pickUpStatus: PickUpStatus.Delivered,
    });

    const totalEarningsResult = await PickUp.aggregate([
      {
        $match: {
          riderId: rider._id,
          pickUpStatus: PickUpStatus.Delivered,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$estimatedEarnings' },
        },
      },
    ]);

    const totalEarnings = totalEarningsResult[0]?.total || 0;

    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const weeklyPickups = await PickUp.countDocuments({
      riderId: rider._id,
      pickUpStatus: PickUpStatus.Delivered,
      deliveredAt: { $gte: thisWeekStart },
    });

    return {
      totalPickups,
      totalEarnings,
      weeklyPickups,
      rating: 4.8,
      completionRate: 96,
    };
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    throw error;
  }
}
