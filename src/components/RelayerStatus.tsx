import { useState, useEffect } from 'react';
import { checkRelayerHealth } from '../lib/stellar';

export function RelayerStatus() {
  const [status, setStatus] = useState<{
    healthy: boolean;
    balance?: string;
  } | null>(null);

  useEffect(() => {
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const check = async () => {
    const s = await checkRelayerHealth();
    setStatus(s);
  };

  if (!status) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group cursor-default">
      <div className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.healthy ? 'bg-green-400' : 'bg-red-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${status.healthy ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] leading-none mb-0.5">
          Relayer {status.healthy ? 'Online' : 'Offline'}
        </span>
        {status.healthy && status.balance && (
          <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest leading-none">
            {parseFloat(status.balance).toFixed(0)} XLM AVAILABLE
          </span>
        )}
      </div>
    </div>
  );
}
