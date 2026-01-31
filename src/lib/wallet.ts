import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit';
import { config } from './config';

let kit: StellarWalletsKit | null = null;
let isConnecting = false;

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
  // Prevent multiple connection attempts
  if (isConnecting) {
    throw new Error('Connection already in progress');
  }

  isConnecting = true;
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
  try {
    const walletKit = getWalletKit();
    const { address } = await walletKit.getAddress({ skipRequestAccess: true });
    return address;
  } catch {
    return null;
  }
}

/**
 * Properly disconnect wallet using the kit's disconnect method
 */
export async function disconnectWallet(): Promise<void> {
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
