import * as StellarSdk from '@stellar/stellar-sdk';
import { config, AssetCode } from './config';

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

export interface AccountBalance {
  asset: string;
  balance: string;
}

export async function getAccountBalances(address: string): Promise<AccountBalance[]> {
  try {
    const account = await server.loadAccount(address);
    return account.balances.map((b) => {
      if (b.asset_type === 'native') {
        return { asset: 'XLM', balance: b.balance };
      }
      const creditBalance = b as StellarSdk.Horizon.HorizonApi.BalanceLineAsset;
      return {
        asset: `${creditBalance.asset_code}`,
        balance: b.balance,
      };
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function accountExists(address: string): Promise<boolean> {
  try {
    await server.loadAccount(address);
    return true;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false;
    }
    throw error;
  }
}

export function getAsset(assetCode: AssetCode): StellarSdk.Asset {
  const assetConfig = config.assets[assetCode];
  if (assetCode === 'XLM') {
    return StellarSdk.Asset.native();
  }
  return new StellarSdk.Asset(assetConfig.code, assetConfig.issuer!);
}

export async function buildPaymentTransaction(
  senderAddress: string,
  destinationAddress: string,
  amount: string,
  assetCode: AssetCode
): Promise<StellarSdk.Transaction> {
  const account = await server.loadAccount(senderAddress);
  const asset = getAsset(assetCode);
  
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: "0", // Relayer will pay the fee via Fee Bump
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: destinationAddress,
        asset: asset,
        amount: amount,
      })
    )
    .setTimeout(30)
    .build();
  
  return transaction;
}

export async function relayTransaction(signedXDR: string): Promise<{
  success: boolean;
  hash?: string;
  error?: string;
  explorerUrl?: string;
}> {
  try {
    const response = await fetch(`${config.relayerUrl}/api/v1/relayer/gasless-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signedTransaction: signedXDR,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        hash: data.hash || data.txnHash,
        explorerUrl: `${config.explorerUrl}/tx/${data.hash || data.txnHash}`,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Transaction failed',
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to connect to relayer',
    };
  }
}

export async function checkRelayerHealth(): Promise<{
  healthy: boolean;
  balance?: string;
  address?: string;
}> {
  try {
    const response = await fetch(`${config.relayerUrl}/api/v1/relayer/stellar/health`);
    const data = await response.json();
    
    return {
      healthy: data.status === 'healthy',
      balance: data.relayer?.balance,
      address: data.relayer?.address,
    };
  } catch {
    return { healthy: false };
  }
}
