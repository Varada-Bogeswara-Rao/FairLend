# FairLend: Reputation-Based DeFi

**FairLend** is a trust-based lending protocol built on Solana that integrates **FairScale** reputation scoring with the **Solend** protocol.

It demonstrates a "Risk Guardrails" architecture where a user's on-chain reputation dynamically determines their access to capital and borrowing power.

---

## 🏆 Hackathon Features

### 1. Smart Risk Gateway (Backend Enforced)
FairLend does not just display a score on the frontend. The backend acts as a secure gateway that intercepts every borrow request:
*   **Intercepts**: Validates user intent before building transactions.
*   **Verifies**: Fetches FairScore server-side (securely).
*   **Enforces**: Dynamically adjusts loan parameters based on trust tier.

### 2. Trust Levels & Dynamic LTV
Instead of a binary "Allow/Block", we implemented granular risk management:

| Tier Name | Score Range | Status | Max LTV (Loan-To-Value) |
| :--- | :--- | :--- | :--- |
| **Bronze** | 0 - 9 | Restricted | **50%** (High Collateral Required) |
| **Silver** | 10 - 49 | Standard | **60%** (Standard Risk Profile) |
| **Gold** | 50 - 100 | Trusted | **75%** (Protocol Maximum) |

*Example: A Bronze user depositing $100 can only borrow $50, while a Gold user can borrow $75.*

### 3. Solend Integration (Devnet)
FairLend integrates directly with the **Solend SDK** to execute real DeFi operations:
*   **Deposit**: Users deposit SOL which is auto-wrapped (WSOL) and minted as collateral (cSOL).
*   **Borrow**: Users borrow USDC against their collateral, subject to the limits above.
*   **Oracles**: Handles Pyth & Switchboard price feed updates automatically.

---

## 🛠 Tech Stack

*   **Frontend**: Next.js, TailwindCSS
*   **Backend**: Node.js, Express
*   **DeFi**: Solend SDK, Anchor, Web3.js
*   **Reputation**: FairScale API

---

## 🚀 Setup & Run

### Prerequisites
*   Node.js (v18+)
*   Solana Wallet (Phantom/Backpack) set to **Devnet**.

### 1. Configure Backend
```bash
cd backend
npm install
node index.js
```
*Note: Ensure `.env` contains your `FAIRSCALE_API_KEY`.*

### 2. Configure Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
1.  Open `http://localhost:3000`.
2.  Connect Wallet.
3.  Click **"Check My Score"** to see your FairScore & Tier.
4.  **Deposit SOL** to fund your account collateral.
5.  **Borrow USDC**: The system will check your tier and approve/reject the amount.

---

## 📜 Architecture

See [architecture.md](./architecture.md) for the detailed system diagram.
