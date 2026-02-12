import * as StellarSdk from '@stellar/stellar-sdk';
import { config, getStellarApiConfig, AssetCode } from './config';

const server = new StellarSdk.Horizon.Server(config.horizonUrl);

export interface AccountBalance {
  asset: string;
  balance: string;
  issuer?: string; // null for XLM
}

export interface ClaimableBalance {
  id: string;
  asset: string;
  amount: string;
  sponsor: string;
  lastModifiedLedger: number;
  claimants: any[];
}

export async function getAccountBalances(address: string): Promise<AccountBalance[]> {
  // C-addresses (Soroban contracts) can't be looked up on Horizon
  if (address.startsWith('C')) {
    return [];
  }
  try {
    const account = await server.loadAccount(address);
    return account.balances.map((b) => {
      if (b.asset_type === 'native') {
        return { asset: 'XLM', balance: b.balance, issuer: undefined };
      }
      const creditBalance = b as StellarSdk.Horizon.HorizonApi.BalanceLineAsset;
      return {
        asset: `${creditBalance.asset_code}`,
        balance: b.balance,
        issuer: creditBalance.asset_issuer,
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
  // C-addresses exist on Soroban, not Horizon
  if (address.startsWith('C')) {
    return true;
  }
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

/**
 * Check if destination has a trustline for the given asset (code + issuer)
 */
export async function checkTrustline(
  destinationAddress: string,
  assetCode: AssetCode
): Promise<boolean> {
  // XLM doesn't need a trustline
  if (assetCode === 'XLM') {
    console.log('[SmartPayment] XLM - no trustline needed');
    return true;
  }

  // C-addresses (Soroban contracts) don't use trustlines
  if (destinationAddress.startsWith('C')) {
    console.log('[SmartPayment] C-address destination — no trustline check needed');
    return true;
  }

  try {
    const balances = await getAccountBalances(destinationAddress);
    console.log('[SmartPayment] Destination balances:', balances);

    // Get the expected issuer for this asset
    const expectedIssuer = config.assets[assetCode].issuer;
    console.log(`[SmartPayment] Looking for ${assetCode} with issuer ${expectedIssuer}`);

    // Check if destination has trustline for BOTH the asset code AND the correct issuer
    const hasTrustline = balances.some(b =>
      b.asset === assetCode && b.issuer === expectedIssuer
    );
    console.log(`[SmartPayment] Has trustline for ${assetCode} (correct issuer):`, hasTrustline);
    return hasTrustline;
  } catch (error) {
    console.log('[SmartPayment] Error checking trustline:', error);
    // If account doesn't exist, it can still receive XLM but not other assets
    return false;
  }
}

/**
 * Build a claimable balance transaction for recipients without trustlines
 */
export async function buildClaimableBalanceTransaction(
  senderAddress: string,
  destinationAddress: string,
  amount: string,
  assetCode: AssetCode
): Promise<StellarSdk.Transaction> {
  const account = await server.loadAccount(senderAddress);
  const asset = getAsset(assetCode);

  // Create claimable balance that the destination can claim
  // Claimant can claim anytime (unconditional predicate)
  const claimants = [
    new StellarSdk.Claimant(
      destinationAddress,
      StellarSdk.Claimant.predicateUnconditional()
    )
  ];

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: "0", // Relayer will pay the fee via Fee Bump
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.createClaimableBalance({
        asset: asset,
        amount: amount,
        claimants: claimants,
      })
    )
    .setTimeout(30)
    .build();

  return transaction;
}

/**
 * Smart payment: check trustline and choose the right transaction type
 */
export async function buildSmartPaymentTransaction(
  senderAddress: string,
  destinationAddress: string,
  amount: string,
  assetCode: AssetCode
): Promise<{ transaction: StellarSdk.Transaction; isClaimable: boolean }> {
  console.log('[SmartPayment] Building smart payment...', { senderAddress, destinationAddress, amount, assetCode });

  const hasTrustline = await checkTrustline(destinationAddress, assetCode);
  console.log('[SmartPayment] Decision:', hasTrustline ? 'Direct Payment' : 'Claimable Balance');

  if (hasTrustline) {
    const transaction = await buildPaymentTransaction(
      senderAddress,
      destinationAddress,
      amount,
      assetCode
    );
    return { transaction, isClaimable: false };
  } else {
    console.log('[SmartPayment] Creating claimable balance transaction...');
    const transaction = await buildClaimableBalanceTransaction(
      senderAddress,
      destinationAddress,
      amount,
      assetCode
    );
    console.log('[SmartPayment] Claimable balance transaction built!');
    return { transaction, isClaimable: true };
  }
}

/**
 * Submit signed XDR via proxy (SDK) or direct relayer.
 * All calls go through proxy when VITE_SMOOTHSEND_API_KEY is set.
 */
export async function relayTransaction(signedXDR: string): Promise<{
  success: boolean;
  hash?: string;
  error?: string;
  explorerUrl?: string;
}> {
  // const apiKey = import.meta.env.VITE_SMOOTHSEND_API_KEY;
  // if (apiKey) {
  //   // ========== SMOOTHSEND SDK INTEGRATION - START ==========
  //   // Gasless tx via @smoothsend/sdk → proxy.smoothsend.xyz → Stellar relayer
  //   try {
  //     const { SmoothSendSDK } = await import('@smoothsend/sdk');
  //     const sdk = new SmoothSendSDK({ apiKey, network: config.network });
  //     const result = await sdk.submitStellarTransaction(signedXDR);
  //     return {
  //       success: true,
  //       hash: result.txHash,
  //       explorerUrl: result.explorerUrl ?? `${config.explorerUrl}/tx/${result.txHash}`,
  //     };
  //   } catch (error: any) {
  //     return { success: false, error: error.message || 'SDK relay failed' };
  //   }
  //   // ========== SMOOTHSEND SDK INTEGRATION - END ==========
  // }

  const { baseUrl, headers } = getStellarApiConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/relayer/gasless-transaction`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ signedTransaction: signedXDR }),
    });
    const data = await res.json();
    if (data.success) {
      return {
        success: true,
        hash: data.hash || data.txnHash,
        explorerUrl: `${config.explorerUrl}/tx/${data.hash || data.txnHash}`,
      };
    }
    return { success: false, error: data.error || 'Transaction failed' };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to connect' };
  }
}

export async function checkRelayerHealth(): Promise<{
  healthy: boolean;
  balance?: string;
  address?: string;
}> {
  const { baseUrl, headers } = getStellarApiConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/relayer/stellar/health`, { headers });
    const data = await res.json();
    return {
      healthy: data.status === 'healthy',
      balance: data.relayer?.balance,
      address: data.relayer?.address,
    };
  } catch {
    return { healthy: false };
  }
}

export async function fetchClaimableBalances(address: string): Promise<ClaimableBalance[]> {
  const { baseUrl, headers } = getStellarApiConfig();
  try {
    const res = await fetch(`${baseUrl}/api/v1/relayer/stellar/claimable-balances/${address}`, { headers });
    const data = await res.json();
    return data.success ? data.balances : [];
  } catch (error) {
    console.error('Failed to fetch claimable balances:', error);
    return [];
  }
}

export async function buildClaimTransaction(
  claimant: string,
  balanceId: string,
  _asset?: string
): Promise<StellarSdk.Transaction> {
  const { baseUrl, headers } = getStellarApiConfig();
  const res = await fetch(`${baseUrl}/api/v1/relayer/stellar/claim`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ claimant, balanceId }),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to build claim transaction');
  }
  return StellarSdk.TransactionBuilder.fromXDR(
    data.unsignedXDR,
    config.networkPassphrase
  ) as StellarSdk.Transaction;
}
