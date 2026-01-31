import * as StellarSdk from '@stellar/stellar-sdk';

export const config = {
  // Network
  network: 'testnet' as const,
  networkPassphrase: StellarSdk.Networks.TESTNET,
  horizonUrl: 'https://horizon-testnet.stellar.org',
  
  // Relayer
  relayerUrl: 'http://localhost:3001',
  
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
  },
  
  // Explorer
  explorerUrl: 'https://stellar.expert/explorer/testnet',
};

export type AssetCode = keyof typeof config.assets;
