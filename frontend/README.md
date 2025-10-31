```markdown
# EcoCleans - Web3 Recycling & Waste Management Platform

**Turning Waste into Wealth Through Blockchain Technology**

EcoCleans Get is a comprehensive Web3-powered recycling and waste management platform built on U2U Network that transforms how individuals and communities manage waste, earn rewards, and support environmental sustainability. By leveraging blockchain technology and smart contracts, we create a transparent, incentive-driven recycling ecosystem where environmental responsibility meets economic opportunity.

## 🎯 Project Overview

EcoCleans Get empowers users to:

- Recycle waste materials (plastic, iron, nylon, bottles, electronics, paper, etc.)
- Earn cryptocurrency rewards based on waste weight and type
- Access marketplace for eco-friendly products made from recycled materials
- Track environmental impact with transparent blockchain records
- Connect with verified pickup agents for convenient waste collection

Through verified delivery agents, embedded crypto wallets, IPFS document storage, and trackable delivery systems, EcoCleans enables individuals to turn waste into wealth while actively combating pollution and fostering a circular economy.

## 🚀 Key Features

### For Recyclers (Users)

- **Anonymous Registration**: Register with just a wallet connection and basic info
- **Item Submission**: Upload recyclable items with photos, descriptions, and weight
- **Instant Rewards**: Receive ECO tokens or stablecoins upon verification
- **Progress Tracking**: Monitor recycling status from collection to processing
- **EcoShop Marketplace**: Purchase sustainable products made from recycled materials
- **Wallet Integration**: MetaMask and WalletConnect support for seamless transactions
- **Impact Dashboard**: View carbon offset statistics and recycling history

### For Pickup Agents (Riders)

- **Multi-Step Registration**: Complete KYC with document verification via IPFS
- **Vehicle Management**: Register bikes, cars, vans, or trucks with capacity tracking
- **Smart Routing**: Receive pickup requests based on location and vehicle type
- **Earnings Tracking**: Monitor completed deliveries and token earnings
- **Status Management**: Control availability and manage pickup schedules
- **Document Security**: All credentials stored securely on IPFS with CIDs on blockchain

### For Vendors/Producers

- **Product Listings**: Showcase eco-friendly products in the marketplace
- **Inventory Management**: Track stock levels and sales analytics
- **Order Processing**: Manage customer orders and delivery coordination
- **Performance Analytics**: View sales trends and customer feedback

### For Administrators

- **Rider Approval System**: Review and approve/reject agent applications
- **Rate Management**: Set and update recycling rates per material type
- **User Management**: Monitor platform activity and user accounts
- **Analytics Dashboard**: Track platform metrics and recycling volumes
- **Payment Oversight**: Manage contract balance and reward distributions

## 🛠️ Technical Architecture

### Frontend Stack

- Next.js 15.5.2 with React 19 for modern web application
- TypeScript for type-safe development
- Tailwind CSS 4.1 for responsive, utility-first styling
- Lucide React for beautiful iconography

### Blockchain Integration

- U2U Network for smart contract deployment
- Hedera SDK for wallet interactions and transaction handling
- Ethers.js 5.7 for blockchain operations
- Smart Contracts written in Solidity 0.8.28

### Wallet & Authentication

- MetaMask Integration via custom client
- WalletConnect 2.x for mobile wallet support
- Multi-wallet Support with unified interface
- Context-based State Management for wallet connections

### Storage & Data Management

- IPFS (Pinata) for decentralized document storage
- MongoDB for backend data persistence
- Firebase Realtime Database for live location tracking
- Redis for caching and session management

### Backend Services

- Express.js REST API server
- Node.js runtime environment
- TypeScript for backend logic
- Mongoose for MongoDB ODM
- Socket.io for real-time communications

## 📋 Project Structure

### Frontend (/app)
```

