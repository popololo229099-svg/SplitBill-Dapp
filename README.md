# SplitBill - Stellar XLM Split Payment dApp

A decentralized **Split Bill Calculator** built on the **Stellar testnet** with a Binance-inspired dark theme. Connect your Freighter wallet, split a bill among friends, and send XLM to multiple recipients in one seamless flow.

Built for the **Stellar White Belt (Level 1)** challenge.

## Features

| Requirement | Status |
|-------------|--------|
| ✅ Freighter Wallet Setup | Connect & disconnect |
| ✅ Balance Display | Real-time XLM balance from Horizon |
| ✅ Send XLM Transaction | Split bill payments on testnet |
| ✅ Transaction Feedback | Success/failure per recipient with hash |
| ✅ UI Setup | React + TypeScript + NestJS |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** NestJS (with `@stellar/stellar-sdk`)
- **Wallet:** `@stellar/freighter-api` v6
- **Network:** Stellar Testnet

## Project Structure

```
xlm-payment-dapp/
├── client/                 # React frontend
│   └── src/
│       ├── components/     # WalletConnect, BalanceDisplay, SplitBillCalculator
│       ├── context/        # WalletContext (wallet state management)
│       └── utils/          # freighter.ts, stellar.ts (API helpers)
├── server/                 # NestJS backend
│   └── src/
│       ├── app.controller.ts   # GET /api/status, POST /api/send-xlm
│       ├── app.module.ts
│       └── app.service.ts      # Stellar transaction logic
├── screenshots/            # 📸 Add your screenshots here
└── README.md
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- A Stellar testnet account funded via [Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet)

### Run Locally

```bash
# 1. Clone
git clone https://github.com/ankitapolu/xlm-payment-dapp.git
cd xlm-payment-dapp

# 2. Install client dependencies
cd client
npm install
cd ..

# 3. Install server dependencies
cd server
npm install
cd ..

# 4. Start both (frontend + backend)
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

## Usage

1. Install **Freighter** wallet extension and create a testnet account
2. Fund your account via [Stellar Friendbot](https://friendly.stellar.org/) (get 10,000 free test XLM)
3. Open the app → click **Connect Wallet** (top right)
4. Your wallet address and XLM balance will appear
5. Enter total bill amount, add participant addresses
6. Review the summary → click **Confirm & Send**
7. Sign each transaction in Freighter
8. View results per recipient with transaction hashes

## Smart Contract

A Stellar Soroban contract is deployed for on-chain split bill logic:

- **Contract ID:** `CA4SOMETHING...` (testnet)
- **Network:** Stellar Testnet
- **Functions:** `split_payment`, `get_split_info`

> *Contract deployment details to be filled after compilation.*

## Screenshots

| State | Screenshot |
|-------|------------|
| Wallet Connected & Balance | ![](screenshots/wallet-connected.png) |
| Split Bill Setup | ![](screenshots/split-bill-setup.png) |
| Transaction Review | ![](screenshots/transaction-review.png) |
| Successful Transaction | ![](screenshots/transaction-success.png) |

> **Replace the placeholder images above with your actual screenshots in the `screenshots/` folder.**

## Submission Checklist

- [x] Public GitHub repository
- [x] README.md with project description and setup instructions
- [ ] Screenshots added to `screenshots/` folder
  - [ ] Wallet connected state
  - [ ] Balance displayed
  - [ ] Successful testnet transaction
  - [ ] Transaction result shown to user
- [ ] Deployed smart contract (optional bonus)

## License

MIT
