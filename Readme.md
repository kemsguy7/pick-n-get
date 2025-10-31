````markdown
# EcoCleans Backend - Web3 Recycling Platform API

**Backend Services for Waste Management & Rider Operations**

## 🚀Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- Firebase project for real-time features
- Pinata account for IPFS storage

### Installation

```bash
# Clone and install
git clone <repository-url>
cd ecocleans-n-get-be
npm install

# Environment setup
cp .env.example .env
# Edit .env with your credentials

# Development
npm run dev

# Production
npm run build
npm start
```
````

## ⚙️ Environment Configuration

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecocleans

# Firebase
DATABASE_URL=https://your-project.firebaseio.com/
APIKEY=your_firebase_api_key
AUTHDOMAIN=your-project.firebaseapp.com
PROJECTID=your-project-id
STORAGEBUCKET=your-project.appspot.com
MESSAGINGSENDERID=your_sender_id
APPID=your_app_id

# Mapbox
MAPBOX_API_KEY=your_mapbox_api_key

# Security & CORS
PRIVATE_KEY=your_encryption_key
PUBLIC_KEY=your_encryption_key
FRONTEND_URL=http://localhost:3000
```

## 🏗️ Project Structure

```
src/
├── controllers/          # Request handlers
│   ├── pickupController.ts
│   ├── pickupTrackingController.ts
│   └── deliveryController.ts
├── routes/              # API routes
│   ├── pickupRoutes.ts
│   └── deliveryRoute.ts
├── models/              # Database models
│   └── pickupModel.ts
├── interface/           # TypeScript interfaces
│   └── deliveryInterface.ts
├── services/            # Business logic
├── utils/               # Helper functions
├── middleware/          # Express middleware
├── config/              # Configuration
└── swagger/             # API documentation
```

## 📡 API Endpoints

### Tracking & Pickups

- `GET /api/v1/pickups/track/:pickupId` - Track pickup details
- `GET /api/v1/pickups/user/:userId/active` - User's active pickups
- `GET /api/v1/pickups/user/:userId/history` - User's pickup history
- `POST /api/v1/pickups/find-riders` - Find nearest riders
- `POST /api/v1/pickups/create` - Create pickup request

### Rider Management

- `POST /api/v1/riders` - Register new rider
- `GET /api/v1/riders` - Get all riders (admin)
- `GET /api/v1/riders/:riderId` - Get rider details
- `GET /api/v1/riders/check/:identifier` - Check registration
- `PATCH /api/v1/riders/:riderId/approval` - Approve/reject rider

### Agent Operations

- `GET /api/v1/agents/:riderId/stats` - Agent dashboard stats
- `GET /api/v1/agents/:riderId/pickups/active` - Agent's active pickups
- `GET /api/v1/agents/:riderId/pickups/available` - Available pickup jobs
- `POST /api/v1/agents/:riderId/pickups/:pickupId/accept` - Accept pickup
- `PATCH /api/v1/agents/:riderId/pickups/:pickupId/status` - Update status

### Location Services

- `POST /api/v1/location/update` - Update rider location
- `GET /api/v1/location/:riderId` - Get rider location
- `DELETE /api/v1/location/:riderId` - Remove rider location

## 🗄️ Data Models

### Pickup Model

```typescript
interface PickUp {
  trackingId: string;
  userId: number;
  customerName: string;
  userPhoneNumber: string;
  pickUpAddress: string;
  pickupCoordinates: { lat: number; lng: number };
  itemCategory: string;
  itemWeight: number;
  itemDescription?: string;
  estimatedEarnings: number;
  pickUpStatus: 'Pending' | 'InTransit' | 'PickedUp' | 'Delivered' | 'Cancelled';
  riderId?: ObjectId;
  requestedAt: Date;
  acceptedAt?: Date;
  collectedAt?: Date;
  deliveredAt?: Date;
}
```

### Rider Model

```typescript
interface Rider {
  id: number;
  name: string;
  phoneNumber: string;
  vehicleNumber: string;
  homeAddress: string;
  walletAddress?: string;
  vehicleType: 'Bike' | 'Car' | 'Truck' | 'Van';
  country: string;
  capacity: number;
  riderStatus: 'Available' | 'Off-line' | 'On-Trip';
  approvalStatus: 'Pending' | 'Approved' | 'Reject';
  profileImage?: string;
  driversLicense?: string;
  vehicleRegistration: string;
  insuranceCertificate?: string;
  vehiclePhotos: string;
}
```

## 📊 API Documentation

Access Swagger UI at: `http://localhost:5000/api-docs`

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Checklist

- [ ] MongoDB connection string
- [ ] Firebase configuration
- [ ] Mapbox API key
- [ ] CORS origins configured
- [ ] Environment variables set

## 🐛 Troubleshooting

### Common Issues

- **MongoDB Connection**: Check connection string and network access
- **Firebase Errors**: Verify service account credentials
- **CORS Issues**: Ensure FRONTEND_URL is set correctly
- **Port Conflicts**: Change PORT if 5000 is occupied

### Logs & Debugging

```bash
# Enable debug logging
DEBUG=ecocleans:* npm run dev

# Check MongoDB connection
mongosh "your_connection_string"
```

## 📄 License

MIT License - see LICENSE file for details.

```

```
