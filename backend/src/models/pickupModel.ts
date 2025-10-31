import mongoose, { Document, Schema } from 'mongoose';

export enum PickUpStatus {
  Pending = 'Pending',
  InTransit = 'InTransit',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export interface IPickUp extends Document {
  // Unique tracking ID (REC format for consistency with UI)
  trackingId: string;

  // References
  riderId: mongoose.Types.ObjectId;
  userId: number; // From smart contract
  itemId: number; // From smart contract (recycleItem function)

  // Customer information
  customerName: string;
  customerPhoneNumber: string;
  pickupAddress: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };

  // Item details
  itemCategory: string; // plastic, metal, glass, etc.
  itemWeight: number; // in kg
  itemDescription?: string;
  itemImages?: string[]; // IPFS CIDs

  // Pickup status
  pickUpStatus: PickUpStatus;

  // Timestamps
  requestedAt: Date;
  acceptedAt?: Date;
  collectedAt?: Date;
  deliveredAt?: Date;

  // Earnings
  estimatedEarnings: number;

  // Smart contract confirmation
  confirmedOnChain: boolean;
  confirmationTxHash?: string;

  // Additional metadata
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PickUpSchema = new Schema<IPickUp>(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true, // unique already creates an index, no need for index: true
    },
    riderId: {
      type: Schema.Types.ObjectId,
      ref: 'Rider',
      required: true,
      index: true,
    },
    userId: {
      type: Number,
      required: true,
      index: true,
    },
    itemId: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhoneNumber: {
      type: String,
      required: true,
    },
    pickupAddress: {
      type: String,
      required: true,
    },
    pickupCoordinates: {
      lat: { type: Number },
      lng: { type: Number },
    },
    itemCategory: {
      type: String,
      required: true,
    },
    itemWeight: {
      type: Number,
      required: true,
    },
    itemDescription: {
      type: String,
    },
    itemImages: {
      type: [String],
      default: [],
    },
    pickUpStatus: {
      type: String,
      enum: Object.values(PickUpStatus),
      default: PickUpStatus.Pending,
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    acceptedAt: {
      type: Date,
    },
    collectedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    estimatedEarnings: {
      type: Number,
      required: true,
    },
    confirmedOnChain: {
      type: Boolean,
      default: false,
    },
    confirmationTxHash: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Generate tracking ID before saving
PickUpSchema.pre('save', async function (next) {
  if (this.isNew && !this.trackingId) {
    // Generate REC + 6 random digits
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    this.trackingId = `REC${randomNum}`;

    // Ensure uniqueness
    const existing = await mongoose.model('PickUp').findOne({ trackingId: this.trackingId });
    if (existing) {
      // Retry with new number
      const newRandomNum = Math.floor(100000 + Math.random() * 900000);
      this.trackingId = `REC${newRandomNum}`;
    }
  }
  next();
});

// Compound indexes for efficient queries
PickUpSchema.index({ riderId: 1, pickUpStatus: 1 });
PickUpSchema.index({ userId: 1, createdAt: -1 });
// Removed duplicate: PickUpSchema.index({ trackingId: 1 }); - already indexed via unique: true

export const PickUp = mongoose.models.PickUp || mongoose.model<IPickUp>('PickUp', PickUpSchema);
