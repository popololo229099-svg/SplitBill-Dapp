# SplitBill - Stellar XLM Split Payment dApp

A decentralized Split Bill calculator built on the **Stellar testnet**, with a Binance-inspired dark theme. Connect your Freighter wallet, split a bill among friends, and send XLM to multiple recipients in one flow.

## Features

- **Freighter Wallet Integration** — Connect/disconnect Freighter wallet
- **Balance Display** — Real-time XLM balance on Stellar testnet
- **Split Bill Calculator** — Add multiple people, auto-calculate per-person amount
- **Batch Payments** — Send XLM to all recipients with Freighter signing
- **Transaction Feedback** — Per-recipient status, success/failure, and transaction hashes

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** NestJS, TypeScript
- **Stellar:** @stellar/stellar-sdk, @stellar/freighter-api (v6)
- **UI:** Custom CSS, Binance-style dark theme

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- A funded testnet account (use [Stellar Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet) to get 10,000 free test XLM)

## Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd xlm-payment-dapp

# Install dependencies
cd client && npm install
cd ../server && npm install
cd ..

# Run both frontend and backend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Usage

1. Install Freighter wallet extension and create a testnet account
2. Fund your account via [Stellar Friendbot](https://friendly.stellar.org/)
3. Connect wallet by clicking "Connect Wallet" (top right)
4. Your XLM balance appears at the top
5. Enter total bill amount, add participant addresses
6. Review the summary and confirm
7. Sign each transaction in Freighter to complete

## Screenshots

> Add screenshots to the `screenshots/` folder before submission.

| State | Screenshot |
|-------|------------|
| Wallet disconnected | `screenshots/wallet-disconnected.png` |
| Wallet connected with balance | `screenshots/wallet-connected.png` |
| Split bill setup | `screenshots/split-bill.png` |
| Transaction success | `screenshots/transaction-success.png` |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Server health status |
| POST | `/api/send-xlm` | Send XLM transaction |

## Project Structure

```
xlm-payment-dapp/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components
│       ├── context/        # WalletContext provider
│       └── utils/          # Freighter & Stellar utilities
├── server/                 # NestJS backend
│   └── src/
│       ├── app.controller.ts
│       ├── app.module.ts
│       └── app.service.ts
├── screenshots/            # Screenshots for submission
└── README.md
```
