# SplitBill - Stellar XLM Split Payment dApp

A decentralized **Split Bill Calculator** built on the **Stellar testnet** with a Binance-inspired dark theme. Connect any supported Stellar wallet, split a bill among friends, and send XLM to multiple recipients — with every payment recorded on-chain via a Soroban smart contract.

Built for the **Stellar Belt Challenge** (Levels 1-3).

<img width="1892" height="906" alt="splitbill1" src="https://github.com/user-attachments/assets/53756c47-ad50-449f-b691-298d3921a60e" />

<img width="1863" height="906" alt="splitbill2" src="https://github.com/user-attachments/assets/5f4d5a73-a52c-43da-abe1-162d420024ae" />

## Features

- **Multi-wallet support** via Stellar Wallets Kit (Freighter, LOBSTR, Albedo)
- **Smart contract integration** — every split is recorded on-chain via Soroban
- **Real-time event log** — view on-chain split records with live refresh
- **CI/CD pipeline** — GitHub Actions with lint, test, build, and deploy stages
- **Error boundary** — app-level crash recovery with user-friendly fallback
- **Loading skeletons** — shimmer-based skeleton UI for balances and lists
- **Mobile responsive** — fully responsive layout across phone, tablet, and desktop
- Real-time XLM balance display from Stellar Horizon
- Split bills among multiple participants
- Send XLM transactions on the Stellar testnet
- Per-recipient transaction status tracking (building -> signing -> submitting -> recording -> success/fail)
- 5 error types handled: wallet not found, transaction rejected, insufficient balance, account not found, timeout
- Transaction history saved to PostgreSQL (Neon) via NestJS backend

<img width="1911" height="830" alt="splitbill3" src="https://github.com/user-attachments/assets/d0d9e543-51c7-4d06-820e-a947f344ec8e" />

## Sucess Transaction

<img width="1600" height="877" alt="successTR" src="https://github.com/user-attachments/assets/8308ce71-128a-4d33-aedb-a814bcccaabc" />

## Smart Contract

