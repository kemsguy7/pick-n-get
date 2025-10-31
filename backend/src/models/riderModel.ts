import mongoose, { Document } from 'mongoose';

export enum RiderStatus {
  Available = 'Available',
  OffLine = 'Off-line',
  OnTrip = 'On-Trip',
}

export enum VehicleType {
  Bike = 'Bike',
  Car = 'Car',
  Truck = 'Truck',
  Van = 'Van',
}

export enum ApprovalStatus {
  Pending = 'Pending',
  Approve = 'Approved',
  Reject = 'Reject',
}

export interface IRiderDetails extends Document {
  id: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  homeAddress: string;
  walletAddress?: string;
  riderStatus: RiderStatus;
  vehicleType: VehicleType;
  approvalStatus: ApprovalStatus;
  country: string;
  capacity: number;

  // Vehicle additional details
  vehicleMakeModel?: string;
  vehiclePlateNumber?: string;
  vehicleColor?: string;

  // Hedera File Service CID fields for documents
  profileImage?: string;
  driversLicense?: string;
  vehicleRegistration?: string;
  insuranceCertificate?: string;
  vehiclePhotos?: string;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const RiderSchema = new mongoose.Schema<IRiderDetails>(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    homeAddress: {
      type: String,
      required: true,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
    },
    riderStatus: {
      type: String,
      enum: Object.values(RiderStatus),
      default: RiderStatus.Available,
    },
    vehicleType: {
      type: String,
      enum: Object.values(VehicleType),
      required: true,
    },
    approvalStatus: {
      type: String,
      enum: Object.values(ApprovalStatus),
      default: ApprovalStatus.Pending,
    },
    country: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    vehicleMakeModel: {
      type: String,
    },
    vehiclePlateNumber: {
      type: String,
    },
    vehicleColor: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    driversLicense: {
      type: String,
    },
    vehicleRegistration: {
      type: String,
      required: true,
    },
    insuranceCertificate: {
      type: String,
    },
    vehiclePhotos: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Rider = mongoose.model<IRiderDetails>('Rider', RiderSchema);
