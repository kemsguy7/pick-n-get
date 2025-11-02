# 🏗️ Pick-n-Get Architecture Documentation

**Comprehensive System Design & Data Flow**

---

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Architecture Diagram](#architecture-diagram)
- [Component Breakdown](#component-breakdown)
- [Data Flow Examples](#data-flow-examples)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Security Architecture](#security-architecture)

---

## System Overview

Pick-n-Get is a **3-tier decentralized application** that combines:

1. **Frontend** (Next.js) — User interface and wallet integration
2. **Backend** (Express.js) — API server and data persistence
3. **Blockchain** (Hedera) — Smart contracts and immutable storage

---

## Technology Stack

### Frontend

- **Framework:** Next.js 15 + React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **State Management:** React Context + Zustand
- **Wallet Integration:** MetaMask, WalletConnect 2.x
- **File Upload:** Pinata (IPFS)
- **Maps:** Google Maps API, Mapbox
- **Real-time:** Firebase Realtime Database, Socket.io

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB (Mongoose ODM)
- **Caching:** Redis
- **File Storage:** Hedera File Service
- **Authentication:** Wallet signatures
- **API Documentation:** Swagger/OpenAPI

### Blockchain

- **Network:** Hedera Hashgraph Testnet
- **Contracts:** Solidity 0.8.28
- **SDK:** @hashgraph/sdk v2.73
- **Wallet Libraries:** Ethers.js v5.7

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐              │
│  │   Web App     │  │  Mobile App   │  │   Admin Panel │              │
│  │  (Next.js)    │  │   (Future)    │  │   (Next.js)   │              │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘              │
│          │                  │                  │                        │
└──────────┼──────────────────┼──────────────────┼────────────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────┐       │
│  │  React Components + TypeScript                               │       │
│  │  • Auth (Signup, Login) • Dashboard • Recycle Flow          │       │
│  │  • Shop/Marketplace • Admin Panel • Tracking                │       │
│  └─────────────────────────────────────────────────────────────┘       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      WALLET INTERFACE LAYER                              │
│  ┌───────────────────────┐  ┌───────────────────────┐                  │
│  │   MetaMask Client     │  │  WalletConnect Client │                  │
│  │  (EVM Compatible)     │  │   (Mobile Wallets)    │                  │
│  └───────┬───────────────┘  └───────┬───────────────┘                  │
│          │                          │                                   │
│          └──────────┬───────────────┘                                   │
│                     │                                                   │
│          ┌──────────▼──────────┐                                        │
│          │  Unified Wallet API │                                        │
│          │  (walletInterface)  │                                        │
│          └──────────┬──────────┘                                        │
└─────────────────────┼────────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   HEDERA    │ │   BACKEND   │ │    IPFS     │
│   NETWORK   │ │     API     │ │  (Pinata)   │
└─────────────┘ └─────────────┘ └─────────────┘

═══════════════════════════════════════════════════════════════════════════
                        BLOCKCHAIN LAYER
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                      HEDERA HASHGRAPH NETWORK                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │              SMART CONTRACTS (HSCS)                           │      │
│  │  ┌──────────────────────┐  ┌──────────────────────┐         │      │
│  │  │   PicknGet.sol       │  │    Product.sol       │         │      │
│  │  │   0.0.7162853        │  │    0.0.7165733       │         │      │
│  │  │                      │  │                      │         │      │
│  │  │  • registerUser      │  │  • registerProducer  │         │      │
│  │  │  • recycleItem       │  │  • addProduct        │         │      │
│  │  │  • riderApplication  │  │  • shopProduct       │         │      │
│  │  │  • approveRider      │  │                      │         │      │
│  │  │  • confirmItem       │  │  Payment Split:      │         │      │
│  │  │  • payUser           │  │  • 10% → Platform    │         │      │
│  │  │                      │  │  • 90% → Vendor      │         │      │
│  │  └──────────────────────┘  └──────────────────────┘         │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │              HEDERA FILE SERVICE (HFS)                        │      │
│  │  • User profile pictures                                      │      │
│  │  • Rider documents (license, registration, insurance)         │      │
│  │  • Product images                                             │      │
│  │  • Recycling item photos                                      │      │
│  │  Cost: ~$0.05/file (one-time)                                 │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │              HBAR NATIVE PAYMENTS                             │      │
│  │  • Recycling rewards (HBAR to users)                          │      │
│  │  • Marketplace transactions (HBAR to vendors)                 │      │
│  │  • Platform fees (HBAR to contract)                           │      │
│  │  Precision: 8 decimals (tinybars)                             │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │              MIRROR NODE API                                  │      │
│  │  • Transaction status verification                             │      │
│  │  • Event log queries                                          │      │
│  │  • Historical data                                            │      │
│  │  URL: https://testnet.mirrornode.hedera.com                   │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                        BACKEND LAYER
═══════════════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS API SERVER                               │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    REST API ENDPOINTS                         │      │
│  │  • /api/v1/auth          • /api/v1/riders                     │      │
│  │  • /api/v1/pickups       • /api/v1/products                   │      │
│  │  • /api/v1/admin         • /api/v1/location                   │      │
│  │  • /api/v1/agents        • /api/v1/upload                     │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    BUSINESS LOGIC                             │      │
│  │  Controllers → Services → Models                              │      │
│  │  • Auth & Wallet Verification                                 │      │
│  │  • Rider Management                                           │      │
│  │  • Pickup Coordination                                        │      │
│  │  • Product Management                                         │      │
│  │  • Admin Operations                                           │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │                    DATA PERSISTENCE                           │      │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │      │
│  │  │    MongoDB      │  │     Redis       │                    │      │
│  │  │  (Primary DB)   │  │   (Caching)     │                    │      │
│  │  │                 │  │                 │                    │      │
│  │  │  • Users        │  │  • Sessions     │                    │      │
│  │  │  • Riders       │  │  • Locations    │                    │      │
│  │  │  • Pickups      │  │  • Rate Limits  │                    │      │
│  │  │  • Products     │  │                 │                    │      │
│  │  │  • Orders       │  │                 │                    │      │
│  │  └─────────────────┘  └─────────────────┘                    │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │              REAL-TIME SERVICES                               │      │
│  │  ┌─────────────────┐  ┌─────────────────┐                    │      │
│  │  │  Firebase RTDB  │  │   Socket.io     │                    │      │
│  │  │  • Rider GPS    │  │  • Live Updates │                    │      │
│  │  │  • Tracking     │  │  • Notifications│                    │      │
│  │  └─────────────────┘  └─────────────────┘                    │      │
│  └──────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════
                        EXTERNAL SERVICES
═══════════════════════════════════════════════════════════════════════════

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│    Pinata    │  │  Google Maps │  │    Mapbox    │  │   Firebase   │
│    (IPFS)    │  │   (Geocode)  │  │  (Routing)   │  │   (Auth)     │
│              │  │              │  │              │  │              │
│  • Images    │  │  • Address   │  │  • Rider     │  │  • Realtime  │
│  • Documents │  │    lookup    │  │    routing   │  │    DB        │
│  • Metadata  │  │  • Distance  │  │  • ETA calc  │  │  • FCM       │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Component Breakdown

### 1. Frontend Components

**Authentication & Registration:**

- `/auth/signup/recycler` — User registration flow
- `/auth/signup/agent` — Rider registration (4 steps)
- `/auth/signup/vendor` — Vendor registration

**Core Features:**

- `/dashboard` — User dashboard with stats
- `/recycle` — Multi-step recycling submission
- `/shop` — Marketplace for eco-products
- `/tracking` — Real-time delivery tracking
- `/admin` — Admin panel for approvals

**Reusable Components:**

- `WalletConnect.tsx` — Unified wallet connection
- `StepIndicator.tsx` — Progress indicator
- `StatCard.tsx` — Metric display cards

### 2. Backend Services

**Controllers:**

- `authController` — Wallet verification
- `pickupController` — Pickup coordination
- `agentController` — Rider operations
- `productController` — Marketplace logic
- `adminController` — Admin functions

**Services:**

- `authService` — Role management
- `deliveryService` — Rider matching
- `pickupService` — Pickup creation
- `hederaFileService` — File uploads
- `notificationService` — Push notifications

### 3. Smart Contracts

**PicknGet.sol:**

```solidity
// User Management
registerUser(address, name, phone, homeAddress, profilePic)
recycleItem(type, weight, description, imageData)
payUser(userId, itemId) → Transfer HBAR reward

// Rider Management
riderApplication(name, phone, vehicle, docs...)
approveRider(riderId) → Set status to Approved
confirmItem(riderId, userId, itemId) → Mark pickup done
```

**Product.sol:**

```solidity
// Vendor Management
registerProducer(address, name, country, phone)
addProduct(name, qty, desc, image, amount)

// Marketplace
shopProduct(productId, qty) payable
→ 10% platform fee, 90% to vendor
```

---

## Data Flow Examples

### Example 1: Recycler Registration

```
┌────────────┐
│   User     │
└─────┬──────┘
      │ 1. Connect wallet (MetaMask)
      ▼
┌────────────────┐
│   Frontend     │ 2. Fill form (name, address, phone, photo)
└─────┬──────────┘
      │ 3. Upload photo to Pinata
      ▼
┌────────────────┐
│   Pinata IPFS  │ Returns: File ID "QmXyz..."
└─────┬──────────┘
      │ 4. Call registerUser() with File ID
      ▼
┌────────────────────────┐
│   PicknGet Contract    │ 5. Store user data on-chain
└─────┬──────────────────┘
      │ 6. Emit UserRegistered event
      ▼
┌────────────────┐
│   Backend API  │ 7. Save to MongoDB (txHash, fileId)
└─────┬──────────┘
      │ 8. Return success
      ▼
┌────────────────┐
│   Frontend     │ 9. Redirect to /dashboard
└────────────────┘
```

### Example 2: Recycling Transaction

```
┌────────────┐
│ Recycler   │ 1. Submit item (2.5kg plastic)
└─────┬──────┘
      │
      ▼
┌────────────────┐
│   Frontend     │ 2. Upload photo to Pinata
└─────┬──────────┘
      │ Returns: "QmAbc123..."
      ▼
┌──────────────────────┐
│  PicknGet Contract   │ 3. recycleItem("plastic", 2500, "Bottles", "QmAbc...")
└─────┬────────────────┘
      │ 4. Emit ItemRecycled(userId, itemId, weight)
      ▼
┌────────────────┐
│  Backend API   │ 5. Listen to event → Save to DB
└─────┬──────────┘
      │ 6. Assign rider based on location
      ▼
┌────────────┐
│   Rider    │ 7. Receives pickup notification
└─────┬──────┘
      │ 8. Pickup item, call confirmItem()
      ▼
┌──────────────────────┐
│  PicknGet Contract   │ 9. Update status: Pending → Confirmed
└─────┬────────────────┘
      │ 10. Admin triggers payUser()
      ▼
┌──────────────────────┐
│  PicknGet Contract   │ 11. Calculate: 2.5kg × 0.15 HBAR/kg = 0.375 HBAR
└─────┬────────────────┘    Transfer 37,500,000 tinybars to user
      │
      ▼
┌────────────┐
│ Recycler   │ 12. Receives HBAR in wallet (<5 sec)
└────────────┘
```

### Example 3: Marketplace Purchase

```
┌────────────┐
│  Customer  │ 1. Browse shop, select product
└─────┬──────┘
      │ 2. Click "Buy Now"
      ▼
┌────────────────┐
│   Frontend     │ 3. Fetch product details from backend
└─────┬──────────┘
      │ Price: 5 HBAR, Qty: 1
      ▼
┌─────────────────────┐
│  Product Contract   │ 4. Call shopProduct(productId, 1)
│                     │    with 5 HBAR payment
└─────┬───────────────┘
      │ 5. Split payment:
      │    • 0.5 HBAR → PicknGet contract (10%)
      │    • 4.5 HBAR → Vendor wallet (90%)
      ▼
┌────────────────┐
│  Backend API   │ 6. Record sale in MongoDB
└─────┬──────────┘
      │ 7. Update inventory: qty - 1
      ▼
┌────────────┐
│  Customer  │ 8. Order confirmation + tracking ID
└────────────┘
```

---

## Database Schema

### MongoDB Collections

**users**

```javascript
{
  _id: ObjectId,
  id: Number,              // Contract user ID
  walletAddress: String,
  name: String,
  phoneNumber: String,
  address: String,
  country: String,
  profileImage: String,    // Pinata CID
  roles: [String],         // ["Recycler", "Admin"]
  status: String,          // "Active", "Banned"
  totalRecycled: Number,   // kg
  totalEarnings: Number,   // HBAR
  co2Saved: Number,        // kg
  createdAt: Date,
}
```

**riders**

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
    vehiclePhotos: String,
  },
  createdAt: Date,
}
```

**pickups**

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
    lng: Number,
  },
  itemCategory: String,
  itemWeight: Number,      // kg
  itemDescription: String,
  itemImages: [String],    // Pinata CIDs
  estimatedEarnings: Number,
  pickUpStatus: String,    // "Pending", "InTransit", "PickedUp", "Delivered"
  requestedAt: Date,
  acceptedAt: Date,
  collectedAt: Date,
  deliveredAt: Date,
}
```

**products**

```javascript
{
  _id: ObjectId,
  productId: Number,       // Contract product ID
  walletAddress: String,   // Vendor wallet
  name: String,
  description: String,
  category: String,
  price: Number,           // HBAR
  priceUSD: Number,        // Calculated
  quantity: Number,
  weight: Number,          // kg
  imageFileId: String,     // Hedera File ID
  imageUrl: String,        // HashScan URL
  txHash: String,          // Creation transaction
  status: String,          // "Available", "SoldOut"
  views: Number,
  sales: Number,
  revenue: Number,
  createdAt: Date,
}
```

---

## API Endpoints

### Authentication

```
POST   /api/v1/auth/check-wallet
POST   /api/v1/auth/save-user
POST   /api/v1/users/verify-phone
```

### Riders

```
POST   /api/v1/riders
GET    /api/v1/riders/:riderId
GET    /api/v1/riders/check/:identifier
GET    /api/v1/admin/riders/pending
PATCH  /api/v1/admin/riders/:riderId/approval
```

### Pickups

```
POST   /api/v1/pickups/create
POST   /api/v1/pickups/find-riders
GET    /api/v1/pickups/track/:pickupId
GET    /api/v1/pickups/user/:userId/active
```

### Products

```
POST   /api/v1/products
POST   /api/v1/products/producers
GET    /api/v1/products
GET    /api/v1/products/:productId
GET    /api/v1/products/vendors/:walletAddress/stats
POST   /api/v1/products/:productId/sale
```

---

## Security Architecture

### 1. Authentication

- **Method:** Wallet signature verification
- **No passwords:** Wallet is identity
- **Session:** JWT tokens (optional)
- **Role verification:** Checked on every admin route

### 2. Smart Contract Security

- **Access control:** Modifier-based (onlyAdmin, onlyRider)
- **Reentrancy guards:** Non-reentrant functions
- **Input validation:** Checks on all user inputs
- **Event emissions:** Audit trail for all actions

### 3. Data Protection

- **IPFS:** Immutable document storage
- **MongoDB:** Encrypted at rest
- **API:** HTTPS only, CORS restrictions
- **Rate limiting:** 100 req/min per IP

### 4. Secrets Management

- **Environment variables:** Never commit
- **Hardware wallets:** For admin operations
- **Key rotation:** Periodic updates

---

**For implementation details, see individual README files in `frontend/` and `backend/` directories.**