- **Contract Address:** `CDC2GGOQ6BATKV6GI56G3FV5GIFGTJ57IPJ6EO5KEAXBTGKXXGD66VSS`
- **Deploy TX:** [`88d313cb...`](https://stellar.expert/explorer/testnet/tx/88d313cb28d3befcd82f50840c1e93f96ddafb7655b69823cb9205d0f15d47ed)
- **Initialize TX:** [`762dec92...`](https://stellar.expert/explorer/testnet/tx/762dec9258511e136f111de984d858c7b455739fec717226d38f03511f8250b5)
- **Contract Explorer:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDC2GGOQ6BATKV6GI56G3FV5GIFGTJ57IPJ6EO5KEAXBTGKXXGD66VSS)

### Functions

| Function | Description |
|----------|-------------|
| `initialize` | Initialize the contract (called once) |
| `record_split(sender, recipient, amount)` | Record a bill split on-chain (requires auth) |
| `get_total_splits()` | Get total number of recorded splits |
| `get_split(id)` | Get a specific split record |
| `get_splits(start, limit)` | Get recent split records (paginated) |


##Frontend deployed link - > https://xlm-payment-dapp.vercel.app

##Backend deployed link - > https://splitbill-h0q9.onrender.com



## Tech Stack

- **Frontend:** React 19, TypeScript 6, Vite 8
- **Backend:** NestJS, Prisma, PostgreSQL (Neon)
- **Wallet:** `@creit.tech/stellar-wallets-kit` v2.5 (multi-wallet)
- **Contract:** Soroban (Rust) deployed on Stellar Testnet
- **SDK:** `@stellar/stellar-sdk` v16
- **Testing:** Vitest, React Testing Library, `cargo test`
- **Linting:** oxlint
- **CI/CD:** GitHub Actions
- **Network:** Stellar Testnet

## Live Deployments

- **Frontend:** https://xlm-payment-dapp.vercel.app
- **Backend:** https://splitbill-h0q9.onrender.com

## Project Structure

```
xlm-payment-dapp/
├── .github/
│   └── workflows/
│       └── ci.yml                        # GitHub Actions CI/CD (lint, test, build, deploy)
├── contract/                             # Soroban smart contract
│   └── contracts/
│       └── bill_splitter/
│           └── src/
│               ├── lib.rs            # Contract logic (record_split, get_splits)
│               └── test.rs           # 10 unit tests with mock_auths
├── client/                           # React frontend
│   └── src/
│       ├── components/
│       │   ├── WalletConnect.tsx      # Multi-wallet connect (StellarWalletsKit)
│       │   ├── BalanceDisplay.tsx     # XLM balance + network badges + skeleton
│       │   ├── SplitBillCalculator.tsx # Split bill + send + contract recording
│       │   ├── TransactionHistory.tsx # Server-side transaction history
│       │   ├── EventLog.tsx           # On-chain event log viewer
│       │   ├── LandingPage.tsx        # Marketing landing page
│       │   ├── ErrorBoundary.tsx      # App-level error boundary
│       │   └── SkeletonLoader.tsx     # Shimmer skeleton components
│       ├── hooks/
│       │   └── useMediaQuery.ts       # useIsMobile, useIsTablet hooks
│       ├── context/
│       │   └── WalletContext.tsx       # Wallet state + error handling
│       └── utils/
│           ├── wallet-kit.ts          # StellarWalletsKit wrapper
│           └── contract.ts            # Soroban contract interaction + Stellar ops
├── server/                           # NestJS backend
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   └── src/
│       ├── app.controller.ts         # API routes
│       ├── app.service.ts            # Stellar + DB logic
│       └── main.ts                   # Server entry
└── README.md
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://www.rust-lang.org/tools/install) (for contract development)
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/quickstart) (`cargo install --locked stellar-cli`)
- A Stellar wallet (Freighter, LOBSTR, or Albedo)
- A Stellar testnet account funded via [Friendbot](https://laboratory.stellar.org/#account-creator?network=testnet)

### Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/ankitapolu/xlm-payment-dapp.git
cd xlm-payment-dapp

# 2. Install dependencies
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

### Run Tests

```bash
# Contract tests (Rust)
cd contract && cargo test

# Frontend tests (Vitest)
cd client && npm test

# Lint
cd client && npx oxlint src/
```

### Build the Contract (Optional)

```bash
cd contract
stellar contract build
stellar contract deploy \
  --wasm target/wasm32v1-none/release/bill_splitter.wasm \
  --source deployer \
  --network testnet
```

## Video Demo










https://github.com/user-attachments/assets/d1b9b803-f561-40bc-8ceb-eafdf2ec638d







## Usage

1. Install a Stellar wallet extension (Freighter, LOBSTR, or Albedo)
2. Create a testnet account and fund it via [Stellar Friendbot](https://friendly.stellar.org/)
3. Open the app and click **Connect Wallet** (pick any supported wallet)
4. Your wallet address and XLM balance will appear
5. Enter the total bill amount and add participant Stellar addresses
6. Review the summary (including the smart contract address)
7. Click **Confirm & Send** and sign each transaction in your wallet
8. Watch real-time status: Building -> Sign -> Submitting -> Recording on-chain -> Success
9. Switch to **On-Chain** tab to see all contract records with live refresh

## Error Handling

| Error Type | Trigger | User Message |
|------------|---------|-------------|
| Wallet Not Found | No wallet installed or user cancels modal | "No wallet found. Please install a Stellar wallet." |
| Transaction Rejected | User denies signing in wallet | "Connection was rejected by the user." |
| Insufficient Balance | Amount exceeds wallet balance | Pre-flight check blocks submission + "Insufficient balance" |
| Account Not Found | Source account doesn't exist on testnet | Error shown with transaction details |
| Timeout | Transaction takes too long | Error shown with transaction details |
| Contract Error | On-chain contract call fails | Non-blocking warning (payment still succeeds) |

## CI/CD Pipeline

GitHub Actions with 4 stages:

| Stage | Jobs | Description |
|-------|------|-------------|
| **lint** | `lint-client`, `lint-server` | oxlint for client, eslint for server |
| **test** | `test-contract`, `test-client`, `test-server` | Rust unit tests, Vitest frontend tests, NestJS tests |
| **build** | `build-client`, `build-server`, `build-contract` | Production builds with artifacts (needs lint + test to pass) |
| **deploy** | `deploy-client`, `deploy-server` | Auto-deploy to Vercel/Render on push to master |

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
| On-Chain Event Log | ![](screenshots/event-log.png) |

> **Add your screenshots to the `screenshots/` folder and update the paths above.**
<img width="1890" height="830" alt="image" src="https://github.com/user-attachments/assets/f4d8da32-cb9c-4076-8509-4ec658f8a5f8" />


##mobile responsiveness


<img width="702" height="1600" alt="WhatsApp Image 2026-07-22 at 1 35 13 PM" src="https://github.com/user-attachments/assets/34a16723-cabd-4a6e-8944-c77b26f9412f" />
<img width="702" height="1600" alt="WhatsApp Image 2026-07-22 at 1 35 14 PM" src="https://github.com/user-attachments/assets/da163114-f016-4d1b-87a3-de22e01924ff" />












## Test Results
<img width="1907" height="885" alt="image" src="https://github.com/user-attachments/assets/516cffac-3c3c-4257-9bf6-22e4d0afc9c6" />




### Contract Tests (10/10 passing)
```
test result: ok. 10 passed; 0 failed; 0 ignored
```
<img width="1866" height="911" alt="image" src="https://github.com/user-attachments/assets/d7715aba-a0ae-45ad-8e66-66051ffbef7d" />

### Frontend Tests (15/15 passing)
```
Test Files  3 passed (3)
     Tests  15 passed (15)
```
- `WalletConnect.test.tsx` — 6 tests (connect, disconnect, states, errors)
- `contract.test.ts` — 2 tests (buildPaymentTransaction, buildRecordSplitTx)
- `useMediaQuery.test.ts` — 7 tests (useMediaQuery, useIsMobile, useIsTablet)

## License

MIT
