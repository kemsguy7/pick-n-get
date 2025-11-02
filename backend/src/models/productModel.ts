import mongoose, { Document, Schema } from 'mongoose';

export enum ProductStatus {
  Available = 'Available',
  SoldOut = 'Sold Out',
  Inactive = 'Inactive',
}

export enum ProductCategory {
  BagsAccessories = 'Bags & Accessories',
  Furniture = 'Furniture',
  OfficeSupplies = 'Office Supplies',
  FitnessWellness = 'Fitness & Wellness',
  HomeGarden = 'Home & Garden',
  Textiles = 'Textiles',
  Electronics = 'Electronics',
  Others = 'Others',
}

export interface IProduct extends Document {
  productId: number;
  walletAddress: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number; // In HBAR
  priceUSD?: number; // In USD (for display)
  quantity: number;
  weight: number; // In kg
  imageFileId: string; // Hedera File Service ID
  imageUrl?: string; // Full URL (generated from File ID)
  txHash: string; // Blockchain transaction hash
  status: ProductStatus;

  // Stats
  views: number;
  sales: number;
  revenue: number;

  // Sustainability metrics
  recycledPercentage?: number;
  carbonNeutral?: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    productId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(ProductCategory),
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceUSD: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    imageFileId: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    txHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ProductStatus),
      default: ProductStatus.Available,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    sales: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    recycledPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    carbonNeutral: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Indexes for efficient queries
ProductSchema.index({ walletAddress: 1, status: 1 });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ status: 1, createdAt: -1 });

// Virtual for image URL generation
ProductSchema.virtual('generatedImageUrl').get(function () {
  return this.imageUrl || `https://hashscan.io/testnet/file/${this.imageFileId}`;
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);

// Producer/Vendor Model
export interface IProducer extends Document {
  registrationId: number;
  walletAddress: string;
  name: string;
  businessName?: string;
  country: string;
  phoneNumber: string;
  isVerified: boolean;

  // Stats
  totalProducts: number;
  totalRevenue: number;
  totalSales: number;
  avgRating: number;
  monthlyGrowth: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const ProducerSchema = new Schema<IProducer>(
  {
    registrationId: {
      type: Number,
      required: true,
      unique: true,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
    },
    country: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    totalProducts: {
      type: Number,
      default: 0,
    },
    totalRevenue: {
      type: Number,
      default: 0,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    monthlyGrowth: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Producer = mongoose.model<IProducer>('Producer', ProducerSchema);

// Order Model
export interface IOrder extends Document {
  orderId: string;
  productId: number;
  vendorWalletAddress: string;
  customerWalletAddress: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalAmount: number; // In HBAR
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  deliveryAddress: string;
  txHash: string;
  orderDate: Date;
  deliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    productId: {
      type: Number,
      required: true,
      index: true,
    },
    vendorWalletAddress: {
      type: String,
      required: true,
      index: true,
    },
    customerWalletAddress: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    txHash: {
      type: String,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    deliveryDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

OrderSchema.index({ vendorWalletAddress: 1, status: 1 });
OrderSchema.index({ customerWalletAddress: 1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
