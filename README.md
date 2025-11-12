**Pick-n-Get Web Application for Decentralized Recycling Platform**

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Hedera Testnet wallet (MetaMask or HashPack)
- Pinata API keys
- Firebase project
- **Backend server running** (Required)

### ⚠️ IMPORTANT: Backend Setup Required

**You MUST have the backend running before starting the frontend application.**

```bash
# Clone and start the backend first
git clone https://github.com/Dev-JoyA/pick-n-get-be
cd pick-n-get-be
# Follow backend setup instructions in that repository
npm install
npm start
```

The backend should be running on `http://localhost:5000` before you proceed with the frontend.

### Frontend Installation

```bash
# After backend is running, install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Start development server
npm run dev
```

**Access:** `http://localhost:3000`

---

## ⚙️ Environment Configuration

Create `.env.local` with the following:

```bash
# Backend API (ensure this matches your running backend)
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1

# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.7162853



# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Google Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
MAP_ID=your_map_id

# Mapbox (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

---

## 📂 Project Structure

```
app/
├── auth/                    # Authentication flows
│   ├── login/              # Login page
│   └── signup/
│       ├── agent/          # Rider registration (4 steps)
│       │   ├── page.tsx           # Step 1: Connect wallet
│       │   ├── personal-info/     # Step 2: Personal details
│       │   ├── vehicle/           # Step 3: Vehicle details
│       │   └── documents/         # Step 4: Upload documents
│       ├── recycler/       # Recycler registration
│       ├── vendor/         # Vendor registration
│       ├── security/       # Security/verification step
│       └── success/        # Registration success page
│
├── dashboard/              # Recycler dashboard
├── recycle/                # Recycling submission flow
├── shop/                   # Marketplace
│   ├── [id]/              # Product details
│   └── page.tsx           # Shop listing
├── tracking/               # Delivery tracking
├── admin/                  # Admin panel
│   ├── approvals/         # Rider approvals
│   └── users/             # User management
├── vendors/                # Vendor dashboard
│   └── add-product/       # Product creation
├── agents/                 # Rider/Agent dashboard
│
├── components/             # Reusable components
│   ├── layout/            # AppLayout, Header, Footer
│   ├── wallet/            # Wallet connection
│   ├── recycle/           # Recycling components
│   ├── shop/              # Shop components
│   └── ui/                # UI components
│
├── services/               # Blockchain services
│   ├── userService.ts     # User registration
│   ├── riderService.ts    # Rider registration
│   ├── recycleService.ts  # Recycling submission
│   ├── productService.ts  # Marketplace operations
│   ├── adminService.ts    # Admin functions
│   └── wallets/           # Wallet integrations
│       ├── walletInterface.ts
│       ├── metamaskClient.ts
│       └── walletConnectClient.tsx
│
├── contexts/               # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   ├── MetamaskContext.tsx
│   ├── WalletConnectContext.tsx
│   └── AgentSignupContext.tsx
│
├── apis/                   # API integration
│   ├── backendApi.ts      # Backend REST calls
│   ├── hederaApi.ts       # Hedera SDK
│   ├── ipfsApi.js         # Hedera File Service API
│   └── paymentApi.ts      # Payment processing
│
├── config/                 # Configuration
│   ├── constants.ts       # App constants
│   ├── networks.ts        # Network configs
│   └── type.ts            # TypeScript types
│
└── types/                  # Type definitions
```

---

## 🔑 Key Features & User Roles

### User Role System

**Important Role Rules:**

- **Users must sign up before accessing any dashboard**
- **A user CANNOT be both a Recycler and an Agent/Rider**
- **A user CAN be a Vendor AND (Recycler OR Agent)**
- **Admin access requires blockchain registration**

### Signup Paths

**Recycler:** `/auth/signup/recycler`  
**Agent/Rider:** `/auth/signup/agent` (4-step process)  
**Vendor:** `/auth/signup/vendor`

### Admin Access

To access the admin dashboard, you must register as an admin through the smart contract:

1. Visit [HashScan Contract ABI](https://hashscan.io/testnet/contract/0.0.7162853/abi)
2. Connect your wallet
3. Use the `registerAdmin` function (function #8):
   ```solidity
   function registerAdmin(address _admin)
   ```
4. Pass your wallet address as the `_admin` parameter
5. After successful registration, you can access `/admin` dashboard

Then add your EVM compatible wallet address, private key and Operator ID to the backend .env file

### Wallet Integration

- **MetaMask:** EVM-compatible wallet
- **WalletConnect:** Mobile wallet support
- **Unified API:** Single interface for all wallets

---

## 👥 User Flows

### Recycler Registration

**Path:** `/auth/signup/recycler`

1. Connect wallet
2. Enter personal info (name, address, phone)
3. Upload profile picture (optional)
4. Submit to blockchain
5. Save to backend
6. Access dashboard at `/dashboard`

**After Signup:** Users can submit recycling items, track pickups, and view earnings.

---

### Agent/Rider Registration (4 Steps)

**Path:** `/auth/signup/agent`

**Step 1 - Connect Wallet** (`/auth/signup/agent`)

- Connect MetaMask or WalletConnect

**Step 2 - Personal Info** (`/auth/signup/agent/personal-info`)

- Name, phone number
- Home address
- Country

**Step 3 - Vehicle Details** (`/auth/signup/agent/vehicle`)

- Vehicle type (Bike, Car, Truck, Van)
- Vehicle make/model
- License plate number
- Capacity (kg)

**Step 4 - Documents** (`/auth/signup/agent/documents`)

- Upload driver's license
- Vehicle registration
- Insurance documents
- Vehicle photo
- Profile picture

**After Signup:** Application goes to admin for approval. Once approved, access dashboard at `/agents`.

---

### Vendor Registration

**Path:** `/auth/signup/vendor`

1. Connect wallet
2. Enter business details
3. Upload business documents (optional)
4. Submit to blockchain and backend
5. Access vendor dashboard at `/vendors`

**After Signup:** Vendors can list products, manage inventory, and process orders.

---

### Vendor Product Listing

**Path:** `/vendors/add-product`

1. Connect wallet
2. Fill product details (name, description, category)
3. Upload product image to Hedera File Service
4. Set price (USD → auto-converted to HBAR)
5. Set quantity
6. Submit to blockchain

---

### Recycling Submission Flow

**Path:** `/recycle`

**Step 1 - Select Category**

- Choose material type (Plastic, Metal, Glass, Paper, Electronics, etc.)

**Step 2 - Item Details**

- Weight (kg)
- Description
- Upload photos

**Step 3 - Pickup Schedule**

- Pickup address
- Preferred date and time
- Select available rider

**Step 4 - Confirmation**

- Review all details
- Submit to blockchain
- Rider receives notification

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:turbo        # Start with Turbopack

# Production
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues

# Cleanup
npm run clean            # Remove build artifacts
npm run restart          # Clean + reinstall + dev
```

