import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { CreateSmartAccount } from './CreateSmartAccount';
import { SmartAccountBalance } from './SmartAccountBalance';
import { SmartAccountHistory } from './SmartAccountHistory';
import { SmartAccountSend } from './SmartAccountSend';
import { getStellarApiConfig } from '../../lib/config';
import { Loader2, ArrowLeft, Send, Wallet } from 'lucide-react';

interface SmartAccountPageProps {
  ownerAddress: string; // G-address from Freighter
  onBack: () => void;
}

type SmartAccountView = 'loading' | 'no-account' | 'dashboard' | 'send';

interface CAddressInfo {
  cAddress: string;
  owner: string;
}

export function SmartAccountPage({ ownerAddress, onBack }: SmartAccountPageProps) {
  const [view, setView] = useState<SmartAccountView>('loading');
  const [cAddressInfo, setCAddressInfo] = useState<CAddressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    lookupExistingAccount();
  }, [ownerAddress]);

  const lookupExistingAccount = async () => {
    setView('loading');
    setError(null);
    try {
      const { baseUrl, headers } = getStellarApiConfig();
      const res = await fetch(`${baseUrl}/api/v1/relayer/stellar/c-address/lookup/${ownerAddress}`, { headers });

      if (res.ok) {
        const data = await res.json();
        if (data.cAddress) {
          setCAddressInfo({ cAddress: data.cAddress, owner: ownerAddress });
          setView('dashboard');
          return;
        }
      }
      // No account found
      setView('no-account');
    } catch (err) {
      console.error('Failed to lookup C-address:', err);
      setView('no-account');
    }
  };

  const handleAccountCreated = (cAddress: string) => {
    setCAddressInfo({ cAddress, owner: ownerAddress });
    setView('dashboard');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-muted-foreground hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Smart Account
          </h2>
          <p className="text-xs text-muted-foreground">C-Address powered by Soroban</p>
        </div>
      </div>

      {/* Content */}
      {view === 'loading' && (
        <Card className="p-12 text-center backdrop-blur-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Looking up your Smart Account...</p>
        </Card>
      )}

      {view === 'no-account' && (
        <CreateSmartAccount
          ownerAddress={ownerAddress}
          onCreated={handleAccountCreated}
        />
      )}

      {view === 'dashboard' && cAddressInfo && (
        <div className="space-y-6">
          <SmartAccountBalance
            cAddress={cAddressInfo.cAddress}
            ownerAddress={ownerAddress}
          />

          <SmartAccountHistory cAddress={cAddressInfo.cAddress} />

          <div className="flex gap-4">
            <Button
              className="flex-1 h-14 text-lg rounded-2xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 shadow-none"
              onClick={() => setView('send')}
            >
              <Send className="w-5 h-5 mr-2" />
              Send from C-Address
            </Button>
          </div>

          {/* C-Address Info */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 text-xs">
              <span className="text-muted-foreground shrink-0">C-Address</span>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${cAddressInfo.cAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-mono truncate max-w-full sm:max-w-[200px] md:max-w-[280px] hover:text-primary transition-colors"
                title={cAddressInfo.cAddress}
              >
                {cAddressInfo.cAddress.slice(0, 6)}...{cAddressInfo.cAddress.slice(-6)}
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 text-xs">
              <span className="text-muted-foreground shrink-0">Owner (G-Address)</span>
              <a
                href={`https://stellar.expert/explorer/testnet/account/${ownerAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white font-mono truncate max-w-full sm:max-w-[200px] md:max-w-[280px] hover:text-primary transition-colors"
                title={ownerAddress}
              >
                {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-6)}
              </a>
            </div>
            <p className="text-muted-foreground text-xs text-center pt-2">
              No reserves required • No trustlines needed • Rent-based storage
            </p>
          </div>
        </div>
      )}

      {view === 'send' && cAddressInfo && (
        <SmartAccountSend
          cAddress={cAddressInfo.cAddress}
          ownerAddress={ownerAddress}
          onCancel={() => setView('dashboard')}
          onSuccess={() => setView('dashboard')}
        />
      )}

      {error && (
        <div className="text-red-400 text-sm text-center p-4 bg-red-500/10 rounded-xl border border-red-500/20">
          {error}
        </div>
      )}
    </div>
  );
}
