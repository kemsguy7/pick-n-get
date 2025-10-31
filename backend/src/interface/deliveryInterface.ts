import mongoose, { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Re-export only enums and the model from riderModel
export {
  RiderStatus,
  VehicleType,
  ApprovalStatus,
  Rider,
  type IRiderDetails, // Use 'type' keyword for interface
} from '../models/riderModel';

export enum PickUpStatus {
  Pending = 'Pending',
  InTransit = 'InTransit',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export interface IPickUpDetails extends Document {
  id: string;
  riderId: any;
  userId: number;
  itemId: number;
  customerName: string;
  pickupAddress: string;
  customerPhoneNumber: string;
  pickUpStatus: PickUpStatus;
  description?: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PickUpSchema = new mongoose.Schema<IPickUpDetails>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `VPD${uuidv4().substring(0, 8)}`,
    },
    riderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rider',
      required: true,
    },
    userId: {
      type: Number,
      required: true,
    },
    itemId: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    customerPhoneNumber: {
      type: String,
      required: true,
    },
    pickUpStatus: {
      type: String,
      enum: Object.values(PickUpStatus),
      default: PickUpStatus.Pending,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

export const PickUp = mongoose.model<IPickUpDetails>('PickUp', PickUpSchema);
