import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getStellarApiConfig } from '../../lib/config';
import { signTransaction } from '../../lib/wallet';
import { Loader2, ArrowLeft, Send, CheckCircle2, ExternalLink } from 'lucide-react';

interface SmartAccountSendProps {
  cAddress: string;
  ownerAddress: string;
  onCancel: () => void;
  onSuccess: () => void;
}

type SendState = 'form' | 'building' | 'signing' | 'submitting' | 'success' | 'error';

export function SmartAccountSend({ cAddress, ownerAddress, onCancel, onSuccess }: SmartAccountSendProps) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('XLM');
  const [state, setState] = useState<SendState>('form');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSend = async () => {
    if (!destination || !amount) return;

    setError(null);

    try {
      const { baseUrl, headers } = getStellarApiConfig();

      // ── Step 1: Ask relayer to build the Soroban SAC transfer tx ──
      setState('building');
      const buildRes = await fetch(`${baseUrl}/api/v1/relayer/stellar/c-address/build-transfer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          from: ownerAddress,   // User's G-address (signs the owner auth)
          cAddress,             // Smart Account C-address (holds the funds)
          destination,
          asset,
          amount,
        }),
      });

      if (!buildRes.ok) {
        const data = await buildRes.json().catch(() => ({}));
        throw new Error(data.error || `Build failed (${buildRes.status})`);
      }

      const { unsignedXDR } = await buildRes.json();

      // ── Step 2: User signs the tx with Freighter ──
      setState('signing');
      const signedXDR = await signTransaction(unsignedXDR);

      // ── Step 3: Relayer co-signs (fee payer) and submits ──
      setState('submitting');
      const submitRes = await fetch(`${baseUrl}/api/v1/relayer/stellar/c-address/submit-transfer`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ signedXDR }),
      });

      if (!submitRes.ok) {
        const data = await submitRes.json().catch(() => ({}));
        throw new Error(data.error || 'Submit failed');
      }

      const result = await submitRes.json();
      setTxHash(result.txHash || null);
      setState('success');
    } catch (err: any) {
      console.error('Smart Account send failed:', err);
      // Freighter rejection
      if (err.message?.includes('User declined')) {
        setError('Transaction rejected by wallet');
      } else if (err.message?.includes('not sufficient to spend') || err.message?.includes('zero balance')) {
        setError(`Insufficient ${asset} balance in your Smart Account. Fund it first before sending.`);
      } else {
        setError(err.message || 'Transaction failed');
      }
      setState('error');
    }
  };

  const explorerUrl = txHash ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : null;

  // Success view
  if (state === 'success') {
    return (
      <Card className="p-8 text-center backdrop-blur-2xl space-y-6">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
        <div>
          <h3 className="text-xl font-bold text-white">Sent!</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {amount} {asset} sent via Soroban SAC transfer
          </p>
        </div>
        {txHash && (
          <p className="text-[10px] sm:text-xs font-mono text-white/30 break-all leading-relaxed">
            tx: {txHash}
          </p>
        )}
        <div className="flex flex-col gap-3">
          {explorerUrl && (
            <Button
              className="w-full h-12 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20"
              onClick={() => window.open(explorerUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Stellar Expert
            </Button>
          )}
          <Button
            className="w-full h-12 rounded-2xl"
            onClick={onSuccess}
          >
            Back to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onCancel} className="text-muted-foreground hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <h3 className="text-lg font-bold text-white">Send from Smart Account</h3>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Asset selector */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Asset</label>
          <div className="flex gap-2">
            {['XLM', 'USDC', 'EURC'].map((a) => (
              <Button
                key={a}
                variant={asset === a ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAsset(a)}
                className={`flex-1 rounded-xl ${
                  asset === a
                    ? 'bg-primary text-white'
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white'
                }`}
              >
                {a}
              </Button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full h-14 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-lg font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Destination Address</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G... or C..."
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
          />
          <p className="text-xs text-white/20">
            Supports both G-addresses (classic) and C-addresses (Soroban)
          </p>
        </div>
      </div>

      {/* From info */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 text-xs">
          <span className="text-muted-foreground shrink-0">From (your wallet)</span>
          <span className="font-mono text-white/60 truncate max-w-full sm:max-w-[180px] md:max-w-[240px]" title={ownerAddress}>
            {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-6)}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 text-xs">
          <span className="text-muted-foreground shrink-0">Smart Account</span>
          <span className="font-mono text-white/60 truncate max-w-full sm:max-w-[180px] md:max-w-[240px]" title={cAddress}>
            {cAddress.slice(0, 6)}...{cAddress.slice(-6)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Gas Fee</span>
          <span className="text-green-400 font-medium">FREE (relayer-sponsored)</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Authorization</span>
          <span className="text-blue-400 font-medium">Wallet signature required</span>
        </div>
      </div>

      {/* Send Button */}
      <Button
        className="w-full h-14 text-lg rounded-2xl"
        onClick={handleSend}
        disabled={!destination || !amount || state === 'building' || state === 'signing' || state === 'submitting'}
      >
        {state === 'building' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Building transaction...
          </>
        ) : state === 'signing' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Sign in wallet...
          </>
        ) : state === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Submitting transaction...
          </>
        ) : (
          <>
            <Send className="w-5 h-5 mr-2" />
            Send {amount || '0'} {asset}
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          {error}
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 text-red-300 hover:text-red-200"
            onClick={() => { setError(null); setState('form'); }}
          >
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
