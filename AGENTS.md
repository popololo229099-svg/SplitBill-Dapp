# Analytics Tracking — Mixpanel

This project uses **Mixpanel** for all product analytics. Mixpanel is the single source of truth for event tracking, user identification, and behavioral data. **Vercel Analytics** (`@vercel/analytics/react`) is also enabled for infrastructure-level web vitals and page views (see "Vercel Analytics" below). Do not introduce any other analytics tools, SDKs, or tracking libraries without explicit instruction from a user.

---

## Before You Add or Modify Any Tracking

⛔ **Do not write Mixpanel tracking code without reading this file first.**

Wrong assumptions about platform, identity, or consent will produce broken Mixpanel data that requires manual cleanup or data deletion requests.

### Mandatory checklist before writing any Mixpanel code

- [x] Confirm you are using the correct Mixpanel SDK for this project's platform (see Tech Stack below)
- [x] Check if this project routes data through a CDP — if yes, send Mixpanel events through the CDP, not the Mixpanel SDK directly
- [x] Check if consent gating is required — if this project serves EU or California users, no Mixpanel events may fire before user consent
- [x] Review the existing Mixpanel tracking plan below before adding new events

---

## Tech Stack

| Detail | Value |
|---|---|
| **Platform** | React 19 + Vite 8 (web, TypeScript) |
| **Mixpanel SDK** | mixpanel-browser |
| **SDK version** | ^2.82.0 |
| **Tracking method** | client-side |
| **CDP (if any)** | none |
| **Consent required** | no |
| **Mixpanel project token location** | `client/src/lib/mixpanel.ts` — `import.meta.env.VITE_MIXPANEL_TOKEN` (falls back to the project token) |

---

## Mixpanel Initialization

Mixpanel is initialized in:

**File:** `client/src/lib/mixpanel.ts`

```
// Initialized lazily on first use via ensureInit() inside
// track()/identifyUser()/resetUser(). Do not create additional
// Mixpanel instances or call mixpanel.init() elsewhere.
```

**Do not:**
- Initialize Mixpanel in multiple places
- Create separate Mixpanel instances per component or module
- Import Mixpanel directly in feature files — use the shared `lib/mixpanel.ts` wrappers

---

## Mixpanel Identity

Mixpanel identity is managed through two calls:

| Action | When to call | Code location |
|---|---|---|
| `mixpanel.identify(user_id)` | On wallet connect and on session restore | `client/src/context/WalletContext.tsx` |
| `mixpanel.reset()` | On logout (wallet disconnect) | `client/src/context/WalletContext.tsx` |

**Rules:**
- This app has no email/password account system. The stable user ID is the Stellar wallet address (e.g., `G...`), passed to `identifyUser()` after a successful wallet connect.
- Call `mixpanel.identify()` **after** the wallet address is confirmed (after connect succeeds, not on button click)
- Call `mixpanel.reset()` on every disconnect path — this clears the Mixpanel distinct_id and generates a new anonymous ID
- Never call `mixpanel.identify()` with a different user ID without calling `mixpanel.reset()` first

---

## Mixpanel Tracking Plan

These are the Mixpanel events currently tracked in this project. **All new Mixpanel events must follow the same conventions.**

### Naming conventions

- Mixpanel event names: `snake_case`, past tense verb + noun (e.g., `report_generated`, `item_added_to_cart`)
- Mixpanel property names: `snake_case` (e.g., `sign_up_method`, `plan_type`)
- No abbreviations in Mixpanel event or property names — use full words
- Boolean Mixpanel properties: use `is_` prefix (e.g., `is_first_time`)

### Current Mixpanel events

This app has no account-creation flow, so there is no `sign_up_completed` event; `wallet_connected` is the activation/identity event instead.

| Mixpanel Event | Trigger | Key Properties | File |
|---|---|---|---|
| `wallet_connected` | User connects their Stellar wallet successfully (Value Moment) | `wallet_id` (when known) | `client/src/context/WalletContext.tsx` |
| `bill_split_initiated` | User clicks "Review & Confirm" on a split | `total_amount` (number), `recipient_count` (number), `split_amount` (number) | `client/src/components/SplitBillCalculator.tsx` |
| `bill_split_completed` | All XLM payments for a split succeed | `total_amount`, `recipient_count`, `succeeded_count` | `client/src/components/SplitBillCalculator.tsx` |
| `bill_split_failed` | One or more payments for a split fail | `total_amount`, `recipient_count`, `succeeded_count`, `failed_count` | `client/src/components/SplitBillCalculator.tsx` |

---

## How to Add a New Mixpanel Event

1. **Check the tracking plan above** — if the Mixpanel event already exists, use it. Do not create duplicate Mixpanel events.
2. **Name the Mixpanel event** using the conventions above: `snake_case`, past tense, descriptive.
3. **Define Mixpanel properties** — only include properties available at the moment the event fires. Do not fetch additional data just for Mixpanel tracking.
4. **Place the Mixpanel tracking call** at the right moment:
   - Track Mixpanel events **after** the action succeeds (after DB write, after API response), not on button click or form submit
   - Track Mixpanel events **after** `mixpanel.identify()` if the event is tied to a logged-in action
5. **Update this file** — add the new Mixpanel event to the tracking plan table above.
6. **Verify in Mixpanel Live View** — confirm the event appears in Mixpanel with correct properties before considering it done.

### Mixpanel event template

```
track('[event_name]', {
  property_name: value,
  property_name: value,
});
```

---

## What Not to Do

- **Do not introduce other analytics tools.** This project uses Mixpanel. All tracking goes through Mixpanel.
- **Do not track Mixpanel events on page load** unless explicitly measuring page views. Mixpanel events represent user actions, not navigation.
- **Do not track PII as Mixpanel properties** — no emails, full names, phone numbers, IP addresses, or payment details in Mixpanel event properties.
- **Do not fire Mixpanel events inside loops** — each Mixpanel event call is a network request.
- **Do not hardcode the Mixpanel project token** — read it from environment config.
- **Do not skip `mixpanel.reset()` on logout** — failing to reset causes Mixpanel to merge the next user's events with the previous user's profile.
- **Do not call `mixpanel.identify()` before the user is authenticated** — premature identification creates orphaned Mixpanel profiles.

---

## Vercel Analytics

Vercel Analytics tracks **page views and web vitals** at the infrastructure level. It is intentionally separate from Mixpanel: Mixpanel captures user *actions*, Vercel Analytics captures *traffic and performance*.

**File:** `client/src/main.tsx` — `<Analytics />` from `@vercel/analytics/react` is rendered once at the app root.

- Do not use Vercel Analytics for behavioral/event tracking — that stays in Mixpanel.
- Do not add Speed Insights or other Vercel packages without explicit instruction.
- Data is only captured on Vercel deployments (the `@vercel/analytics` script loads against the deployment environment).
