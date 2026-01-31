import { useState } from 'react';
import { buildPaymentTransaction, relayTransaction } from '../lib/stellar';
import { signTransaction } from '../lib/wallet';
import { config, AssetCode } from '../lib/config';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface TransferFormProps {
  senderAddress: string;
  onSuccess?: (hash: string) => void;
  onCancel?: () => void;
}

export function TransferForm({ senderAddress, onSuccess, onCancel }: TransferFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState<AssetCode>('XLM');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'idle' | 'building' | 'signing' | 'relaying' | 'success' | 'error';
    message?: string;
    hash?: string;
    explorerUrl?: string;
  }>({ type: 'idle' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !amount) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      return;
    }

    setLoading(true);
    
    try {
      setStatus({ type: 'building', message: 'Building transaction...' });
      const transaction = await buildPaymentTransaction(
        senderAddress,
        recipient,
        amount,
        asset
      );
      
      setStatus({ type: 'signing', message: 'Check your wallet to sign...' });
      const signedXDR = await signTransaction(transaction.toXDR());
      
      setStatus({ type: 'relaying', message: 'Sponsoring fee & submitting...' });
      const result = await relayTransaction(signedXDR);
      
      if (result.success && result.hash) {
        setStatus({
          type: 'success',
          message: 'Success!',
          hash: result.hash,
          explorerUrl: result.explorerUrl,
        });
        onSuccess?.(result.hash);
      } else {
        setStatus({
          type: 'error',
          message: result.error || 'Transaction failed',
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Transaction failed',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status.type === 'success') {
    return (
      <div className="text-center py-8 space-y-6">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white">Transaction Sent!</h3>
        <p className="text-muted-foreground">Your gasless transfer was successfully relayed.</p>
        
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => window.open(status.explorerUrl, '_blank')}
          >
            View on Explorer
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onCancel}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        {/* Asset Selection */}
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(config.assets) as AssetCode[]).map((assetCode) => (
            <button
              key={assetCode}
              type="button"
              onClick={() => setAsset(assetCode)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all relative overflow-hidden group ${
                asset === assetCode
                  ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(117,149,255,0.1)]'
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                assetCode === 'XLM' ? 'bg-blue-500/20' : 'bg-green-500/20'
              }`}>
                {assetCode === 'XLM' ? (
                  <img src="/stellar.svg" className="w-6 h-6" alt="XLM" />
                ) : (
                  <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029" className="w-6 h-6" alt="USDC" />
                )}
              </div>
              <div className="text-left relative z-10">
                <div className={`font-bold text-sm ${asset === assetCode ? 'text-white' : 'text-white/40'}`}>{assetCode}</div>
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{assetCode === 'XLM' ? 'Lumens' : 'Circle'}</div>
              </div>
              {asset === assetCode && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Amount</label>
          <div className="relative">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.0000001"
              className="pr-16 text-lg"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">
              {asset}
            </div>
          </div>
        </div>

        {/* Recipient Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Recipient Address</label>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="G..."
            className="font-mono text-sm"
          />
        </div>
      </div>

      {/* Gas Sponsorship Info */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="text-white text-sm font-semibold">Gasless Transfer</p>
          <p className="text-muted-foreground text-xs">SmoothSend is sponsoring your transaction fee.</p>
        </div>
        <div className="ml-auto text-primary font-bold text-sm">$0.00</div>
      </div>

      {status.type === 'error' && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {status.message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={loading || !recipient || !amount}
          className="h-14 text-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {status.message || 'Processing...'}
            </span>
          ) : (
            `Send ${asset}`
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
