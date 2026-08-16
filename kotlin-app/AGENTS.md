# SplitBill Native Android App (kotlin-app)

This is the native Kotlin Android implementation of SplitBill, alongside the web (`client/`) and
React Native (`mobile/`) apps. It targets full parity with the web/mobile feature set.

## Tech Stack

| Detail | Value |
|---|---|
| **Platform** | Android (native), Kotlin 2.2 + Jetpack Compose (Material 3), MVVM |
| **Architecture** | Single-Activity + Compose Navigation, ViewModels (StateFlow) |
| **Wallet** | Self-custodial Stellar keypair, stored in Android Keystore (EncryptedSharedPreferences, AES-256-GCM) |
| **Stellar SDK** | `com.soneso.stellar:stellar-sdk:1.11.0` (Soneso KMP SDK) |
| **REST client** | Retrofit + OkHttp + Gson |
| **Network** | Stellar Testnet (`Test SDF Network ; September 2015`) |
| **Contract** | `record_split`, `get_splits`, `get_total_splits` on `CBPZMTQ46FGY32Q3WPSORPIAW46Q2BLP5WAU2TJCSDQCOSR4TN5XFG62` |

## Build

- Requires JDK 17+, Android SDK (API 36), Gradle wrapper (8.14.5).
- `.\gradlew :app:assembleDebug` to build.
- Build config values (`STELLAR_CONTRACT`, `STELLAR_HORIZON`, `STELLAR_RPC`, `API_BASE_URL`,
  `MIXPANEL_TOKEN`) live in `app/build.gradle.kts`; override via environment variables if present.

## Mixpanel Analytics

This app follows the root `AGENTS.md` Mixpanel rules and uses the official
**Mixpanel Android SDK** (`com.mixpanel.android:mixpanel-android:8.2.0`).

- All tracking goes through the shared `analytics/MixpanelTracker.kt` wrapper. Do not import
  `MixpanelAPI` directly in feature code.
- Events: `wallet_connected` (after keypair created/imported/restored), `bill_split_initiated`
  (on confirm), `bill_split_completed` (all payments succeeded), `bill_split_failed` (any failed).
- Identity = the Stellar public key (`G...`). Call `identify()` only after the keypair is
  confirmed; call `reset()` on disconnect.
- `wallet_id` property = `android_self_custody`.
- Do not add other analytics tools.

## Conventions

- `snake_case` Mixpanel event/property names, `is_` prefix for booleans, no PII.
- One source of truth for chain/network constants: `Config.kt` (reads `BuildConfig`).
- No comments in new code unless explicitly requested.