app/
├── auth/ # Authentication flows
│ └── signup/
│ ├── agent/ # Rider registration (4 steps)
│ ├── recycler/ # User registration
│ └── success/ # Registration success
├── dashboard/ # User dashboard
├── recycle/ # Recycling flow
├── shop/ # EcoShop marketplace
├── tracking/ # Delivery tracking
├── admin/ # Admin panel
├── components/ # Reusable UI components
│ ├── layout/ # Layout components
│ ├── wallet/ # Wallet connection
│ ├── recycle/ # Recycling components
│ └── shop/ # Shop components
├── services/ # Blockchain services
│ ├── userService.ts
│ ├── riderService.ts
│ ├── recycleService.ts
│ ├── adminService.ts
│ └── wallets/ # Wallet integrations
├── contexts/ # React contexts
├── apis/ # API integrations
└── config/ # Configuration files

```

### Backend (/src)

```

src/
├── controllers/ # Request handlers
│ └── deliveryController.ts
├── services/ # Business logic
│ ├── deliveryService.ts
│ └── notificationService.ts
├── routes/ # API routes
│ └── deliveryRoute.ts
├── interface/ # TypeScript interfaces
│ └── deliveryInterface.ts
├── utils/ # Helper functions
│ └── riderValidation.ts
├── middleware/ # Express middleware
│ └── auth.ts
├── config/ # Configuration
│ ├── db.ts
│ ├── firebase.ts
│ └── messaging.ts
└── swagger/ # API documentation
├── config.ts
└── swagger.yaml

````

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- U2U Network wallet with testnet tokens
- Pinata account for IPFS
- Firebase project for real-time features

### Frontend Installation

```bash
# Clone the repository
git clone <repository-url>
cd hedera-fe

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure environment variables (see below)
# Edit .env.local with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
````

### Backend Installation

```bash
# Navigate to backend directory
cd ecocleans-n-get-be

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables (see below)
# Edit .env with your credentials

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Configuration

### Frontend (.env.local)

```bash
# Transak (Fiat to Crypto)
TRANSAK_API_KEY=your_transak_api_key
TRANSAK_API_SECRET=your_transak_secret

# Backend API
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1

# Blockchain
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.xxxxxxx

# IPFS (Pinata)
IPFS_WRITE_API_KEY=your_pinata_api_key
IPFS_WRITE_API_SECRET=your_pinata_secret
NEXT_PUBLIC_IPFS_WRITE_JWT=your_pinata_jwt
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud

# Google Maps (for agent routing)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
MAP_ID=your_map_id
MAP_ID_NAME=ecocleans
```

### Backend (.env)

```bash
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/ecocleans

# Firebase
DATABASE_URL=https://your-project.firebaseio.com/
APIKEY=your_firebase_api_key
AUTHDOMAIN=your-project.firebaseapp.com
PROJECTID=your-project-id
STORAGEBUCKET=your-project.appspot.com
MESSAGINGSENDERID=your_sender_id
APPID=your_app_id
FIREBASE_SERVICE_ACCOUNT_KEY=your_service_account_email

# Mapbox (for rider routing)
MAPBOX_API_KEY=your_mapbox_api_key

# Security
PRIVATE_KEY=your_encryption_private_key
PUBLIC_KEY=your_encryption_public_key
```

## 📱 User Flows

### Recycler Registration & Usage

1. **Connect Wallet** - MetaMask or WalletConnect
2. **Register Account** - Provide name, address, phone number, optional profile picture
3. **Submit Recyclables** - Upload item photos, select category, enter weight
4. **Schedule Pickup** - Choose pickup agent and time
5. **Track Progress** - Monitor collection and delivery status
6. **Receive Rewards** - Get ECO tokens deposited to wallet
7. **Shop or Swap** - Use tokens in EcoShop or swap for other currencies

### Rider Registration & Operations

1. **Connect Wallet** - Secure wallet connection required
2. **Personal Information** - Enter name, phone, address, country
3. **Vehicle Details** - Vehicle type, make/model, plate number, capacity
4. **Document Upload** - Submit to IPFS:
   - Driver's license
   - Vehicle registration
   - Insurance certificate (optional for bikes)
   - Vehicle photos
   - Profile photo
