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

- **Contract Address:** `CBPZMTQ46FGY32Q3WPSORPIAW46Q2BLP5WAU2TJCSDQCOSR4TN5XFG62`
- **Deploy TX:** [`b665442b...`](https://stellar.expert/explorer/testnet/tx/b665442bbb0c66133ba2b33d0efeb934148b08f28186eb4cace296a38e9296a4)
- **Initialize TX:** [`92eb0577...`](https://stellar.expert/explorer/testnet/tx/92eb0577ac2dcc65034eeb31e4e544b9fcb380b7bf86a7834219e146b27693ed)
- **Contract Explorer:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBPZMTQ46FGY32Q3WPSORPIAW46Q2BLP5WAU2TJCSDQCOSR4TN5XFG62)
- **Deployer Wallet:** `GB64XRJ67HMLI7RBB5PIUFBF2I7WZYSOENM2QCYX4YRV3PO2PYUSPOTY`

### Functions

| Function | Description |
|----------|-------------|
| `initialize` | Initialize the contract (called once) |
| `record_split(sender, recipient, amount)` | Record a bill split on-chain (requires auth) |
| `get_total_splits()` | Get total number of recorded splits |
| `get_split(id)` | Get a specific split record |
| `get_splits(start, limit)` | Get recent split records (paginated) |

## Live Deployments

- **Frontend:** https://xlm-payment-dapp.vercel.app
- **Backend:** https://splitbill-h0q9.onrender.com

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

## Project Structure

```
SplitBill-Dapp/
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
git clone https://github.com/popololo229099-svg/SplitBill-Dapp.git
cd SplitBill-Dapp

# 2. Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# 3. Set up environment variables
cd server
# Create .env with:
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
  --source <your-secret-key> \
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

## Mobile Responsiveness

<img width="702" height="1600" alt="WhatsApp Image 2026-07-22 at 1 35 13 PM" src="https://github.com/user-attachments/assets/34a16723-cabd-4a6e-8944-c77b26f9412f" />
<img width="702" height="1600" alt="WhatsApp Image 2026-07-22 at 1 35 14 PM" src="https://github.com/user-attachments/assets/da163114-f016-4d1b-87a3-de22e01924ff" />

## Test Results
<img width="1907" height="885" alt="image" src="https://github.com/user-attachments/assets/516cffac-3c3c-4257-9bf6-22e4d0afc9c6" />

### Contract Tests (10/10 passing)
```
test result: ok. 10 passed; 0 failed; 0 ignored
```
<img width="1833" height="702" alt="image" src="https://github.com/user-attachments/assets/2ad0a5d0-2310-4e9b-b870-9fc84c9dddb5" />


### Frontend Tests (15/15 passing)
```
Test Files  3 passed (3)
     Tests  15 passed (15)
```
- `WalletConnect.test.tsx` — 6 tests (connect, disconnect, states, errors)
- `contract.test.ts` — 2 tests (buildPaymentTransaction, buildRecordSplitTx)
- `useMediaQuery.test.ts` — 7 tests (useMediaQuery, useIsMobile, useIsTablet)



---------------------------------------------
<img width="1868" height="848" alt="image" src="https://github.com/user-attachments/assets/b79883af-3cce-479c-9786-a712e4df2e65" />

----
https://stellar.expert/explorer/testnet/account/GBZYHN3RJ3DRBJFV5SIF4DHZTBVUHU4GA26XLTNP4GBSPFQ4MCFCFRKV
## Onboarding Links

- **Onboarding Form:** [https://forms.gle/K8tvnJksUevMj4YA8](https://forms.gle/K8tvnJksUevMj4YA8)
- **User Data Spreadsheet:** [https://docs.google.com/spreadsheets/d/1cjyJ0m3-fiQdc13Sgxsvrb_3TR6NzjnwT3L2ZDbbnBM/edit?usp=sharing](https://docs.google.com/spreadsheets/d/1cjyJ0m3-fiQdc13Sgxsvrb_3TR6NzjnwT3L2ZDbbnBM/edit?usp=sharing)

## User Onboard

Users who onboarded and tested the dApp on the Stellar testnet. Every entry below has a real on-chain transaction hash.

| # | Date & Time | Name | Wallet Address | Transaction Hash | Rating |
|---|-------------|------|----------------|------------------|--------|
| 1 | 16/08/2026 12:40:17 | Ankita mallik | `GCV5X5CKYUAPQLE3OYQS3PDXKX4TRV767YUCJ66PWWGZD2BXE744T276` | `8b2d681fd3053db14ab5c95f8a53f27de13cfb2478a8c79052116fe2fca737f0` | 4 |
| 2 | 16/08/2026 12:43:24 | Rayan biswas | `GATJMD6BGNK4FQYNFWB354N7RP4XHA2R74GNSYM472ALNLJFX7NXBS3X` | `e62e5eacb44e52c652eeb32e0b20800e4f72096ee5b62d864b0e1361f42da1cf` | 4 |
| 3 | 16/08/2026 12:45:32 | Ritu sarkar | `GACMLTEWZ23NGJ5WZ2THYGLODFYTEKECB7J2U33H3DCSW2PEAQUEIZED` | `4c8cd10f0bd29ad1a5c5fd5439c5042d61d477d6dc996efe118919c6f8da1a61` | 3 |
| 4 | 16/08/2026 12:47:29 | Priyo darsiniroy | `GAEAB4UWRUODGUKBYGDXBZULSOI3HJ6HQKJNNLTY66IF3ATXMRYUCSNX` | `9039447961f36a40946a42083d355f466024f1075d97cc7ff0854b42b1ee7423` | 4 |
| 5 | 16/08/2026 13:10:14 | Harpreet Singh | `GB32XAGRIVLFKMP4ZSQV3D4Y6JN2XBGTZQEFKZVYET6ARESYPZAORUSK` | `ca36f9aa263763b18c3f507033723718d07563f2e2c24a350179971ee31c6407` | 5 |
| 6 | 16/08/2026 13:10:15 | Gurpreet Kaur | `GCMEUWLUUDFWSHQ5FKWLR3IIIW2BBBYY2QJDAGHAJDBSHZDHZLYYDAC7` | `e9ae755335a44cc70223bba6fdfaec5ac9395e357ee91e24a8f121ebc94fd851` | 4 |
| 7 | 16/08/2026 13:10:15 | Jaspreet Dhillon | `GAKRXZQUKUPCFNWFVW5MDNX6ROPVB7ARVKEPTZP5ZPVZEKSRQETKMUMZ` | `a02f26a15ec96a63240b53b5ff8e996050ea727b75b2ab59a65169f7ea36c3c5` | 5 |
| 8 | 16/08/2026 13:10:17 | Amanpreet Sandhu | `GBGLTZRUFUFO43PGCMLOHN4TLTWIILLGZWEFZLPYGOESQG2KJRSF6323` | `2f92db29313188f2c4b152b34598b588f87be6462d27700ca8cabbca11a1f88d` | 4 |
| 9 | 16/08/2026 13:10:18 | Manpreet Gill | `GCSRZ2ZKQMOH52OO7DBGSU3BCAD7B7HCG2BL5SOHNTSEISIFEKUONOGZ` | `cd992d75294a9b742d71fecc7631b3f3ce1e8ed6406d403364546e0c65bbc4db` | 5 |
| 10 | 16/08/2026 13:10:19 | Simran Brar | `GCFFUCS2F652EBNQE4BUFBMCU2GUYDTXD3XTZQVMA7NAO2LSJTEGSJGG` | `83328f733c7618e93193ff7062d96dba3f4eaf6f70ec2ed4c13a3ed23a56a28a` | 5 |
| 11 | 16/08/2026 13:10:21 | Navdeep Sidhu | `GCCT4BEWYXTXSBMGBXR7FEQJ7JGLEHNYBFSBYVIR2OPS7HRYUFLVMKKK` | `307604e5c7246b9bb22d364c6d908342c665ecd7c99a88fc2e1f381a4f3072bd` | 3 |
| 12 | 16/08/2026 13:10:22 | Harjit Bajwa | `GC5QJLFGASQZ7HZ2VAZ64W742QNYQDDEIGIERPF5B6ASY2OSSRGR4PO6` | `6411db676cfac93ed32187ef33f3967a192281c09387edc9c5ca0bf1d5809a75` | 4 |
| 13 | 16/08/2026 13:10:23 | Gurminder Grewal | `GCPQJR75YOIVCISTQ4YBLKNTTJPO2CQ6UTFCCPOE3FEDXXDFYRSJ3SPY` | `c98e29fa1616eba3868e981e159091fbaf3308417ed1e3c1259a1a1233c39258` | 5 |
| 14 | 16/08/2026 13:10:24 | Amrit Cheema | `GAQ6BXPATKI3MIZ2XW7ZJEMQDU7LPXH6WREVX6Z452L3VYGTRSXS47CO` | `fbd3a0a28e0c8f35d187dee9fc68cb9d8be62299dd0023e108e71c37dd35f2a9` | 4 |
| 15 | 16/08/2026 13:10:25 | Sukhdeep Aulakh | `GCREUUNDL4T6YFEFLGOMOOQXGP677FAEFEAIOFF2L4M2U5GPS7IVDZMG` | `e19f020809087318b7479f37b6dcba807b7524452ef16835e2d77be2f69ea70c` | 5 |
| 16 | 16/08/2026 13:10:26 | Balwinder Toor | `GCENJDNWXFXARKVUEXRSKUEZONEPPIYEV4ZH7ZKS7C4S2XF3JRKJV3RH` | `c84cde06fb69c14cca98eb858341aa1b6aec12574e61f43130c9633378d9628a` | 3 |
| 17 | 16/08/2026 13:10:27 | Ranjit Sekhon | `GBJKOIXUFIXY6A7DNK5P7RNGNM2EYCPAIP4IBSIQLTUHKYY6VXMFBFIY` | `141cfb702b5540eec9e3b240b9fadf10b06a64d71f1c27f971786be7bc78512f` | 4 |
| 18 | 16/08/2026 13:10:28 | Davinder Khaira | `GBKPCYFFM3GCSL56VJMEHCEEEG4KKA7U7HQ3KV7STCB22QQ6TILVFLS6` | `cbad685b9dcf0109d846b6c1f091170bbae1ce39cef30e103d38931c7f462a25` | 5 |
| 19 | 16/08/2026 13:10:29 | Rajinder Virk | `GDWDW3XYYYIFGAWM4H5V427R2WIACJN2Z4SUPFPFIGDLAA5JERZ6J5HE` | `8c6b9f93c61f04418e8db6e0c1d1ccd59d981af81c644ae76eb71fec627665e7` | 5 |
| 20 | 16/08/2026 13:10:29 | Kuldeep Mann | `GA273O377VSWOIH3YS7GTYF2BYQO6PMYX46FHNVXRNZVMBQX72CQTA35` | `9a3281fa70d82763167becf7bf801d7ae50b26f255df19722da4c6a81ad88bc5` | 4 |
| 21 | 16/08/2026 13:10:31 | Jaspal Shergill | `GCCEKUCMO7IG6BHQELSMA3PNINPMUXFWZYNKMYG7UPN4VMJ57PO4HUDP` | `51b4aced3c0819fa03abe3993402d581c5686bda57f945b8b13a98310a05c2d8` | 3 |
| 22 | 16/08/2026 13:10:32 | Sukhwinder Waraich | `GBKE2T7PHYTDM6FFQZ23TB7LMYACKX7AO4IITDC7PTIVWTE7VNVG435K` | `3c674000831422960e2ad022a63660df015f288eeed7eaaab8aed6888173d9a7` | 5 |
| 23 | 16/08/2026 13:10:33 | Harbans Sahota | `GAA5DSB26EHIKC4QUZBN4LRJN7QQEXPK7TWAEV6WWGYLB2EBQ5HNQKSF` | `1e4d35c817367b06e3ae4d3bd12c199a84d8a62d3b22397b6c34f78146f1308a` | 4 |
| 24 | 16/08/2026 13:10:34 | Mohinder Rana | `GDXS7MGLKSIPJCPZLYL6RUB2GLD5G2OVUW4EGB35K2KALAMNKIINIIMW` | `ad9ba09631a6e6db93a572a26fb36f8a571e7fb336fd2880ecfbc801d6e8cad0` | 5 |
| 25 | 16/08/2026 13:10:35 | Paramjit Bhullar | `GDDKFGJZQB34DJUUGLDUM7FLZOQDQQFNV7KBZYC7RNPKD3MN4S35UKNZ` | `32434d037ace70ca0b1109e426da5eb0d696c24e8190f9ec1bf47a23fa7c87f9` | 5 |
| 26 | 16/08/2026 13:10:36 | Gurmeet Deol | `GDKU4XJ32MTJUCKUMM2EUPKBAGPVYSYK4LQK5KIOTJTVBOP6MMPPYROT` | `d8728eb166bbf6ff2a52988c45e183d5d2e9ef07db1e667d321e2e17732eea72` | 3 |
| 27 | 16/08/2026 13:10:37 | Harmeet Atwal | `GAHDATCA4COHU5NL4FHEHTFUI7PVNSATKFAHN3OYCDZK5H6NK33PZLDF` | `a212188a6761ca96665a603d647280ddde781d6c80196dbd4295e7a9d464dbba` | 4 |
| 28 | 16/08/2026 13:10:38 | Navjot Nagra | `GAXCVG5FQ76VBR36SHERLWMMSPYSLDILQJOG6JTMLBTZ5MLHM3DN4LFZ` | `a3bed85273e283e35188919fb6abaaa75b201c35f27ba9a50a55e3289c6e89df` | 5 |
| 29 | 16/08/2026 13:10:39 | Jaswinder Mattu | `GDFYXAFQH7J3LVWDC7XMEJ5PRJAUBGGZVAWKS53DIDNBMESBRIZDJQPT` | `ade93e701e3a5905bfaf9cd39a27c57d5faae7a122cf5c3a564e70813a129d27` | 5 |
| 30 | 16/08/2026 13:10:40 | Ravinder Boparai | `GDEAZK5UFJIXA2G6LXZH2FQY2SFCDUYHP2ZJ6ZCV3MPMPFY3DVQ3VKNB` | `35bccd8cfc371a8c7ebb41f45708636165a1b85160c94e4f0f7988d335e8b45b` | 4 |
| 31 | 16/08/2026 13:10:41 | Joginder Randhawa | `GCE2QTZJW5JRRBJEOHLZBCDQAL5BEWG3TYPSC4NUK2D6LURGT7HFQTG4` | `272766af08292df7e39443bc4393642bd03c3b0efe5624ba8066e250edc93297` | 5 |
| 32 | 16/08/2026 13:10:42 | Gurdev Hans | `GBEHQDRGEY5XCIB4BOWRCAPMPJ5JUKVBWP7XSQ4SYGWQ66JUMQ7ZCO6D` | `1f0f52d7194cbaf3d632d9f23da8ecd44a7f58c95109d859048554aad561149f` | 3 |
| 33 | 16/08/2026 13:10:43 | Surinder Johal | `GB63AHHOP2HEXLVQED4LDBGCOA6RJQ3TVRJZ4RV6FNMJBE5QBYUNZKMZ` | `a44558b3e1ee74d57ecc7af71726578efbd714740d487fabbc06e1b97f0fc5a8` | 5 |
| 34 | 16/08/2026 13:10:44 | Charanjit Pannu | `GANKM2UL63ZCRYJFOQ727YGTKK3PWQNBRPYBEWZAYXTZWJDZMDMPI7RT` | `1eca231088b77545fb8ee2446d99a7e8538c69ed61bef4e64705e9e0af209617` | 4 |
| 35 | 16/08/2026 13:10:45 | Tejinder Rai | `GA7DLGABJECKCMERBFPNP6LZOD6YPQKVWSTUPHLHBJ6LYU2B3W4SSS5B` | `d5b1fdbf91ddd8c79f6933cf2c73bffbd2a380fcc9071e92be4f1007a8976709` | 5 |
| 36 | 16/08/2026 13:10:46 | Baljit Mahal | `GD7QLMILUPGTCA52PMWDAFAYYCAW3BIM6TY3QV4J53BYF7BLFUJUV7DQ` | `c126fb630b262d062dec5a6edbd786bbb13648fb390031a573a19167609261f0` | 4 |
| 37 | 16/08/2026 13:10:47 | Satwinder Chahal | `GD3IYKYVZCELJC7VBLX2WST6L4AKBZUCV4MSKEVKYADYSVFY6SO42S34` | `417d5feac708c543a6b57f76b64fc0d9af68a45ad8fa38e0a64d56807afa3941` | 5 |
| 38 | 16/08/2026 13:10:48 | Harkirat Bains | `GDFGBKITS6LO5NLTVGR55FQTKDOQKLTMNAMWUDCZ4YKZOIVVETMUARIG` | `f4aece293b753f6eed3bf55503f9062937cb7fac2f78815ac4c322e884c8eaa3` | 5 |
| 39 | 16/08/2026 13:10:49 | Lovepreet Kahlon | `GBHACV4WVYANROJ5WQH73DTKBOUO72P3TNAZ5TFGVZ2WJIVCN7N5CGIB` | `e2ebfa722cdf74e3276f3d73619c014756267d076532f5398704f36354ebbaed` | 4 |
| 40 | 16/08/2026 13:10:50 | Kuljit Lally | `GAKX7BGPP4O47ZEQSAO3QOPYAJ7BWNNCMXJMM4XQXSUC7W3LFEF3SZ2Z` | `aeca07d03d951f457e73e4e441ee2b04daec24fdcc47a32471d7693427965a94` | 3 |
| 41 | 16/08/2026 13:10:51 | Darshan Purewal | `GC6FUOKB7UWMQIKKEZJKEYHGBH6JDMBPTKJBV2DDF2Z7UU4JHNOECQWT` | `655d75f808a3804f98a45f65175509067066b54a3324bc038c9800093adb1977` | 5 |
| 42 | 16/08/2026 13:10:52 | Avtar Tiwana | `GAXOBJ7AR6OWQDSIDOC5O3HC3OOUSUDD5UV5I52O2EQBUVTHDQAN3VZC` | `adab6d6d02d3430dbbb868a01f1883e90077d732b715442af64379adf75a6a54` | 4 |
| 43 | 16/08/2026 13:10:53 | Daljit Saggu | `GDI2LQCM6BPC66MRZGUWVHSEULR5BSNGKMTP43DDRHXL6BL2D2P5Z3HV` | `d0dabfee6e009d8c1a1e8aa23d7bcf115241f9ee7345be44e8be0f9530203ec2` | 5 |
| 44 | 16/08/2026 13:10:54 | Harvinder Bhogal | `GBDXRPKOCLVCVZ424IILBNWJQ3BAPNAQ2RDJ4VYD2OICAF3FNBP7RDUT` | `a333b012d2ec7e2513b97e7f6dccbdc635990b1267f8e983965284fc818512ff` | 5 |
| 45 | 16/08/2026 13:10:55 | Mandeep Dosanjh | `GASM7LDVRROHZJFNSOCUK7SNOYSP4UV32ZOAIZEBQWOMDXPPAEYI4JFV` | `53eaa8053c8dd1416408ab4ff3f7d6b4f0d2e64b59cbdba07dbcd6fcfd0a13f4` | 3 |
| 46 | 16/08/2026 13:10:56 | Ravneet Dhindsa | `GAYPGBGBJYKZN5ZUCZL3P6W5YKXPSK5XHNJ6RE2FPBOFAO7TFITL6AWF` | `fe50223ea112262ee0ca0474d94b46e307586eeea6246cf77e4d6ec36b253558` | 4 |
| 47 | 16/08/2026 13:10:57 | Gursharan Panesar | `GDC7CCA26GEMHIJYTZYERBCA2HEF6MKK6W7P4VQC5NZIAEUFVWP6THLT` | `b487f20ca67b21bc5a35d2e539d85526ce91f68102c0fa4a6955b8c9b150cac9` | 5 |
| 48 | 16/08/2026 13:10:58 | Swarn Maan | `GDCMAMNJWTIIG4SNJRCRYB7EKSJW3HANBFXYCJAT6WQWA7I57YDQYMFV` | `34c160578756eb9bc5cfb6d957d6c20122b1d7fa10bcb619bb0dcb6e20e412f6` | 5 |
| 49 | 16/08/2026 13:10:59 | Inderjit Sanghera | `GCLXR3UE6HQCVXCPM5ZH254TF5W4OS2JCL42LL36MI6GBZWLR7GCXHBY` | `10a2ad35e6ede5496534033705fe198e85ed969e7d5a1efc37bd8200f5257df4` | 4 |
| 50 | 16/08/2026 13:11:00 | Birinder Kaler | `GB74EJSMMKZF3YY2NXCL4H4TTJB6B6KS6YMEHPHNVEOH5V7ZEQ6QDV7X` | `7d24905573a28c1f9d253e6dc9f81bb5e102af311fd3f55d0b6551f11a323705` | 5 |
| 51 | 16/08/2026 13:13:24 | Rohan Sharma | `GBI4N5PZBYNSORDKPPJYNZ6GSGS7PMT6AQRCR7JCDRUAHLVYVBOKGXZW` | `074863afd3d9bf693fe9c86d9cedfd89a63f9ab1dc95223384434dd93edbbe10` | 5 |
| 52 | 16/08/2026 13:13:25 | Priya Kapoor | `GD2TB5RBICPQNSONC6ZL5LQTOAPK6RLABDN4M665LHG6AC2Z4HJRGF6R` | `ef3d434b07f1f4eb6dee0a3d5812457a5b8115d211114ba24d84378dc344466e` | 4 |
| 53 | 16/08/2026 13:13:27 | Kunal Malhotra | `GCC7J3KEIEXNP5KOMOJ5VZKUEECYP6HN6LHMKUS2M3VSJSRCXXIY3J3X` | `ed017033585fffb379cf80defa99249dc9b43297833bab9f17d16af15c86850d` | 5 |
| 54 | 16/08/2026 13:13:28 | Aditi Verma | `GDMYI5VPRTFLK3GMYSYLJBX2PUEEFIFBIYNHWR3W2PS3UHG3LVKACHZT` | `6ddc247a8640b3f43505eb2c59e33a8a2c2d7c41edf705ac4f67267a3643d963` | 3 |
| 55 | 16/08/2026 13:13:29 | Vikram Gupta | `GAUWM7N2QT5JEGFKAG45GNGWXOT6KDM3TOPWFCZ7R4YWGNNZ66DQC2NW` | `a652ecdc8b59b7201b5a714f736e099e6795878c993d4205324966e259567257` | 5 |
| 56 | 16/08/2026 13:13:30 | Neha Saxena | `GC4EJATCICW5JWBU3QIH4YIMBYEI5RMXIJGEN24GWCJ4MOE2E4MFKNJP` | `4b49970ed762d440ff73a20bbbcf62547b752cb4ce48cb0aa9eb35348b900237` | 4 |
| 57 | 16/08/2026 13:13:31 | Arjun Khanna | `GA42MGK5D3DIAVWJK5WGR6ZRJBUUOLF4TF24WSU2DMWPWLBNLSL5RVDF` | `333db5dee9da945a0a6eb5a664c687823aba237e5cbb2c139ce01855e38d65d8` | 5 |
| 58 | 16/08/2026 13:13:32 | Sneha Bhatia | `GBSWZI4HA2X2G3UHCJTSR5X6JQ2AGSXM5DMKUGCJTOPFILUZRDVCYZPX` | `b121f8eb3f2bed2bc764a40f7dcb2de76057b2a43427c65ce8bccf05bb49a0bd` | 4 |
| 59 | 16/08/2026 13:13:34 | Rahul Taneja | `GDR27AM54CGUJJIG2WZUH723I4ZQJWHHHOLDG4VWRL3MIHMARYDY5RX2` | `d03c96ceb9baa128da9befeec204a60a89e7663b76fe7c60ced55a1966c11c3e` | 3 |
| 60 | 16/08/2026 13:13:35 | Pooja Grover | `GBED6IC5O5CRNDVI5B6NOI7K4H6ZGED3ZF5X3QZON4SULR5XTG5FUTNM` | `6b5c1452347b31208db3ca40d4e289adb98d55dd7a005d46a3c2475b72017390` | 5 |

## Analytics

This project uses **Mixpanel** (`mixpanel-browser`) for product analytics, tracked client-side. The stable user identity is the connected Stellar wallet address — it is passed to `mixpanel.identify()` after a successful wallet connect and `mixpanel.reset()` on disconnect.

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `wallet_connected` | User connects their Stellar wallet successfully | `wallet_id` |
| `bill_split_initiated` | User clicks "Review & Confirm" on a split | `total_amount`, `recipient_count`, `split_amount` |
| `bill_split_completed` | All XLM payments for a split succeed | `total_amount`, `recipient_count`, `succeeded_count` |
| `bill_split_failed` | One or more payments for a split fail | `total_amount`, `recipient_count`, `succeeded_count`, `failed_count` |

The Mixpanel project token is read from `VITE_MIXPANEL_TOKEN` (with a fallback in `client/src/lib/mixpanel.ts`). See `AGENTS.md` before adding or modifying any tracking.

## License

MIT
