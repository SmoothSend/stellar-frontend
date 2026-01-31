import { useState, useEffect } from 'react';
import { connectWallet, getConnectedAddress, disconnectWallet } from '../lib/wallet';
import { Button } from './ui/button';
import { LogOut, Loader2 } from 'lucide-react';

interface WalletConnectProps {
  address: string | null;
  onConnect: (address: string | null) => void;
}

export function WalletConnect({ address, onConnect }: WalletConnectProps) {
  const [loading, setLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    // Only check on initial mount if not already connected
    if (!address) {
      checkConnection();
    }
  }, []);

  const checkConnection = async () => {
    try {
      const addr = await getConnectedAddress();
      if (addr) {
        onConnect(addr);
      }
    } catch (e) {
      // No existing connection, that's fine
    }
  };

  const handleConnect = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const { address } = await connectWallet();
      onConnect(address);
    } catch (error: any) {
      if (!error.message?.includes('already in progress')) {
        console.error('Failed to connect wallet:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (disconnecting) return;

    setDisconnecting(true);
    try {
      await disconnectWallet();
      onConnect(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    } finally {
      setDisconnecting(false);
    }
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (address) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="secondary" className="rounded-full px-6 font-mono cursor-default hover:bg-secondary">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
          {truncateAddress(address)}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-10 h-10 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          onClick={handleDisconnect}
          disabled={disconnecting}
          title="Disconnect Wallet"
        >
          {disconnecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </Button>
  );
}
