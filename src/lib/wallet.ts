import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from '@creit.tech/stellar-wallets-kit';
import { config } from './config';

let kit: StellarWalletsKit | null = null;

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
  const walletKit = getWalletKit();
  
  await walletKit.openModal({
    onWalletSelected: async (option) => {
      walletKit.setWallet(option.id);
    },
  });
  
  const { address } = await walletKit.getAddress();
  return { address };
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
