import * as StellarSdk from '@stellar/stellar-sdk';

const PROXY_URL = 'https://proxy.smoothsend.xyz';

// ========== SMOOTHSEND SDK - Proxy routing (START) ==========
// When VITE_SMOOTHSEND_API_KEY is set, ALL relayer calls go through proxy.smoothsend.xyz
// Frontend never talks to relayer directly - SDK/proxy handles routing
/** API base URL + headers. With API key: proxy. Without: direct relayer. */
export function getStellarApiConfig(): {
  baseUrl: string;
  headers: Record<string, string>;
} {
  const apiKey = import.meta.env.VITE_SMOOTHSEND_API_KEY;
  if (apiKey) {
    return {
      baseUrl: PROXY_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Chain': 'stellar',
      },
    };
  }
  return {
    baseUrl: import.meta.env.VITE_RELAYER_URL || 'http://localhost:3001',
    headers: { 'Content-Type': 'application/json' },
  };
}
// ========== SMOOTHSEND SDK - Proxy routing (END) ==========

export const config = {
  // Network
  network: 'testnet' as const,
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',

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
