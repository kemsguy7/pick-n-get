# ⚙️ Pick-n-Get Backend API

**Express.js API Server for Decentralized Recycling Platform**

---

## 🚀Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Firebase project
- Hedera Testnet account

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

**Access:** `http://localhost:5000`  
**API Docs:** `http://localhost:5000/api-docs`

---

## ⚙️ Environment Configuration

Create `.env` with the following:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/pick-n-get

# Hedera
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY_HERE
HEDERA_NETWORK=testnet

# Super Admin
SUPER_ADMIN_WALLET=0x0000000000000000000000000000000000000000

# Firebase
DATABASE_URL=https://your-project.firebaseio.com/
APIKEY=your_firebase_api_key
AUTHDOMAIN=your-project.firebaseapp.com
PROJECTID=your-project-id
STORAGEBUCKET=your-project.appspot.com
MESSAGINGSENDERID=123456789
APPID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json

# Mapbox (Optional)
MAPBOX_API_KEY=your_mapbox_api_key

# Security
PRIVATE_KEY=your_encryption_key
PUBLIC_KEY=your_encryption_key
```

---

## 📂 Project Structure

```
src/
├── controllers/            # Request handlers
│   ├── authController.ts   # Wallet verification
│   ├── pickupController.ts # Pickup coordination
│   ├── agentController.ts  # Rider operations
│   ├── productController.ts # Marketplace logic
│   ├── deliveryController.ts # Delivery management
│   └── adminController.ts  # Admin functions
│
├── services/               # Business logic
│   ├── authService.ts      # Role management
│   ├── deliveryService.ts  # Rider matching
│   ├── pickupService.ts    # Pickup creation
│   ├── hederaFileService.ts # File uploads
│   ├── riderFinderService.ts # Rider routing
│   └── notificationService.ts # Push notifications
│
├── models/                 # MongoDB schemas
│   ├── userModel.ts        # User/Recycler
│   ├── riderModel.ts       # Riders/Agents
│   ├── pickupModel.ts      # Pickups
│   └── productModel.ts     # Products/Vendors
│
├── routes/                 # API routes
│   ├── authRoute.ts        # Authentication
│   ├── pickupRoute.ts      # Pickup operations
│   ├── agentRoute.ts       # Agent/Rider routes
│   ├── productRoute.ts     # Marketplace
│   ├── deliveryRoute.ts    # Delivery management
│   └── adminRoutes.ts      # Admin operations
│
├── middleware/             # Express middleware
│   ├── auth.ts            # Authentication
│   ├── validation.ts      # Input validation
│   └── errorHandler.ts    # Error handling
│
├── config/                 # Configuration
│   ├── db.ts              # MongoDB connection
│   ├── firebase.ts        # Firebase setup
│   └── messaging.ts       # FCM setup
│
├── utils/                  # Helper functions
│   ├── riderValidation.ts
│   └── vehicleCalculator.ts
│
└── swagger/                # API documentation
    ├── config.ts
    └── swagger.yaml
```

---

## 📡 API Endpoints

### Authentication

```
POST   /api/v1/auth/check-wallet
POST   /api/v1/auth/save-user
POST   /api/v1/users/verify-phone
PUT    /api/v1/users/profile
GET    /api/v1/users/:userId
```

### Riders

```
POST   /api/v1/riders
GET    /api/v1/riders
GET    /api/v1/riders/:riderId
GET    /api/v1/riders/check/:identifier
PATCH  /api/v1/riders/:riderId/approval
GET    /api/v1/admin/riders/pending
```

### Pickups

```
POST   /api/v1/pickups/create
POST   /api/v1/pickups/find-riders
GET    /api/v1/pickups/track/:pickupId
GET    /api/v1/pickups/user/:userId/active
GET    /api/v1/pickups/user/:userId/history
```

### Agents

```
GET    /api/v1/agents/:riderId/stats
GET    /api/v1/agents/:riderId/pickups/active
GET    /api/v1/agents/:riderId/pickups/available
POST   /api/v1/agents/:riderId/pickups/:pickupId/accept
PATCH  /api/v1/agents/:riderId/pickups/:pickupId/status
```

### Products

```
POST   /api/v1/products
POST   /api/v1/products/producers
GET    /api/v1/products
GET    /api/v1/products/:productId
PATCH  /api/v1/products/:productId/status
POST   /api/v1/products/:productId/sale
GET    /api/v1/products/vendors/:walletAddress/stats
GET    /api/v1/products/vendors/:walletAddress/products
GET    /api/v1/products/vendors/:walletAddress/orders
GET    /api/v1/products/conversion/hbar-to-usd
POST   /api/v1/products/conversion/usd-to-hbar
```

### Location

```
POST   /api/v1/location/update
GET    /api/v1/location/:riderId
DELETE /api/v1/location/:riderId
```

---

## 🗄️ Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  id: Number,              // Contract user ID
  walletAddress: String,
  name: String,
  phoneNumber: String,
  address: String,
  country: String,
  profileImage: String,    // Hedera File ID
  roles: [String],         // ["Recycler", "Admin", "Vendor"]
  status: String,          // "Active", "Banned"
  totalRecycled: Number,
  totalEarnings: Number,
  co2Saved: Number,
  createdAt: Date
}
```