### Code Style

- **Linting:** ESLint + Prettier
- **TypeScript:** Strict mode enabled
- **Formatting:** Prettier with Tailwind plugin

---

## 🔐 Security Best Practices

### Wallet Security

- Never store private keys in frontend
- Always verify transaction details before signing
- Use hardware wallets for large amounts
- Double-check contract addresses

### API Security

- HTTPS only for production
- Rate limiting on sensitive endpoints
- Input validation before submission
- Sanitize user uploads

### File Uploads

- Validate file types and sizes
- Scan uploads before storing
- Use Hedera file service for immutable storage
- Maximum file size: 10MB recommended

---

## 🐛 Troubleshooting

### Common Issues

**Backend connection fails:**

```bash
# Ensure backend is running on correct port
# Check NEXT_PUBLIC_BACKEND_API_URL in .env.local
# Verify backend is accessible at http://localhost:5000
```

**Wallet won't connect:**

```bash
# Ensure correct network in MetaMask
MetaMask → Settings → Networks → Add Network
Name: Hedera Testnet
RPC: https://testnet.hashio.io/api
Chain ID: 296
Currency: HBAR
```

**Cannot access dashboard:**

- Ensure you've completed signup process
- Check that wallet is connected
- Verify role assignment in contract
- For admin: Ensure `registerAdmin` was called on contract

**Build errors:**

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**TypeScript errors:**

```bash
# Check TypeScript version
npx tsc --version

# Regenerate types
npm run type-check
```

**Role conflicts:**

- A user cannot be both Recycler and Agent
- To switch roles, you must use a different wallet address
- Admin role must be assigned via contract, not through signup

---

## 📦 Dependencies

### Core

- Next.js 15.5.2
- React 19
- TypeScript 5

### Blockchain

- @hashgraph/sdk 2.73.1
- @hashgraph/hedera-wallet-connect 1.5.1
- ethers 5.7.2

### UI

- Tailwind CSS 4.1.12
- lucide-react 0.542.0

### Storage

- pinata 2.5.0
- firebase 12.3.0

### Utilities

- dotenv 17.2.2
- zustand 5.0.8

---

## 🔗 Important Links

- **Backend Repository:** [https://github.com/Dev-JoyA/pick-n-get-be](https://github.com/Dev-JoyA/pick-n-get-be)
- **Smart Contract:** [0.0.7162853](https://hashscan.io/testnet/contract/0.0.7162853)
- **Contract ABI:** [https://hashscan.io/testnet/contract/0.0.7162853/abi](https://hashscan.io/testnet/contract/0.0.7162853/abi)
- **Hedera Testnet:** [https://portal.hedera.com](https://portal.hedera.com)

---

## 📄 License

UNLICENSED — Research and hackathon purposes only.

---

## 📞 Support

- **GitHub Issues:** [Report bugs](https://github.com/kemsguy7/pick-n-get-fe/issues)
- **Email:** support@pick-n-get.io
- **Documentation:** See project wiki for detailed guides

---

**Built with Next.js 15 + Hedera Hashgraph**
