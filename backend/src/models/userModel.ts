import mongoose, { Document } from 'mongoose';

export enum UserRole {
  Recycler = 'Recycler',
  Admin = 'Admin',
  SuperAdmin = 'SuperAdmin',
  Vendor = 'Vendor',
}

export enum UserStatus {
  Active = 'Active',
  Inactive = 'Inactive',
  Suspended = 'Suspended',
}

export interface IUser extends Document {
  id: number;
  name: string;
  email?: string;
  phoneNumber: string;
  walletAddress?: string;
  roles: UserRole[]; //Changed from 'role' to 'roles' array
  status: UserStatus;
  profileImage?: string;
  address?: string;
  country?: string;

  // Recycling stats
  totalRecycled?: number;
  totalEarnings?: number;
  co2Saved?: number;
  totalPickups?: number;

  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
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
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRole),
      default: [UserRole.Recycler], //Array of roles
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.Active,
    },
    profileImage: {
      type: String,
    },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    totalRecycled: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    co2Saved: {
      type: Number,
      default: 0,
    },
    totalPickups: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>('User', UserSchema);
