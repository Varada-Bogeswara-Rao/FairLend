
# FairLend: Reputation-Based Risk Guardrails for DeFi

**FairLend** is a next-generation lending protocol on Solana that integrates **FairScale** to create a "Risk Guardrail" for DeFi. By dynamically adjusting a user's borrowing power based on their on-chain reputation score, FairLend enables trusted users to access higher capital efficiency while actively mitigating protocol risk.

## 🚀 Mission & Vision

DeFi lending often suffers from a "one size fits all" approach to risk. FairLend intercepts every borrow request at the backend, acting as a smart proxy that:
1.  **Verifies Reputation**: Queries **FairScale** for a user's `FairScore`.
2.  **Enforces Tiers**: Categorizes users into Bronze, Silver, or Gold tiers.
3.  **Adjusts Limits**: Sets Maximum LTV (Loan-To-Value) ratios dynamically.
4.  **Constructs Transactions**: Only builds valid **Solend** borrow instructions if the risk check passes.

## ✨ Key Features

-   **Risk Engine**: A dedicated backend service that acts as a gatekeeper for lending operations.
-   **Dynamic LTV**:
    -   **🥉 Bronze**: Basic access (Max 50% LTV).
    -   **🥈 Silver**: Standard access (Max 60% LTV).
    -   **🥇 Gold**: Premium access (Max 75% LTV) for high-reputation users.
-   **Solend Integration**: Built on top of the battle-tested **Solend** protocol.
-   **Glassmorphism UI**: A premium, responsive interface built with **Next.js 16**, **TailwindCSS v4**, and **Framer Motion**.
-   **Simulation Mode**: Smart fallback to simulated transactions for development and demonstration purposes when mainnet forks are unavailable.

## 🏗️ Project Structure

| Component | Directory | Description |
| :--- | :--- | :--- |
| **Frontend** | `/frontend` | **Next.js 16** (App Router) web app. Features a modern, dark-mode "Glassmorphism" design. |
| **Backend** | `/backend` | **Node.js/Express** server. Serves as the secure oracle and Risk Engine. It holds the `FAIRSCALE_API_KEY` and constructs DeFi instructions. |
| **Programs** | `/anchor` | **Anchor** smart contracts (Rust) for on-chain verification logic. |

## 🛠 Tech Stack

-   **Frontend**:
    -   **Framework**: Next.js 16.1.4 (App Router)
    -   **UI Library**: React 19.2.3
    -   **Styling**: TailwindCSS v4, Framer Motion
    -   **Wallet**: `@solana/wallet-adapter`
    -   **Network**: Axios

-   **Backend**:
    -   **Runtime**: Node.js
    -   **Framework**: Express.js
    -   **Integrations**: Solend SDK, FairScale API, `@solana/web3.js`

## 🚀 Setup & Run

### Prerequisites
-   Node.js (v18+)
-   Solana Wallet (Phantom/Backpack) connected to **Devnet**.

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
    Create a `.env` file in the `backend` directory:
    ```env
    PORT=3001
    FAIRSCALE_API_KEY=your_fairscale_api_key
    # Optional: Solend Configuration
    ```
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

---

*Built for the Solana Renaissance Hackathon.*
