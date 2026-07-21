

A decentralized **Split Bill Calculator** built on the **Stellar testnet** with a Binance-inspired dark theme. Connect your Freighter wallet, split a bill among friends, and send XLM to multiple recipients in one seamless flow.

Built for the **Stellar White Belt (Level 1)** challenge.




<img width="1892" height="906" alt="splitbill1" src="https://github.com/user-attachments/assets/53756c47-ad50-449f-b691-298d3921a60e" />


<img width="1863" height="906" alt="splitbill2" src="https://github.com/user-attachments/assets/5f4d5a73-a52c-43da-abe1-162d420024ae" />

## Features

- Connect and disconnect Freighter wallet
- Real-time XLM balance display from Stellar Horizon
- Split bills among multiple participants
- Send XLM transactions on the Stellar testnet
- Per-recipient success/failure feedback with transaction hashes
- Transaction history saved to PostgreSQL (Neon) via NestJS backend
<img width="1911" height="830" alt="splitbill3" src="https://github.com/user-attachments/assets/d0d9e543-51c7-4d06-820e-a947f344ec8e" />

##Sucess Transaction

<img width="1600" height="877" alt="successTR" src="https://github.com/user-attachments/assets/8308ce71-128a-4d33-aedb-a814bcccaabc" />


## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Backend:** NestJS, Prisma, PostgreSQL (Neon)
- **Wallet:** `@stellar/freighter-api` v6, Stellar SDK
- **Network:** Stellar Testnet

## Live Deployments

- **Frontend:** https://xlm-payment-dapp.vercel.app
- **Backend:** https://splitbill-h0q9.onrender.com

## Project Structure

```
xlm-payment-dapp/
├── client/                     # React frontend
│   └── src/
│       ├── components/
│       │   ├── WalletConnect.tsx       # Connect/disconnect wallet
│       │   ├── BalanceDisplay.tsx      # Show XLM balance
│       │   ├── SplitBillCalculator.tsx # Split bill UI + send payments
│       │   └── TransactionHistory.tsx  # View past transactions
│       ├── context/
│       │   └── WalletContext.tsx       # Wallet state management
│       └── utils/
│           ├── freighter.ts            # Freighter wallet API helpers
│           └── stellar.ts             # Stellar transaction building
├── server/                     # NestJS backend
│   ├── prisma/
│   │   └── schema.prisma              # Database schema
│   └── src/
│       ├── app.controller.ts          # API routes
│       ├── app.service.ts             # Stellar + DB logic
│       ├── app.module.ts
│       ├── prisma.service.ts          # Prisma/Neon connection
│       └── main.ts                    # Server entry point
├── screenshots/                # Submission screenshots
└── README.md
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Freighter Wallet](https://www.freighter.app/) browser extension
- A Stellar testnet account funded via [Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/ankitapolu/xlm-payment-dapp.git
cd xlm-payment-dapp

# 2. Install dependencies (root + client + server)
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# 3. Set up environment variables
cd server
cp .env.example .env    # or create .env with:
# STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
# STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
# PORT=3000
# DATABASE_URL=<your-neon-postgres-url>
cd ..

# 4. Start both frontend and backend
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000

##Video Demo










## Usage

1. Install the **Freighter** wallet extension and create a testnet account
2. Fund your account via [Stellar Friendbot](https://friendly.stellar.org/) (get 10,000 free test XLM)
3. Open the app and click **Connect Wallet** (top right)
4. Your wallet address and XLM balance will appear
5. Enter the total bill amount and add participant Stellar addresses
6. Review the summary and click **Confirm & Send**
7. Sign each transaction in the Freighter popup
8. View results per recipient with transaction hashes
9. Switch to the **History** tab to see all past transactions

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/status` | Server health check |
| POST | `/api/send-xlm` | Send XLM (server-side signing) |
| POST | `/api/transactions` | Record a transaction |
| GET | `/api/transactions` | Fetch recent transactions |

## Screenshots

| State | Screenshot |
|-------|------------|
| Wallet Connected & Balance | ![](screenshots/wallet-connected.png) |
| Split Bill Setup | ![](screenshots/split-bill-setup.png) |
| Transaction Review | ![](screenshots/transaction-review.png) |
| Successful Transaction | ![](screenshots/transaction-success.png) |
| Transaction History | ![](screenshots/transaction-history.png) |

> **Add your screenshots to the `screenshots/` folder and update the paths above.**

## Submission Checklist

- [x] Public GitHub repository
- [x] README.md with project description
- [x] Setup instructions (how to run locally)
- [x] Wallet connect functionality
- [x] Wallet disconnect functionality
- [x] Fetch and display XLM balance
- [x] Send XLM transaction on Stellar testnet
- [x] Success/failure feedback with transaction hash
- [ ] Screenshots added to `screenshots/` folder
  - [ ] Wallet connected state
  - [ ] Balance displayed
  - [ ] Successful testnet transaction
  - [ ] Transaction result shown to user

## License

MIT
