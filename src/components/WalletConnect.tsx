import { useState, useEffect } from 'react';
import { connectWallet, getConnectedAddress } from '../lib/wallet';
import { Button } from './ui/button';

interface WalletConnectProps {
  address: string | null;
  onConnect: (address: string | null) => void;
}

export function WalletConnect({ address, onConnect }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const addr = await getConnectedAddress();
    if (addr) {
      onConnect(addr);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { address } = await connectWallet();
      onConnect(address);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <Button variant="secondary" className="rounded-full px-6 font-mono">
        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
        {truncateAddress(address)}
      </Button>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="rounded-full px-8"
    >
      {loading ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
