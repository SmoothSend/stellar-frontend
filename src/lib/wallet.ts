import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit';
import { config } from './config';

let kit: StellarWalletsKit | null = null;
let isConnecting = false;
let hasDisconnected = false; // Track explicit disconnect

export function getWalletKit(): StellarWalletsKit {
  if (!kit) {
    kit = new StellarWalletsKit({
      network: config.network === 'testnet' ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC,
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
    });
  }
  return kit;
}

export async function connectWallet(): Promise<{ address: string }> {
  if (isConnecting) {
    throw new Error('Connection already in progress');
  }

  isConnecting = true;
  hasDisconnected = false; // Reset disconnect flag on new connection
  const walletKit = getWalletKit();

  try {
    await walletKit.openModal({
      onWalletSelected: async (option) => {
        walletKit.setWallet(option.id);
      },
    });

    const { address } = await walletKit.getAddress();
    return { address };
  } finally {
    isConnecting = false;
  }
}

export async function signTransaction(xdr: string): Promise<string> {
  const walletKit = getWalletKit();
  const { address } = await walletKit.getAddress();

  const { signedTxXdr } = await walletKit.signTransaction(xdr, {
    networkPassphrase: config.networkPassphrase,
    address,
  });

  return signedTxXdr;
}

export async function getConnectedAddress(): Promise<string | null> {
  // If user explicitly disconnected, don't auto-reconnect
  if (hasDisconnected) {
    return null;
  }

  try {
    const walletKit = getWalletKit();
    const { address } = await walletKit.getAddress({ skipRequestAccess: true });
    return address;
  } catch {
    return null;
  }
}

/**
 * Properly disconnect wallet
 */
export async function disconnectWallet(): Promise<void> {
  hasDisconnected = true; // Mark as explicitly disconnected

  if (kit) {
    try {
      await kit.disconnect();
    } catch (e) {
      console.warn('Disconnect error:', e);
    }
  }
  kit = null;
  isConnecting = false;
}
