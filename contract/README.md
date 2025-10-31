# ♻️ PicknGet — Decentralized Recycling and Reward System (Hedera DLT)
*Empowering communities to recycle waste and earn through decentralized, transparent payments.*

---

## 🔗 Quick Links
- [Overview](#-overview)
- [Smart Contract Architecture](#-smart-contract-architecture)
- [Product Smart Contract](#-product-smart-contract)
- [Deployment](#deployment)


## 📘 Overview

The PicknGet contract combines **three major components**:
- 👥 **User Management** (Register recyclers)
- 🧑‍💼 **Admin Oversight** (Approve riders, confirm recyclables, set payment rates)
- 🏍️ **Rider Network** (Collect recyclables and confirm item deliveries)

This creates a transparent, traceable, and tokenized ecosystem for **waste recycling and payment automation**.

---
### Core Features Summary

| Feature | Description |
|----------|--------------|
| ♻️ Recycling Rewards | Users earn HBAR for verified recycling actions |
| 🧑‍💼 Admin Oversight | Admins set rates, verify riders, and approve payouts |
| 🏍️ Rider Network | Riders confirm item pickup and delivery |
| 🪙 Instant Payments | Automatic payment via smart contract (HBAR tinybars) |
| 🧱 Secure Access Control | Role-based system (User, Rider, Admin, SuperAdmin) |


## 🧩 Smart Contract Architecture

| Contract | Description |
|-----------|-------------|
| **PicknGet.sol** | Core recycling logic: users, riders, admins, payments |
| **Admin.sol** | Manages admin roles, payment rates, and funding |
| **User.sol** | Handles recycler data and registration |
| **Product.sol** | Marketplace for recycled goods — direct sale between producer and buyer |
| **ItemLib.sol** | Enum definitions and category mappings |
| **Library** | Utility functions used across contracts |


---

## 🧱 Roles & Permissions

| Role | Description | Key Actions |
|------|--------------|-------------|
| **SUPER_ADMIN** | System root admin | Appoints Admins |
| **Admin** | Oversees rates, verifies riders, confirms payments | `approveRider`, `setRate`, `payUser` |
| **Rider** | Collects and confirms recycled items | `confirmItem` |
| **Recycler (User)** | Recycles items for HBAR rewards | `recycleItem` |

---

> ⚠️ **Note:**  
> Only the `SuperAdmin` can register new Admins in the production environment.  
> However, for testing purposes, this restriction has been temporarily commented out —allowing Admins to self-register.  
> This line can be reactivated to enforce strict hierarchy in deployment.


---

## 💰 Payment Computation Logic

The Hedera HBAR has **8 decimals**, meaning:  
> 1 HBAR = 100,000,000 tinybars

The contract ensures high precision by multiplying payments with `10 ** DECIMALS`, where `DECIMALS = 8`.

All payments are made in **HBAR** (the native currency of Hedera).  
Each recyclable item type (e.g., plastic, paper, metals) has an **admin-set rate**.
All rates and payments are calculated using 8-decimal precision (DECIMALS = 8) to match HBAR’s smallest denomination — tinybar.

The contract expects all payments and rates in **HBAR** (native Hedera currency), but internally it handles transfers in **tinybars** (1 HBAR = 10⁸ tinybars).


### 💰 Formula:
Payment = ItemWeight × ItemRate × (10 ** 8)

Where:
- `ItemWeight`: Weight of the recycled item (in kilograms)
- `ItemRate`: Reward rate per kilogram set by the admin
- `DECIMALS`: 8 (to simulate fractional HBAR units)

### 🧮 Example:

If a user recycles **2.5 kg of plastic**, and the **rate** for `PLASTIC` = `0.15 HBAR/kg`:

amount = 2.5 × 0.15 = 0.375 HBAR
actualTransfer = 0.375 × (10 ** 8) tinybars


This is transferred to the recycler’s wallet upon confirmation.

---

### 🧮 Example Breakdown

Let’s assume the **Admin sets the rate** for **PLASTIC** at `0.25 HBAR/kg`.  

If a user recycles **4 kg** of plastic:

Payment (in HBAR) = 4 × 0.25 = 1.00 HBAR

Then, converted to **tinybars**:
1.00 HBAR × (10 ** 8) = 100,000,000 tinybars

Thus, the user receives `100,000,000 tinybars`, which equals **1 HBAR**.

---

## 🔄 Full Payment Flow Diagram

Below is a step-by-step illustration of how **value and verification flow** from recycling to payout:

    ┌─────────────────────────────┐
    │         RECYCLER            │
    │ (User registers & recycles) │
    └─────────────┬───────────────┘
                  │
                  │ recycleItem()
                  ▼
    ┌─────────────────────────────┐
    │          BLOCKCHAIN          │
    │  - Stores item data          │
    │  - Status = Pending          │
    └─────────────┬───────────────┘
                  │
                  │ confirmItem(riderId, userId, itemId)
                  ▼
    ┌─────────────────────────────┐
    │            RIDER             │
    │  - Confirms pickup           │
    │  - Verifies material type    │
    └─────────────┬───────────────┘
                  │
                  │ Admin verifies
                  ▼
    ┌─────────────────────────────┐
    │            ADMIN             │
    │  - Sets item rate (HBAR/kg) │
    │  - Approves payment         │
    │  - Calls payUser()          │
    └─────────────┬───────────────┘
                  │
                  │ payUser() ➜ HBAR transfer
                  ▼
    ┌─────────────────────────────┐
    │         RECYCLER WALLET     │
    │   Receives: weight × rate × (10 ** 8) tinybars │
    │   Example: 4 kg × 0.25 × 10⁸ = 100,000,000 tinybars │
    └─────────────────────────────┘

---

## 🪙 Payment Rules

| Rule | Description |
|-------|-------------|
| ✅ **Only confirmed items** can be paid |
| 🚫 **Double payments** are blocked by `hasUserReceivedPayment` mapping |
| 🧮 **Precision** is ensured using 8 decimals (tinybars) |
| 🏦 **Contract must be funded** with enough HBAR for payments |
| ⚠️ **Admins only** can trigger `payUser()` |
| 🔒 **Payments revert** if user or item is invalid, unconfirmed, or already paid |

---

## 🌍 Built on: **Hedera DLT**

Unlike traditional Ethereum smart contracts, this project runs on the **Hedera Hashgraph** —  
a **fast, fair, and eco-friendly distributed ledger** with:
- ⚡ **Fast consensus finality** (~3–5 seconds) 
- High throughput  
- ✅ **Low fees** (fractions of a cent per transaction) 
- 🔐 **Secure Solidity smart contracts**
- 🪙 **HBAR-based payments** with 8 decimal precision (tinybars)

---

## 📦 Contract Status

| Status | Meaning |
|:------:|----------|
| 🟢 **Active** | Deployed and operational on Hedera testnet |
| 🧱 **Upgradeable** | New item types and rate models can be added |
| 🔒 **Secure** | Access control via role-based mappings (Recycler, Rider, Admin) |

---

## 🧠 Key Technical Points

| Topic | Explanation |
|--------|-------------|
| **Precision Handling** | Payments handled in tinybars (10⁸ units = 1 HBAR) |
| **Safety** | Double-spend prevention via state tracking |
| **Role Enforcement** | Separate mappings for `Admin`, `Rider`, `Recycler` |
| **Fund Management** | Admins can view balance but cannot withdraw arbitrarily |
| **Payment Validation** | Each payment triggers a `.call{value: amount * (10**8)}` transfer |
| **SuperAdmin Privilege** | Only the SuperAdmin can register or remove Admins (commented out for testing) |


---
## 🌍 Product Smart Contract

### 🧾 A decentralized marketplace for transparent and direct product sales between producers and buyers.

---

## 💡 What It Does

The **Product Smart Contract** is a dlt system that allows **producers** to register their business, **add products**, and **sell them directly** to buyers — **without middlemen**.

Every product, payment, and ownership record is stored securely on the blockchain, ensuring **trust, transparency, and traceability**.

---

## 🧱 How It Works

| Step | Description |
|------|--------------|
| 🧍‍♂️ **1. Register as a Producer** | A producer/product-owner registers with their name, country, and phone number. |
| 📦 **2. Add Products** | Once registered, the producer can list products for sale with a name, description, quantity, and price. |
| 💳 **3. Buyers Purchase** | Buyers can browse and buy available products by sending the exact payment in cryptocurrency (HBAR). |
| 💰 **4. Automatic Payment** | Once the buyer pays, the smart contract transfers 10% to the Picknget contract and transfer the balance directly to the producer instantly and securely. |
| 🔒 **5. Transparency Ensured** | Every transaction and product update (e.g., sold out) is recorded publicly on the blockchain. |

---

## 🚀 Why It Matters

### 🌐 **No Middlemen**
Producers sell directly to consumers reducing costs and increasing profit margins.

### 🔍 **Trust Through Transparency**
All transactions and product details are permanently stored on the blockchain, eliminating fraud or hidden changes.

### 💸 **Instant Payments**
Producers receive payments instantly after each purchase, with no third-party delays or processing fees.

### 📊 **Proven Authenticity**
Buyers can verify a product’s origin and owner before making a purchase.

---

## 🧩 Main Features

✅ **Producer Registration**  
Each producer must register before listing any product ensuring verified sellers.

✅ **Product Management**  
Producers can create and track their own product listings.

✅ **Automated Sales & Payment**  
The smart contract handles payment verification and transfers funds automatically.

✅ **Stock Tracking**  
When a product’s quantity hits zero, it is automatically marked as *Not Available*.

✅ **Blockchain Security**  
All records (registrations, listings, purchases) are transparent and tamper-proof.

---

## 🧠 Example Scenario

### 🎯 1. Producer Registration
Joy, a honey producer, registers her details on the blockchain:

```solidity
registerProductOwner(
    0xAbC123...,  *Wallet Address gotten from contract interaction*
    "Joy Aruku",
    "Nigeria",
    8123456789
);
```

### 2. Add Product

Joy adds her product “Recyled Gym Mat”:
```solidity
addProducts(
    "Recyled Gym Mat",
    50, *quantity*
    "Gym mat from Nigeria made from recycled textiles",
    "0x1234...",   *product image hash*
    0.01 hbar
);

```
✅ The product is now live for buyers to purchase.

### 🛒 3. Buyer Makes a Purchase

A customer buys 2 pieces of “Gym Mat”:
```solidity
shopProduct(
    1, *producer id*
    2 *quantity*
    ) payable
```
✅ The hbar cost of the item is removed from the buyer's account, 10% goes to the main contract *picknget* and the balance is automatically transferred to Joy’s wallet.
✅ The product’s stock is reduced by 2.
✅ If it sells out, it’s automatically marked as Not Available.

## 📦 Product Status

| Status | Meaning |
|--------|----------|
| 🟢 **Available** | Product is in stock and can be purchased. |
| 🔴 **NotAvailable** | Product is sold out or unavailable. |

---

## 🔐 Built-In Protections

- ❌ Prevents duplicate producer registrations  
- 🚫 Disallows unregistered producers from adding products  
- 💵 Rejects incorrect payment amounts  
- 🔁 Blocks repeated payment for the same product  
- 🧮 Automatically manages stock levels  
- **Fail-Safe Transfers** — Unintended transfers are automatically forwarded to PicknGet

---


## 🧰 Technical Summary

| Item | Description |
|------|--------------|
| **Language** | Solidity |
| **Compiler Version** | ^0.8.28 |
| **License** | UNLICENSED |
| **Distributed Ledger** | HEDERA|
| **Payment** | HBAR |
| **Data Storage** | On-chain mappings (no off-chain dependency) |

---

## 🔐 Built-In Protections

| Protection | Description |
|-------------|--------------|
| ❌ **Duplicate prevention** | Users and riders can’t re-register multiple times |
| 🚫 **Role restriction** | Admin-only actions are validated on-chain |
| 🧾 **Verified payments** | Payments triggered only after confirmation |
| 🔁 **Double-spend prevention** | Each recycle ID can only receive one payment |
| 💰 **HBAR accounting** | Payments are multiplied by `(10 ** 8)` for precision |


## 📜 Event Logs

Every major action emits an event for transparency:

| Event | Description |
|--------|--------------|
| `ItemRecycled(address user, uint itemId, string itemType, uint weight)` | Triggered when a user recycles an item |
| `PaidForRecycledItem(address user, uint userId, uint itemId, ItemType type)` | Logs payments after successful transfer |
| `RiderApproved(uint riderId, string name, string number, string vehicleNumber, bytes image, string country, VehicleType type)` | Logs rider approvals |
| `ProductAdded(uint id, address owner)` | Emitted whenever a producer successfully adds a new product|

---


## 🧾 Example Scenario

Let’s walk through a **realistic transaction**:

1. 👤 **User** registers and calls:
   ```solidity
   recycleItem("plastic", 3, "PET bottles", imageData);
   ```
→ Emits ItemRecycled() event.

2. 🏍️ **Rider** collects and confirms:

confirmItem(1, 2, 5);


→ Item status changes to Confirmed.

3. 🧑‍💼 **Admin** sets rate:

setRate(ItemLib.ItemType.PLASTIC, 0.25 ether); // 0.25 HBAR per kg


4. 💸 **Admin** pays user:

payUser(2, 5);


→ Contract transfers: 3 × 0.25 × (10**8) tinybars = 75,000,000 tinybars = 0.75 HBAR

---

## 🌿 Environmental Impact

PicknGet enables:

🌍 Circular economy participation

💚 Reward-driven recycling

🪙 Crypto inclusion for eco-conscious communities

🔮 Future Upgrades
Feature	Description
🌐 IPFS Integration	Store images off-chain for reduced gas
🪙 Reward Token	Introduce a wrapped ERC20-like token for internal trade
🏛 DAO Governance	Allow community-based rate voting
📱 Mobile Wallet Integration	For real-time user payments
🔄 Oracle Feed	Fetch dynamic recycling rates from global markets
⚖️ License

UNLICENSED — intended for research and hackathon purposes.
Contact the maintainers for enterprise licensing or collaborations.

♻️ Building a greener world, powered by decentralization and Hedera DLT.


---

## 🧾 Core Functions

| Function | Description |
|-----------|--------------|
| `registerUser(address, number, name, picture)` | Registers a new recycler |
| `registerAdmin(address)` | Creates an admin account |
| `riderApplication(...)` | Allows riders to apply for collection approval |
| `approveRider(uint256 id)` | Admin approves a rider |
| `recycleItem(type, weight, description, image)` | Adds a recyclable item |
| `confirmItem(riderId, userId, itemId)` | Rider confirms item delivery |
| `payUser(userId, itemId)` | Admin releases payment after confirmation |
| `setRate(ItemType, rate)` | Sets reward per item type |
| `fundContract()` | Allows anyone to fund the pool (in HBAR) |
| `contractBalance()` | Returns contract HBAR balance |

---

## 🌿 Item Categories

Defined in `ItemLib.sol`:

| ItemType | Description |
|-----------|--------------|
| `PAPER` | Newspapers, office paper, cardboard |
| `PLASTIC` | Bottles, containers, synthetic wraps |
| `METALS` | Cans, scrap metal, aluminum |
| `GLASS` | Bottles, jars |
| `ELECTRONICS` | Phones, gadgets, batteries |
| `TEXTILES` | Clothes, fabrics |
| `OTHERS` | Miscellaneous recyclables |

---

## 💬 Events

| Event | Description |
|--------|-------------|
| `ItemRecycled(address user, uint itemId, string itemType, uint weight)` | Triggered when user recycles an item |
| `PaidForRecycledItem(address user, uint userId, uint itemId, ItemType type)` | Logs successful payments |
| `RiderApproved(uint riderId, string name, string number, string vehicleNumber, bytes image, string country, VehicleType type)` | Broadcasts rider approval |

---

## 🚚 Rider Network Overview

| Stage | Description |
|--------|--------------|
| 📝 **Application** | Riders submit name, vehicle info, country, capacity, etc. |
| 🕵️ **Admin Review** | Admins approve/reject applications |
| 🟢 **Active Rider** | Can confirm recyclable collections |
| 🚫 **Banned Riders** | Cannot interact with users or items |

---

## 🧰 Technical Summary

| Parameter | Description |
|------------|--------------|
| **Language** | Solidity |
| **Compiler Version** | ^0.8.28 |
| **License** | UNLICENSED |
| **Ledger** | Hedera DLT (HBAR Payments) |
| **Payment Unit** | 1 HBAR = 10⁸ tinybars |
| **Precision** | 8 decimals |
| **Storage** | On-chain mappings (no off-chain dependency) |

---

## 🌍 Real-World Use Cases

| Industry | Example |
|-----------|----------|
| 🏘️ **Municipal Recycling** | Local councils rewarding verified recyclers |
| 🏫 **Schools** | Students earning credits for eco-friendly actions |
| 🏭 **Industrial Waste** | Factories tracking and paying for recycled materials |
| 🚛 **Logistics** | Certified riders managing waste pickup and delivery |

---

## ✨ Summary

PicknGet transforms the **recycling economy** through **decentralized automation**.  
By leveraging **Hedera’s DLT**, it ensures:
- Transparent payment distribution  
- Immutable record-keeping  
- Efficient community-led recycling incentives  

> ♻️ *Empowering sustainability — one recycled item at a time.*

---

## 📜 License

**UNLICENSED** — intended for research, demonstration, and hackathon use.  
Contact maintainers for enterprise licensing or collaboration.

## 🧱 Tech Stack

- **Smart Contracts:** Solidity (^0.8.28)
- **DLT:** Hedera Hashgraph
- **Language:** JavaScript (for deployment scripts)
- **Framework:** Hardhat
- **Storage:** On-chain mappings
- **Currency:** HBAR (8 decimals — tinybars)


## 🚀 Deployment & Installation

Follow these steps to deploy the **PicknGet** and **Product** smart contracts to the Hedera Testnet:

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-repo-url>.git
   cd picknget
    ```
2. **Create an environment file**
In the root directory, create a .env file and add your private key:
    ```bash
    PRIVATE_KEY="your_private_key_here"
    ```
3. **Deploy the contracts**
Run the deployment script to deploy both the PicknGet and Product contracts: 
    - for Pick-n-get Contract
```bash
npx hardhat run scripts/deploy.ts --network testnet
```
    - for Product Contract
```bash
npx hardhat run scripts/deployProduct.ts --network testnet
```

4. **Verify your deployment**
Once deployment is complete, copy the contract address displayed in the console and verify it on Hashscan. 



## command to get the metadata
```shell
solc --bin --abi --metadata -o ./build ./contracts/PicknGet.sol ./contracts/Admin.sol ./contracts/Product.sol ./contracts/User.sol ./contracts/library/ItemLib.sol
```

## command to get the metadata for stack too deep error
```shell
solc --bin --abi --metadata --overwrite --via-ir -o ./build ./contracts/PicknGet.sol ./contracts/Admin.sol ./contracts/Product.sol ./contracts/User.sol ./contracts/library/ItemLib.sol

```

###  🧱 Deployment Details

| Contract | Address | Network | Explorer | ABI |
|-----------|----------|----------|-----------|-----|
| **PicknGet** | `0x2Caa291ceDF1c2b8AAA9053B1d3C496E3A5CF83A` | Hedera Testnet | [View on HashScan](https://hashscan.io/testnet/address/0x2Caa291ceDF1c2b8AAA9053B1d3C496E3A5CF83A) | [ABI Link](https://hashscan.io/testnet/contract/0.0.7162853/abi) |
| **Product** | `0x0F55d8eb68A24cB091Fe72030c43479961a2dB32` | Hedera Testnet | [View on HashScan](https://hashscan.io/testnet/address/0x0F55d8eb68A24cB091Fe72030c43479961a2dB32) | [ABI Link](https://hashscan.io/testnet/contract/0.0.7165733/abi) |


