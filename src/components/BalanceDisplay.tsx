import { useState, useEffect } from 'react';
import { getAccountBalances, AccountBalance } from '../lib/stellar';


interface BalanceDisplayProps {
  address: string;
}

export function BalanceDisplay({ address }: BalanceDisplayProps) {
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [address]);

  const fetchBalances = async () => {
    try {
      const b = await getAccountBalances(address);
      setBalances(b);
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBalance = (code: string) => {
    const b = balances.find((b) => b.asset === code);
    return b ? parseFloat(b.balance).toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 relative">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <span className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-3 relative z-10">Total Estimated Value</span>
        <div className="text-5xl font-black text-white flex items-baseline gap-3 relative z-10 tracking-tighter">
          ${getBalance('USDC')} <span className="text-xl text-primary font-bold tracking-normal">USDC</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* XLM Card */}
        <div className="phantom-card rounded-2xl p-5 border border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <img src="/stellar.svg" className="w-16 h-16 grayscale invert" alt="" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <img src="/stellar.svg" className="w-6 h-6" alt="XLM" />
            </div>
            <div>
              <span className="text-white font-bold block leading-none">XLM</span>
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Stellar Lumens</span>
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {loading ? '...' : getBalance('XLM')}
          </div>
        </div>

        {/* USDC Card */}
        <div className="phantom-card rounded-2xl p-5 border border-white/5 hover:border-green-500/20 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029" className="w-16 h-16" alt="" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
              <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029" className="w-6 h-6" alt="USDC" />
            </div>
            <div>
              <span className="text-white font-bold block leading-none">USDC</span>
              <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">USD Coin</span>
            </div>
          </div>
          <div className="text-2xl font-black text-white tracking-tighter">
            {loading ? '...' : getBalance('USDC')}
          </div>
        </div>
      </div>
    </div>
  );
}
