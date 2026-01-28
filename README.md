# FairLend: Reputation-Based Risk Guardrails



**FairLend** is a reputation-based lending protocol built on Solana that integrates **FairScale** to create a "Risk Guardrail" for DeFi. It dynamically adjusts a user's borrowing power based on their on-chain reputation score, enabling trusted users to access higher capital efficiency while mitigating protocol risk.

## 🎯 Mission & FairScale Integration

### About FairScale
FairScale is developer infrastructure for onchain reputation scoring on Solana. It powers a universal reputation layer that makes trust a first-class primitive in Web3 products. FairLend uses FairScale's "FairScore" to turn wallet activity into actionable risk decisions.

### How We Use FairScale
We implemented the **Risk Guardrails** pattern. FairLend acts as a smart gateway that intercepts every borrow request:
1.  **Check Score**: The backend queries FairScale for the user's latest FairScore.
2.  **Assign Tier**: Users are categorized into **Bronze**, **Silver**, or **Gold** tiers based on their score.
3.  **Enforce Limits**:
    *   **Bronze**: Restricted access (Max 50% LTV).
    *   **Silver**: Standard access (Max 60% LTV).
    *   **Gold**: Premium access (Max 75% LTV).

This proves that DeFi doesn't have to be "one size fits all"—reputation can unlock capital.

## 🏗️ Project Structure

This repository is organized into three main components:

| Component | Directory | Description |
| :--- | :--- | :--- |
| **Frontend** | `/frontend` | **Next.js 16** web application. Handles wallet connection, UI, and visualizing the user's trust tier. |
| **Backend** | `/backend` | **Node.js/Express** server. Acts as the secure oracle and transaction builder. It protects the FairScale API key and enforces risk logic. |
| **Smart Contract** | `/anchor` | **Anchor** program (Rust) for on-chain verification and testing custom logic. |

## 🛠 Tech Stack

*   **Frontend**: Next.js 16, React 19, TailwindCSS v4, Framer Motion, `@solana/wallet-adapter`.
*   **Backend**: Node.js, Express, Axios (for FairScale API).
*   **DeFi**: Solend SDK (Integration with Solend logic), Web3.js.
*   **Reputation**: FairScale API (Score fetching).

## 🚀 Setup & Run

### Prerequisites
*   Node.js (v18 or higher)
*   Solana Wallet (Phantom/Backpack) set to **Devnet**.

### 1. Configure the Backend
The backend is required to proxy requests to FairScale and build secure transactions.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file from the example:
    ```bash
    cp .env.example .env
    ```
4.  Update `.env` with your FairScale API Key (Get one [here](https://forms.gle/heG1hfnjao4VShUS8)):
    ```env
    FAIRSCALE_API_KEY=your_actual_api_key_here
    PORT=3001
    ```
5.  Start the server:
    ```bash
    node index.js
    ```
    *Server will start on http://localhost:3001*

### 2. Configure the Frontend
The frontend connects to your local backend to process user requests.

1.  Open a new terminal and navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Usage Flow
1.  **Connect Wallet**: Use the button in the top right.
2.  **View Reputation**: The dashboard will auto-fetch your FairScore from the backend.
3.  **Deposit**: Fund your account with Devnet SOL.
4.  **Borrow**: Attempt to borrow USDC.
    *   *Try with a low-score wallet*: You will be restricted to low LTV.
    *   *Try with a high-score wallet*: You verify the "Gold" tier perks.

## 📜 Architecture

See [architecture.md](./architecture.md) for the high-level system diagram and data flow..
