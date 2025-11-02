# ♻️ Pick-n-Get — Decentralized Recycling & Sustainable Marketplace

<div align="center">

**Empowering communities to recycle waste, earn rewards, and trade eco-friendly products through Hedera Hashgraph**

[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-00AEEF?style=for-the-badge&logo=hedera&logoColor=white)](https://hedera.com)
[![License](https://img.shields.io/badge/License-UNLICENSED-red?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)]()

[🎬 Watch Demo](https://pick-n-get-fe.vercel.app/) • [📄 Documentation](./ARCHITECTURE.md) • [🚀 Quick Start](#-quick-start-10-minutes)

</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Pitch Deck & Certifications](#-pitch-deck--certifications)
- [Team](#-team)
- [Hedera Integration Summary](#-hedera-integration-summary)
- [Quick Start (10 Minutes)](#-quick-start-10-minutes)
- [Architecture Overview](#-architecture-overview)
- [Deployed Hedera IDs](#-deployed-hedera-ids-testnet)
- [Repository Structure](#-repository-structure)
- [Key Features](#-key-features)
- [Future Roadmap](#-future-roadmap)
- [Security & Best Practices](#-security--best-practices)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

**Pick-n-Get** is a comprehensive decentralized platform built on **Hedera Hashgraph** that revolutionizes waste management by combining:

1. **♻️ Recycling Rewards System** - Users earn HBAR for verified recycling activities
2. **🏪 Sustainable Marketplace** - Vendors sell eco-friendly products made from recycled materials
3. **🚚 Delivery Network** - Verified riders collect recyclables and deliver products
4. **👥 Community Governance** - Transparent, blockchain-verified operations

**Track:** Hedera Hackathon 2025  
**Category:** Sustainability & Environmental Impact

---

## 🎬 Pitch Deck & Certifications

### 📊 Presentation

[**View Our Pitch Deck**](https://www.canva.com/design/DAG3RD8BBFA/qTiX85EvlfT2TE-ARtXpmQ/edit?utm_content=DAG3RD8BBFA&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton)

### 🎓 Team Certifications

Our team consists of **Hedera Certified Developers**:

| Team Member          | Certification                                                                               | LinkedIn                                                    | GitHub / X                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ---------------------------------------- |
| **Matthew Idungafa** | [Hedera Developer](https://certs.hashgraphdev.com/7e9701d5-37ee-4ec0-979b-81f895586fe6.pdf) | [LinkedIn](https://www.linkedin.com/in/matthew-idungafa/)   | [@kemsguy7](https://github.com/kemsguy7) |
| **Joy Aruku**        | [Hedera Developer](https://certs.hashgraphdev.com/353ac361-2257-4165-839e-18ed4d9f07fe.pdf) | [LinkedIn](https://www.linkedin.com/in/joy-aruku-a23361195) | [@Dev-JoyA](https://github.com/Dev-JoyA) |
| **Nkiru Medaleine**  | Team Member                                                                                 | [LinkedIn](#)                                               | [GitHub/X](#)                            |

---

## 🌐 Hedera Integration Summary

### Why Hedera Hashgraph?

Pick-n-Get chose Hedera Hashgraph as its foundational blockchain infrastructure for three critical reasons that directly support our mission to incentivize recycling in African communities:

#### 1. **Predictable, Low-Cost Transactions**

**Economic Justification:** With fees as low as **$0.0001 per transaction**, Hedera enables sustainable micro-payments for recycling activities. In emerging markets where users might recycle items worth $0.50-$2.00, traditional blockchain gas fees ($0.10-$50) would make the system economically unviable. Hedera's fixed pricing ensures:

- Users receive **99%+ of their recycling rewards**
- Vendors can list products without prohibitive listing fees
- Platform can scale to millions of users without fee inflation

**Impact:** This fee structure is essential for adoption in low-income communities where every cent matters.

#### 2. **High Throughput & Fast Finality (3-5 seconds)**

**Economic Justification:** Hedera's 10,000+ TPS and sub-5-second finality enable:

- **Instant reward confirmation** for recyclers (critical for trust in cash-strapped communities)
- **Real-time marketplace transactions** without frustrating delays
- **Scalability** to handle peak recycling volumes (e.g., collection drives, weekend markets)

**Example Use Case:** When a rider confirms pickup of 50kg of plastic bottles, the recycler sees their HBAR reward **within 5 seconds** — fast enough to feel like traditional payment systems, but with blockchain transparency.

#### 3. **Energy Efficiency & Environmental Alignment**

**Mission Alignment:** As a **carbon-negative** network, Hedera aligns perfectly with our environmental mission:

- **0.00017 kWh per transaction** (vs. Bitcoin's ~700 kWh)
- Offset by renewable energy purchases
- Demonstrates authentic commitment to sustainability (not greenwashing)

**Marketing Impact:** Users trust a recycling platform that doesn't contribute to carbon emissions.

---

### 🔗 Hedera Services Used

#### **1. Hedera File Service (HFS) — Decentralized Document Storage**

**Purpose:** Secure, immutable storage for user-uploaded images and documents.

**Transaction Types Used:**

- `FileCreateTransaction` — Create new file with initial content
- `FileAppendTransaction` — Append data to files >4KB

**Use Cases:**

- Rider verification documents (driver's license, vehicle registration, insurance certificates)
- Product images for marketplace listings
- User profile pictures
- Recycling item photos (proof of recyclables)

**Economic Benefit:**

- **Cost:** ~$0.05 per file upload (one-time fee)
- **Comparison:** IPFS pinning services cost $0.10/month, AWS S3 costs $0.023/GB/month
- **Annual Savings:** For 10,000 users, saves ~$12,000/year in storage costs

**Transaction Frequency:** ~50-100 file uploads per day during active onboarding

---

#### **2. Hedera Smart Contract Service (HSCS) — Core Business Logic**

**Purpose:** Execute decentralized business logic for recycling, rewards, and marketplace operations.

**Deployed Contracts:**
| Contract | Address | Purpose |
|----------|---------|---------|
| **PicknGet.sol** | `0.0.7162853` | User registration, recycling submissions, rider management, reward distribution |
| **Product.sol** | `0.0.7165733` | Vendor registration, product listings, marketplace transactions |

**Key Transaction Types:**

**User & Rider Management:**

- `registerUser()` — Register recycler with profile data
  - Gas Limit: 300,000
  - Frequency: ~20-50/day
- `riderApplication()` — Submit rider application with document CIDs
  - Gas Limit: 500,000
  - Frequency: ~5-10/day
- `approveRider()` — Admin approves rider after KYC
  - Gas Limit: 200,000
  - Frequency: ~3-5/day

**Recycling Operations:**

- `recycleItem(type, weight, description, imageData)` — Submit recyclable item
  - Gas Limit: 400,000
  - Parameters: type (string), weight (uint256 grams), description (string), imageData (bytes)
  - Frequency: ~100-200/day at scale
- `confirmItem(riderId, userId, itemId)` — Rider confirms item pickup
  - Gas Limit: 250,000
  - Frequency: Matches recycleItem frequency
- `payUser(userId, itemId)` — Admin releases HBAR reward
  - Gas Limit: 300,000
  - Payment Formula: `weight (kg) × rate (HBAR/kg) × 10^8`
  - Example: 5kg plastic × 0.25 HBAR/kg = 1.25 HBAR (125,000,000 tinybars)
  - Frequency: ~100-200/day

**Marketplace Operations:**

- `registerProducer()` — Register vendor
  - Gas Limit: 300,000
  - Frequency: ~10-15/day
- `addProduct()` — List product for sale
  - Gas Limit: 500,000
  - Frequency: ~30-50/day
- `shopProduct(productId, quantity)` — Purchase product
  - Gas Limit: 500,000
  - Payment Split: 10% platform fee, 90% to vendor
  - Frequency: ~20-40/day

**Economic Justification:**

- **Total Daily Transactions:** ~400-600
- **Daily Network Fees:** ~$0.04-$0.06 (at $0.0001/tx)
- **Monthly Network Fees:** ~$1.20-$1.80
- **Annual Network Fees:** ~$15-$22

**Comparison:** Running similar operations on Ethereum would cost **$20,000-$50,000/year** in gas fees, making the platform economically infeasible for micro-transactions.

---

#### **3. HBAR Native Payments — Cryptocurrency Rewards**

**Purpose:** Instant, low-cost cryptocurrency rewards for recycling activities.

**Payment Flow:**

```
User recycles 2.5kg of plastic
↓
Rider confirms pickup
↓
Admin triggers payUser()
↓
Smart contract calculates: 2.5kg × 0.15 HBAR/kg = 0.375 HBAR
↓
Contract transfers 37,500,000 tinybars to user's wallet
↓
User sees payment in <5 seconds (Hedera finality)
```

**Rate Table (Admin-configurable):**
| Material | Rate (HBAR/kg) | USD Equivalent (at $0.05/HBAR) |
|----------|----------------|--------------------------------|
| Plastic | 0.15 | $0.0075/kg |
| Paper | 0.10 | $0.005/kg |
| Metals | 0.25 | $0.0125/kg |
| Glass | 0.12 | $0.006/kg |
| Electronics | 0.40 | $0.02/kg |

**Economic Impact for Users:**

- **Average recycling haul:** 10kg mixed waste
- **Average earnings:** 1.5-2.0 HBAR (~$0.075-$0.10)
- **Monthly potential:** 30-40 HBAR (~$1.50-$2.00)

**Why This Matters:** In regions where $2/day is median income, an extra $1.50-$2.00/month (5-10% income boost) significantly impacts household economics and drives adoption.

---

### 📊 Transaction Volume Projections

**Phase 1 (Months 1-3):** 100-200 daily transactions  
**Phase 2 (Months 4-12):** 500-1,000 daily transactions  
**Phase 3 (Year 2+):** 5,000-10,000 daily transactions

**Network Load:** Even at 10,000 TPS, Pick-n-Get would utilize <0.1% of Hedera's capacity, ensuring scalability.

---

## 🚀 Quick Start (10 Minutes)

### Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org))
- [ ] MongoDB running (local or [Atlas](https://mongodb.com/cloud/atlas))
- [ ] Hedera Testnet account ([Create account](https://portal.hedera.com))
- [ ] Firebase project ([Console](https://console.firebase.google.com))

### Step 1: Clone Repository (30 seconds)

```bash
git clone https://github.com/kemsguy7/pick-n-get.git
cd pick-n-get
```

### Step 2: Backend Setup (3 minutes)

```bash
cd backend
npm install
cp .env.example .env
```

**Edit `.env` with your credentials:**

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017/pick-n-get

# Hedera
HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY_HERE
HEDERA_NETWORK=testnet

# Super Admin
SUPER_ADMIN_WALLET=0x0000000000000000000000000000000000000000

# Server
PORT=5000
NODE_ENV=development
```

**Start backend:**

```bash
npm run dev
```

✅ **Verify:** Backend running at `http://localhost:5000`

### Step 3: Frontend Setup (3 minutes)

```bash
cd ../frontend
npm install
cp .env.example .env.local
```

**Edit `.env.local`:**

```bash
# Backend
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:5000/api/v1

# Hedera
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=0.0.7162853


# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

**Start frontend:**

```bash
npm run dev
```

✅ **Verify:** Frontend running at `http://localhost:3000`

### Step 4: Test Platform (3 minutes)

1. Open `http://localhost:3000`
2. Connect wallet (MetaMask/HashPack on Hedera testnet)
3. Register as recycler at `/auth/signup/recycler`
4. Submit recyclable item at `/recycle`
5. View transaction on [HashScan](https://hashscan.io/testnet)

🎉 **Success!** You've submitted a blockchain transaction.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
│  Next.js 15 + React 19 + TypeScript + TailwindCSS              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WALLET INTERFACE                            │
│   MetaMask + WalletConnect Integration                          │
└───────────────────────┬─────────────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  HEDERA NETWORK  │          │   BACKEND API    │
│  Smart Contracts │◄────────►│   Node.js        │
│  • PicknGet.sol  │          │   Express        │
│  • Product.sol   │          │   MongoDB        │
│  File Service    │          └──────────────────┘
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│               DECENTRALIZED STORAGE (Hedera File Service)       │
└─────────────────────────────────────────────────────────────────┘
```

For detailed architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 🆔 Deployed Hedera IDs (Testnet)

### Smart Contracts

| Contract     | EVM Address                                  | Hedera ID     | HashScan Link                                            |
| ------------ | -------------------------------------------- | ------------- | -------------------------------------------------------- |
| **PicknGet** | `0x2Caa291ceDF1c2b8AAA9053B1d3C496E3A5CF83A` | `0.0.7162853` | [View](https://hashscan.io/testnet/contract/0.0.7162853) |
| **Product**  | `0x0F55d8eb68A24cB091Fe72030c43479961a2dB32` | `0.0.7165733` | [View](https://hashscan.io/testnet/contract/0.0.7165733) |

### Contract ABIs

- [PicknGet ABI](https://hashscan.io/testnet/contract/0.0.7162853/abi)
- [Product ABI](https://hashscan.io/testnet/contract/0.0.7165733/abi)

---

## 📂 Repository Structure

```
pick-n-get/
├── README.md                 # This file
├── ARCHITECTURE.md           # Detailed architecture
│
├── frontend/                 # Next.js app
│   ├── app/                  # Pages and components
│   ├── services/             # Blockchain services
│   └── README.md             # Frontend setup
│
├── backend/                  # Express API
│   ├── src/                  # Source code
│   └── README.md             # Backend setup
│
└── contracts/                # Solidity contracts
    ├── contracts/            # Smart contracts
    ├── scripts/              # Deployment
    └── README.md             # Contract docs
```

---

## ✨ Key Features

### For Recyclers

✅ Wallet-based registration  
✅ Item submission with photos  
✅ Instant HBAR rewards  
✅ Real-time tracking  
✅ Marketplace access

### For Riders

✅ KYC with documents Uploaded to Hedera file system  
✅ Vehicle management  
✅ Smart routing  
✅ Earnings tracking

### For Vendors

✅ Product listings on blockchain  
✅ Instant HBAR payments (90%)  
✅ Inventory management  
✅ Sales analytics

### For Admins

✅ Rider approval system  
✅ Rate management  
✅ User monitoring  
✅ Payment oversight

---

## 🔮 Future Roadmap

### Phase 1 (Q2 2025): DeFi Integration

- ERC-20 reward token (PICK)
- DEX integration (SaucerSwap)
- HBAR ↔ PICK swaps
- Fiat on/off ramps (Transak)
- Staking rewards (12-18% APY)

### Phase 2 (Q3 2025): Carbon Credit System

- CO2 offset tracking
- Carbon NFTs (1 NFT = 1kg CO2)
- Corporate partnerships
- Third-party verification

### Phase 3 (Q4 2025): Global Expansion

- Multi-chain bridges
- Mobile apps (iOS/Android)
- AI-powered routing
- Local governance DAOs

---

## 🔐 Security & Best Practices

### Code Quality

✅ ESLint + Prettier  
✅ TypeScript everywhere  
✅ Unit tests  
✅ Pre-commit hooks

### Smart Contract Security

✅ Role-based access control  
✅ Reentrancy guards  
✅ Input validation  
✅ Event logging

### Secret Management

⚠️ **NEVER commit `.env` files**  
✅ Use `.env.example` templates  
✅ Store secrets in environment variables  
✅ Use hardware wallets for admin ops

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/name`
3. Make changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add feature'`
6. Push: `git push origin feature/name`
7. Open Pull Request

---

## 📄 License

**UNLICENSED** — Research and hackathon purposes only.

For enterprise licensing: support@pick-n-get.io

---

## 📞 Support & Contact

### Maintainers

- **Matthew Idungafa** (Project Lead) - [@kemsguy7](https://github.com/kemsguy7)
- **Joy Aruku** (Backend Lead) - [@Dev-JoyA](https://github.com/Dev-JoyA)
- **Nkiru Medaleine** (Design Lead) - [@nkirumedaleine](https://www.linkedin.com/in/anagha-madeleine/)

### Community

- **GitHub Issues:** [Report bugs](https://github.com/kemsguy7/pick-n-get/issues)
- **Email:** support@pick-n-get.io
- **Website:** [pick-n-get-fe.vercel.app](https://pick-n-get-fe.vercel.app/)

---

<div align="center">

**♻️ Built with sustainability in mind, powered by Hedera, designed for global impact. 🌍**

**Pick-n-Get — Where waste becomes wealth, and everyone wins.**

[⬆ Back to Top](#️-pick-n-get--decentralized-recycling--sustainable-marketplace)

</div>
