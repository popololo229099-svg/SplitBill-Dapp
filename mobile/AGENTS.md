# Expo SDK 57

This is an Expo (React Native) app. Read the exact versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before writing any code — APIs change between SDK releases.

## Project layout

- `App.tsx` — root: navigation (landing / app) and the bottom tab bar
- `src/screens/` — Landing, Split Bill, History, On-Chain event log
- `src/context/WalletContext.tsx` — self-custody wallet state (keypair in `expo-secure-store`)
- `src/lib/stellar.ts` — Horizon / Soroban RPC / contract helpers (mirrors `client/src/utils/contract.ts`)
- `src/lib/mixpanel.ts` — Mixpanel tracking via the HTTP Tracking API (no native module, works in Expo Go)

## Analytics

The mobile app follows the tracking rules in the repository root `AGENTS.md` (Mixpanel only). Because
`mixpanel-browser` cannot run in React Native, the mobile app uses the Mixpanel **HTTP Tracking API**
(`POST https://api.mixpanel.com/track`) with the same events: `wallet_connected`,
`bill_split_initiated`, `bill_split_completed`, `bill_split_failed`. Identity is the Stellar public
key. Token is read from `EXPO_PUBLIC_MIXPANEL_TOKEN` (fallback in `src/lib/mixpanel.ts`). Do not
introduce other analytics tools.

## Commands

- `npm start` — start Expo dev server (Expo Go)
- `npm run typecheck` — TypeScript check
- `npm run build` — export a production Android JS bundle
