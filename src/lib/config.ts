import * as StellarSdk from '@stellar/stellar-sdk';

export const config = {
  // Network
  network: 'testnet' as const,
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',

  // Relayer (set VITE_RELAYER_URL in .env or Vercel env vars)
  relayerUrl: import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001',

  // Assets
  assets: {
    XLM: {
      code: 'XLM',
      issuer: null,
      decimals: 7,
      name: 'Stellar Lumens',
    },
    USDC: {
      code: 'USDC',
      issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', // Circle testnet
      decimals: 7,
      name: 'USD Coin',
    },
    EURC: {
      code: 'EURC',
      issuer: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO', // Circle testnet
      decimals: 7,
      name: 'Euro Coin',
    },
  },

  // Explorer
  explorerUrl: 'https://stellar.expert/explorer/testnet',
};

export type AssetCode = keyof typeof config.assets;
