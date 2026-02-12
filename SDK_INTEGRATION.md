# SmoothSend SDK Integration (Stellar Frontend)

This demo uses the **@smoothsend/sdk** for gasless Stellar transactions. Judges can find the integration points by searching for `SMOOTHSEND SDK` in the codebase.

---

## SDK Integration Points

### 1. TransferForm.tsx (Main Send Flow)
**File:** `src/components/TransferForm.tsx`

```tsx
// ========== SMOOTHSEND SDK - Gasless submit (START) ==========
const result = await relayTransaction(signedXDR);
// ========== SMOOTHSEND SDK - Gasless submit (END) ==========
```

User signs in wallet → `relayTransaction()` submits via SDK → proxy → Stellar relayer.

### 2. stellar.ts (SDK Usage)
**File:** `src/lib/stellar.ts`

```ts
// ========== SMOOTHSEND SDK INTEGRATION - START ==========
const { SmoothSendSDK } = await import('@smoothsend/sdk');
const sdk = new SmoothSendSDK({ apiKey, network: config.network });
const result = await sdk.submitStellarTransaction(signedXDR);
// ========== SMOOTHSEND SDK INTEGRATION - END ==========
```

### 3. config.ts (Proxy Routing)
**File:** `src/lib/config.ts`

When `VITE_SMOOTHSEND_API_KEY` is set, all API calls (health, claimable balances, claim, gasless-transaction) go through **proxy.smoothsend.xyz** instead of the relayer directly. Frontend never needs the relayer URL.

---

## Flow

```
User signs TX (Freighter) 
  → relayTransaction(signedXDR) 
  → SmoothSendSDK.submitStellarTransaction() 
  → proxy.smoothsend.xyz (API key auth)
  → Stellar relayer (Fee Bump)
  → Stellar network
```

---

## Setup

1. Add `VITE_SMOOTHSEND_API_KEY=pk_nogas_xxx` to `.env`
2. Add `http://localhost:5173` to CORS origins in [dashboard.smoothsend.xyz](https://dashboard.smoothsend.xyz)

---

## Docs

- **SDK README:** [npmjs.com/package/@smoothsend/sdk](https://www.npmjs.com/package/@smoothsend/sdk)
- **Integration Guide:** `../docs/STELLAR_SDK_INTEGRATION.md`
