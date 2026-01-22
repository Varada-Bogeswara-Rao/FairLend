# FairLend – Reputation-Based Lending on Solana using FairScale

## 🧠 Overview
FairLend is a reputation-based lending prototype on Solana that demonstrates how onchain reputation (FairScore) can be used as a risk guardrail in DeFi.
Inspired by Web2 credit scoring systems, FairLend adapts the concept to Web3 by integrating FairScale’s FairScore to dynamically control borrowing power. Instead of relying only on collateral, FairLend introduces trust as a first-class primitive for DeFi lending.
High-reputation wallets receive higher borrow limits, while low-reputation wallets face stricter constraints—reducing protocol risk in a permissionless way.

## 🚀 Key Features
* 🔐 **FairScore-gated borrowing**
  Borrow limits depend on wallet reputation tiers.

* 🏷️ **Trust Tiers & Badges**
  * **Bronze**: Limited / blocked borrowing
  * **Silver**: Medium LTV
  * **Gold**: High LTV (“Trust Boost”)

* 🛡️ **Signed FairScore Attestations**
  Prevents score spoofing by verifying backend-signed reputation data onchain.

* ⚡ **Kamino Lending Integration**
  Uses Kamino’s lending vaults for real borrowing execution.

* 📊 **User-Friendly UX**
  Clear explanations, progress indicators, and disabled states help users understand why limits apply.

## 🏗️ High-Level Architecture

```
[User Wallet]
     |
     v
[Frontend (React / Next.js)]
     |
     |-- fetch signed FairScore attestation
     v
[Attestation Service (Node.js)]
     |
     |-- FairScale API
     v
[Anchor Program (Solana)]
     |
     |-- verifies signature & tier
     v
[Frontend executes borrow via Kamino SDK]
```

### Design Principle
* **FairScale remains offchain** (privacy + flexibility)
* **Trust enforcement is onchain**
* **Liquidity execution stays with Kamino**

This separation keeps the system simple, secure, and hackathon-safe.

## 🧩 Components

### 1. Frontend (React / Next.js)
**Responsibilities**
* Wallet connection (Phantom, Backpack, etc.)
* Display FairScore tier and Trust Badge
* Show dynamic borrow limits
* Trigger onchain validation
* Execute Kamino borrow if approved

**UX Highlights**
* Borrow button locks for low-tier wallets
* Tooltip explanations (“Increase trust to unlock higher limits”)
* Visual Trust Boost progress bar

### 2. FairScore Attestation Service (Offchain)
**Purpose**
* Fetch FairScore from FairScale
* Convert score → tier
* Sign attestation to prevent tampering

**Flow**
1. Receive wallet address
2. Fetch FairScore from FairScale API
3. Compute tier (Bronze / Silver / Gold)
4. Sign `{ wallet, score, tier, timestamp }`
5. Return payload + signature

> ⚠️ **Note**: This prototype uses a centralized signer. In production, this would be replaced with decentralized attestations or oracle-style verification.

### 3. Onchain Program (Anchor / Rust)
**Responsibilities**
* Verify FairScore attestation signature
* Ensure data freshness (timestamp check)
* Enforce tier-based borrowing rules
* Emit approval or rejection events

**What it does NOT do**
* Does not fetch FairScore directly
* Does not manage liquidity
* Does not call Kamino internally
This keeps the program minimal, auditable, and secure.

### 4. Kamino Integration
* Borrow execution is handled client-side
* Uses Kamino’s official SDK
* Only allowed after onchain approval

> ℹ️ This prototype adjusts borrow limits at the application layer. Kamino’s internal protocol parameters remain unchanged.

## 🔄 End-to-End User Flow
1. User connects wallet
2. Frontend requests signed FairScore attestation
3. UI updates with Trust Tier & borrow limits
4. User submits borrow request
5. Anchor program validates attestation
6. If approved → frontend executes Kamino borrow
7. Success or rejection is shown clearly in UI

**Demo shows:**
* Low-tier wallet rejected
* High-tier wallet approved with higher LTV

## 🛠️ Tech Stack
* **Blockchain**: Solana (Devnet)
* **Smart Contracts**: Rust + Anchor
* **Frontend**: React / Next.js + Tailwind
* **Wallets**: @solana/wallet-adapter
* **Backend**: Node.js (Express / Serverless)
* **Lending**: Kamino SDK
* **Reputation**: FairScale API

## ⚙️ Setup Instructions

### Prerequisites
* Solana CLI
* Anchor
* Node.js (v18+)
* FairScale API key

### 1. Clone Repo
```bash
git clone https://github.com/your-username/fairlend
cd fairlend
```

### 2. Onchain Program
```bash
anchor build
anchor deploy
```

### 3. Backend (Attestation Service)
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Set environment variables:
* `FAIRSCALE_API_KEY`
* `ATTESTER_PRIVATE_KEY`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🧪 Testing
* Use Solana devnet
* Test with:
  * A new wallet (low FairScore)
  * An active wallet (higher FairScore)

**Anchor tests validate:**
* Signature verification
* Tier enforcement
* Timestamp freshness

## 🧠 Why FairScale Matters Here
FairScale is not just displayed—it directly affects core protocol behavior:
* Borrow caps
* Risk thresholds
* Access control

This mirrors real-world credit systems while preserving Web3 principles:
* Permissionless
* Transparent
* Composable

## 🏆 Hackathon Alignment
✔ Meaningful FairScale usage
✔ Working, demoable prototype
✔ Clear architecture & explanation
✔ Solana-native DeFi relevance

## 🔮 Future Improvements
* Decentralized attestations
* Multi-protocol lending support
* Reputation-based interest rates
* Onchain FairScore caching
* DAO-controlled risk parameters

## 📹 Demo Video
👉 Link to Loom / YouTube demo here

## 📄 License
MIT
