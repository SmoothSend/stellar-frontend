import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit';
import { config } from './config';

let kit: StellarWalletsKit | null = null;
let isModalOpen = false;

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
  // Prevent multiple modals
  if (isModalOpen) {
    throw new Error('Wallet modal is already open');
  }

  const walletKit = getWalletKit();

  isModalOpen = true;
  try {
    await walletKit.openModal({
      onWalletSelected: async (option) => {
        walletKit.setWallet(option.id);
      },
    });

    const { address } = await walletKit.getAddress();
    return { address };
  } finally {
    isModalOpen = false;
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
    const { address } = await walletKit.getAddress();
    return address;
  } catch {
    return null;
  }
}

/**
 * Disconnect wallet and reset the kit
 */
export function disconnectWallet(): void {
  kit = null;
  isModalOpen = false;
}

