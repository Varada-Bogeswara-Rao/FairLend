# FairLend: Reputation-Based Risk Guardrails for DeFi

**FairLend** is a reputation-based lending protocol on Solana that integrates **FairScale** to create a "Risk Guardrail" for DeFi. By dynamically adjusting a user's borrowing power based on their on-chain reputation score, FairLend enables trusted users to access higher capital efficiency while actively mitigating protocol risk.

## 🎯 Mission & Core Integrations.

### 1. FairScale (The Reputation Layer)
FairLend uses **FairScale** as its core trust engine.
- **Risk Guardrails**: Instead of a "one size fits all" approach, FairLend intercepts every borrow request at the backend.
- **FairScore Integration**: The backend queries the user's latest FairScore from the FairScale API.
- **Trust Tiers**: Users are categorized into three distinct tiers:
    - **🥉 Bronze**: Basic access (Max 50% LTV).
    - **🥈 Silver**: Standard access (Max 60% LTV).
    - **🥇 Gold**: Premium access (Max 75% LTV) for high-reputation users.

### 2. Solend (The DeFi Layer)
FairLend builds on top of the **Solend** protocol for actual lending and borrowing markets.
- **Transaction Building**: The backend acts as a secure transaction builder. It uses the **Solend SDK** to construct valid Solana instructions (deposits, borrows) only *after* the risk engine has verified the user's tier...
- **Simulation**: In environments where mainnet-forks or specific pools aren't available, the system can fallback to simulated transaction building for demonstration purposes.

## 🏗️ Project Structure

| Component | Directory | Description |
| :--- | :--- | :--- |
| **Frontend** | `/frontend` | **Next.js 16** (App Router) web app. Built with **React 19**, **TailwindCSS v4**, and Framer Motion for a premium "Glassmorphism" UI. |
| **Backend** | `/backend` | **Node.js/Express** server. Serves as the secure oracle and Risk Engine. It holds the `FAIRSCALE_API_KEY` and constructs DeFi transactions. |
| **Programs** | `/anchor` | **Anchor** smart contracts (Rust) for on-chain verification logic and attestation checks. |

## 🛠 Tech Stack

- **Frontend**:
  - **Framework**: Next.js 16.1.4
  - **UI Library**: React 19.2.3
  - **Styling**: TailwindCSS v4, Framer Motion
  - **Web3**: `@solana/wallet-adapter`

- **Backend**:
  - **Runtime**: Node.js
  - **Server**: Express.js
  - **Integrations**: Solend SDK, FairScale API, `@solana/web3.js`

## 🚀 Setup & Run

### Prerequisites
- Node.js (v18+)
- Solana Wallet (Phantom/Backpack) connected to **Devnet**.

### 1. Backend Setup
The backend bridges the frontend with FairScale and Solend.

1.  Navigate to the backend:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure Environment:
    ```bash
    cp .env.example .env
    ```
    *Ensure your `.env` has a valid `FAIRSCALE_API_KEY`.*

4.  Start the server:
    ```bash
    node index.js
    ```
    *Server runs on http://localhost:3001*

### 2. Frontend Setup
The user interface for interacting with the protocol.

1.  Navigate to the frontend:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start Development Server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000).

## 📜 Architecture

For a deep dive into the system design, see [architecture.md](./architecture.md).
