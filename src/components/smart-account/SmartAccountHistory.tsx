import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getStellarApiConfig } from '../../lib/config';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, Clock } from 'lucide-react';

interface Transaction {
  type: 'sent' | 'received';
  asset: string;
  amount: string;
  counterparty: string;
  txHash: string;
  timestamp: string;
  ledger: number;
}

interface SmartAccountHistoryProps {
  cAddress: string;
}

export function SmartAccountHistory({ cAddress }: SmartAccountHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { baseUrl, headers } = getStellarApiConfig();
      const res = await fetch(
        `${baseUrl}/api/v1/relayer/stellar/c-address/history/${cAddress}?limit=20`,
        { headers }
      );

      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      } else {
        console.error('Failed to fetch history:', res.status);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch C-address history:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cAddress]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return amount;
    return num.toFixed(2);
  };

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const getAssetIcon = (asset: string) => {
    switch (asset.toUpperCase()) {
      case 'XLM': return <span className="text-blue-400 font-bold">✦</span>;
      case 'USDC': return <span className="text-green-400 font-bold">$</span>;
      case 'EURC': return <span className="text-indigo-400 font-bold">€</span>;
      default: return <span className="text-gray-400">•</span>;
    }
  };

  if (loading) {
    return (
      <Card className="p-4 bg-white/5 border-white/10 rounded-2xl">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 animate-spin" />
          Loading transaction history...
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchHistory(true)}
          disabled={refreshing}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '...' : 'Refresh'}
        </Button>
      </div>

      {transactions.length === 0 ? (
        <Card className="p-6 bg-white/5 border-white/10 rounded-2xl text-center">
          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No transactions yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Transfers to or from this C-address will appear here
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx, idx) => (
            <a
              key={`${tx.txHash}-${idx}`}
              href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="p-3 bg-white/5 border-white/10 rounded-xl hover:bg-white/8 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Direction icon */}
                    <div className={`p-1.5 rounded-lg ${
                      tx.type === 'received'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {tx.type === 'received'
                        ? <ArrowDownLeft className="w-4 h-4" />
                        : <ArrowUpRight className="w-4 h-4" />
                      }
                    </div>

                    {/* Details */}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {tx.type === 'received' ? 'Received' : 'Sent'}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {tx.type === 'received' ? 'From ' : 'To '}
                        {formatAddress(tx.counterparty)}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <div className={`text-sm font-medium ${
                      tx.type === 'received' ? 'text-green-400' : 'text-white'
                    }`}>
                      {tx.type === 'received' ? '+' : '-'}{formatAmount(tx.amount)}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      {getAssetIcon(tx.asset)} {tx.asset}
                    </div>
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