### Riders Collection

```javascript
{
  _id: ObjectId,
  id: Number,              // Contract rider ID
  walletAddress: String,
  name: String,
  phoneNumber: String,
  vehicleNumber: String,
  vehicleType: String,     // "Bike", "Car", "Truck", "Van"
  capacity: Number,        // kg
  homeAddress: String,
  country: String,
  riderStatus: String,     // "Available", "OnTrip", "Offline"
  approvalStatus: String,  // "Pending", "Approved", "Rejected"
  documents: {
    profileImage: String,
    driversLicense: String,
    vehicleRegistration: String,
    insuranceCertificate: String,
    vehiclePhotos: String
  },
  createdAt: Date
}
```

### Pickups Collection

```javascript
{
  _id: ObjectId,
  trackingId: String,      // "PNW-12345"
  userId: Number,
  riderId: ObjectId,
  customerName: String,
  customerPhoneNumber: String,
  pickupAddress: String,
  pickupCoordinates: {
    lat: Number,
    lng: Number
  },
  itemCategory: String,
  itemWeight: Number,
  itemDescription: String,
  itemImages: [String],    // Hedera File IDs
  estimatedEarnings: Number,
  pickUpStatus: String,    // "Pending", "InTransit", "PickedUp", "Delivered"
  requestedAt: Date,
  acceptedAt: Date,
  collectedAt: Date,
  deliveredAt: Date
}
```

### Products Collection

```javascript
{
  _id: ObjectId,
  productId: Number,       // Contract product ID
  walletAddress: String,   // Vendor wallet
  name: String,
  description: String,
  category: String,
  price: Number,           // HBAR
  priceUSD: Number,
  quantity: Number,
  weight: Number,
  imageFileId: String,     // Hedera File ID
  imageUrl: String,
  txHash: String,
  status: String,          // "Available", "SoldOut"
  views: Number,
  sales: Number,
  revenue: Number,
  createdAt: Date
}
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start with nodemon

# Production
npm run build            # Build TypeScript
npm start                # Start production server

# Database
npm run seed             # Seed database with test data
```

### Code Quality

- **Linting:** ESLint
- **Formatting:** Prettier
- **TypeScript:** Strict mode

---

## 🔐 Security

### Authentication

- **Wallet-based:** No passwords
- **Role verification:** On every protected route
- **Rate limiting:** 100 requests/minute per IP

### Data Protection

- **MongoDB:** Encrypted at rest
- **API:** HTTPS only in production
- **CORS:** Restricted to frontend domain
- **Input validation:** Joi schemas

### Secrets Management

- **Environment variables:** Never commit
- **Hedera keys:** Encrypted storage
- **API keys:** Rotate periodically

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Test connection
mongosh "your_connection_string"

# Check network access (Atlas)
# Add IP to whitelist: 0.0.0.0/0 for testing
```

### Hedera SDK Errors

```bash
# Verify operator ID format: 0.0.123456
# Verify private key format: hex string (no 0x prefix)
# Check network: testnet or mainnet
```

### Firebase Errors

```bash
# Verify service account key path
# Check Firebase project permissions
# Ensure Realtime Database rules allow read/write
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=5001
```

---

## 📦 Dependencies

### Core

- Express.js 5.1.0
- TypeScript 5
- MongoDB + Mongoose 8.19.0

### Hedera

- @hashgraph/sdk 2.72.0
- @hashgraph/proto 2.23.0

### Utilities

- cors 2.8.5
- dotenv 17.2.2
- helmet 8.1.0
- morgan 1.10.1
- multer 2.0.2

### Real-time

- firebase-admin 13.5.0
- socket.io 4.8.1

---

## 📄 License

UNLICENSED — Research and hackathon purposes only.

---

## 📞 Support

- **GitHub Issues:** [Report bugs](https://github.com/Dev-JoyA/pick-n-get-be/issues)
- **Email:** support@pick-n-get.io
- **Docs:** [Full Documentation](../README.md)

---

**Built with Express.js + MongoDB + Hedera SDK**
