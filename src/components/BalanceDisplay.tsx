import { useState, useEffect } from 'react';
import { getAccountBalances, AccountBalance } from '../lib/stellar';
import { config, AssetCode } from '../lib/config';

// USD prices: USDC=1, EURC≈1.08, XLM fetched from CoinGecko (fallback for loading)
const DEFAULT_PRICES: Record<string, number> = {
  USDC: 1,
  EURC: 1.08,
  XLM: 0.1, // Fallback until CoinGecko responds
};

interface BalanceDisplayProps {
  address: string;
}

export function BalanceDisplay({ address }: BalanceDisplayProps) {
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [prices, setPrices] = useState<Record<string, number>>({ ...DEFAULT_PRICES });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
    const interval = setInterval(fetchBalances, 10000);
    return () => clearInterval(interval);
  }, [address]);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // Refresh prices every minute
    return () => clearInterval(interval);
  }, []);

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

  const fetchPrices = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd'
      );
      const data = await res.json();
      if (data?.stellar?.usd != null) {
        setPrices((p) => ({ ...p, XLM: data.stellar.usd }));
      }
    } catch {
      setPrices((p) => ({ ...p, XLM: 0.1 })); // Fallback for testnet demo
    }
  };

  const getBalance = (code: AssetCode) => {
    const assetDef = config.assets[code];
    const b = balances.find((b) => b.asset === code && (!assetDef.issuer || b.issuer === assetDef.issuer));
    return b ? parseFloat(b.balance) : 0;
  };

  const getTotalUsdValue = () => {
    let total = 0;
    (Object.keys(config.assets) as AssetCode[]).forEach((code) => {
      const bal = getBalance(code);
      const price = prices[code] ?? 0;
      total += bal * price;
    });
    return total;
  };

  const getAssetStyle = (code: AssetCode) => {
    if (code === 'XLM') return {
      borderColor: 'hover:border-blue-500/20',
      iconBg: 'bg-blue-500/10',
      iconBorder: 'border-blue-500/20',
      shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]',
      img: '/stellar.svg'
    };
    if (code === 'USDC') return {
      borderColor: 'hover:border-green-500/20',
      iconBg: 'bg-green-500/10',
      iconBorder: 'border-green-500/20',
      shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]',
      img: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=029'
    };
    if (code === 'EURC') return {
      borderColor: 'hover:border-blue-400/20',
      iconBg: 'bg-blue-400/10',
      iconBorder: 'border-blue-400/20',
      shadow: 'shadow-[0_0_15px_rgba(96,165,250,0.1)]',
      img: '/eurc.svg'
    };
    return {
      borderColor: 'hover:border-gray-500/20',
      iconBg: 'bg-gray-500/10',
      iconBorder: 'border-gray-500/20',
      shadow: 'shadow-none',
      img: '/stellar.svg'
    };
  };

  const totalUsd = getTotalUsdValue();
  const formatBalance = (n: number) => n.toFixed(2);
  const formatUsd = (n: number) =>
    n >= 1000 ? n.toLocaleString(undefined, { maximumFractionDigits: 0 }) : n.toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-8 relative">
        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
        <span className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-3 relative z-10">
          Total Portfolio Value
        </span>
        <div className="text-5xl font-black text-white flex items-baseline gap-3 relative z-10 tracking-tighter">
          ${loading ? '—' : formatUsd(totalUsd)}{' '}
          <span className="text-xl text-primary font-bold tracking-normal">USD</span>
        </div>
        <p className="text-white/30 text-xs mt-1 relative z-10">
          XLM + USDC + EURC and more
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(Object.keys(config.assets) as AssetCode[]).map((code) => {
          const style = getAssetStyle(code);
          const assetInfo = config.assets[code];
          const bal = getBalance(code);
          const usdVal = bal * (prices[code] ?? 0);

          return (
            <div key={code} className={`phantom-card rounded-2xl p-5 border border-white/5 ${style.borderColor} transition-all group overflow-hidden relative`}>
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src={style.img} className="w-16 h-16 grayscale invert" alt="" />
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl ${style.iconBg} flex items-center justify-center border ${style.iconBorder} ${style.shadow}`}>
                  <img src={style.img} className="w-6 h-6" alt={code} />
                </div>
                <div>
                  <span className="text-white font-bold block leading-none">{code}</span>
                  <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{assetInfo.name}</span>
                </div>
              </div>
              <div className="text-2xl font-black text-white tracking-tighter">
                {loading ? '...' : formatBalance(bal)}
              </div>
              {usdVal > 0 && (
                <div className="text-xs text-white/40 mt-0.5">
                  ≈ ${formatUsd(usdVal)} USD
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
