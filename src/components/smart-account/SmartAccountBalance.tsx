import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getStellarApiConfig } from '../../lib/config';
import { Loader2, RefreshCw, Copy, Check } from 'lucide-react';

interface SmartAccountBalanceProps {
  cAddress: string;
  ownerAddress?: string;
}

interface TokenBalance {
  asset: string;
  balance: string;
  symbol: string;
}

export function SmartAccountBalance({ cAddress }: SmartAccountBalanceProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBalances();
  }, [cAddress]);

  const fetchBalances = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { baseUrl, headers } = getStellarApiConfig();
      const res = await fetch(`${baseUrl}/api/v1/relayer/stellar/c-address/balance/${cAddress}`, { headers });

      if (res.ok) {
        const data = await res.json();
        setBalances(data.balances || []);
      } else {
        console.error('Failed to fetch balances:', res.status);
        setBalances([]);
      }
    } catch (err) {
      console.error('Failed to fetch C-address balances:', err);
      setBalances([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(cAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* C-Address display */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-xs">C</span>
          </div>
          <a
            href={`https://stellar.expert/explorer/testnet/contract/${cAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-white truncate hover:text-primary transition-colors"
            title={cAddress}
          >
            <span className="sm:hidden">{cAddress.slice(0, 6)}...{cAddress.slice(-4)}</span>
            <span className="hidden sm:inline">{cAddress.slice(0, 10)}...{cAddress.slice(-10)}</span>
          </a>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={copyAddress} className="h-8 w-8 p-0">
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchBalances(true)}
            disabled={refreshing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Balances */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : balances.length === 0 ? (
        <Card className="p-6 text-center backdrop-blur-xl">
          <p className="text-muted-foreground text-sm">No token balances yet</p>
          <p className="text-xs text-white/20 mt-2">
            Fund your C-Address by sending tokens to it via SAC
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {balances.map((token, i) => {
            const bal = parseFloat(token.balance);
            const icon = token.symbol === 'XLM' ? '✦' : token.symbol === 'USDC' ? '$' : token.symbol === 'EURC' ? '€' : '?';
            const iconBg = token.symbol === 'XLM' ? 'bg-blue-500/20 text-blue-400' : token.symbol === 'USDC' ? 'bg-green-500/20 text-green-400' : 'bg-indigo-500/20 text-indigo-400';
            return (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                  <span className="font-bold text-lg">{icon}</span>
                </div>
                <div className="text-white font-medium text-base">{token.symbol}</div>
              </div>
              <div className="text-right">
                <div className="text-white font-mono font-semibold text-lg">
                  {bal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