5. **Blockchain Registration** - All document CIDs stored on-chain
6. **Web2 Sync** - Data synced to backend for admin approval
7. **Admin Approval** - Pending review before activation
8. **Accept Pickups** - Start receiving and completing pickup requests

## 🔗 Smart Contract Functions

### User Operations

- `registerUser()` - Register new recycler with profile
- `recycleItem()` - Submit recyclable item for pickup
- `payUser()` - Receive rewards after confirmation

### Rider Operations

- `riderApplication()` - Submit rider application with documents
- `approveRider()` - Admin approves rider (changes status)
- `banRider()` - Admin bans rider for violations
- `confirmItem()` - Rider confirms pickup completion

### Admin Operations

- `registerAdmin()` - Add new admin
- `setRate()` - Update recycling rates per material
- `fundContract()` - Add funds for reward payments
- `contractBalance()` - Check available reward pool

## 🔐 Security Features

### Blockchain Security

- All transactions signed with user's private key
- Smart contract access control for admin functions
- Rate limiting via nullifiers
- Immutable audit trail on U2U Network

### Document Security

- All sensitive documents stored on IPFS
- Only CIDs (content identifiers) stored on-chain
- Document validation before upload
- Encrypted transmission of files

### Authentication

- Wallet-based authentication (no passwords)
- Multi-factor via wallet confirmation
- Session management with secure tokens
- Role-based access control (User/Rider/Admin)

## 📊 API Documentation

API documentation is available via Swagger UI when running the backend:

```
http://localhost:5000/api-docs
```

### Key Endpoints

#### Rider Management

- `POST /api/v1/riders` - Register new rider
- `GET /api/v1/riders` - Get all riders (admin)
- `GET /api/v1/riders/:riderId` - Get rider by ID
- `GET /api/v1/riders/check/:identifier` - Check registration status
- `PATCH /api/v1/riders/:riderId/approval` - Approve/reject rider

#### Pickup Operations

- `POST /api/v1/pick-ride/:user/:item` - Request pickup
- `POST /api/v1/validate-ride/:rider/:pickupId` - Validate ride
- `POST /api/v1/update-status/:rider/:pickupId` - Update delivery status
- `GET /api/v1/total-ride/:rider` - Get rider's completed pickups

## 🎨 Design System

### Color Palette

- **Primary**: Green (#10B981) - Sustainability, growth
- **Secondary**: Blue (#3B82F6) - Trust, technology
- **Accent**: Yellow (#F59E0B) - Energy, rewards
- **Neutral**: Gray scale for UI elements

### Typography

- **Headings**: Space Grotesk - Modern, geometric
- **Body**: Inter - Clean, readable

### Components

- Glass morphism effects on cards
- Smooth animations and transitions
- Responsive layouts for all screen sizes
- Accessibility-first approach

## 🌍 Environmental Impact

Every recyclable item tracked on the platform contributes to:

- **Carbon Offset Tracking** - Calculate CO2 saved
- **Waste Diverted** - Tons of waste kept from landfills
- **Resources Conserved** - Energy and materials saved
- **Community Impact** - Local environmental improvements

## 🤝 Contributing

We welcome contributions! Here's how you can help:

- **Report Bugs** - Submit issues via GitHub
- **Suggest Features** - Share ideas for improvements
- **Submit PRs** - Fix bugs or add features
- **Improve Docs** - Help others understand the platform
- **Test** - Try new features and provide feedback

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support & Community

- **Documentation**: Check /docs for detailed guides
- **GitHub Issues**: Report bugs or request features
- **Discord**: Join our community (link TBD)
- **Email**: support@ecocleans.io (for technical support)

---

**Built with sustainability in mind, powered by blockchain, designed for global impact.**

**EcoCleans - Where waste becomes wealth, and everyone wins. 🌍♻️💚**

```

```
