import { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { BalanceDisplay } from './components/BalanceDisplay';
import { TransferForm } from './components/TransferForm';
import { ClaimableBalanceList } from './components/ClaimableBalanceList';
import { RelayerStatus } from './components/RelayerStatus';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Card } from './components/ui/card';
import { Button } from './components/ui/button';

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [view, setView] = useState<'dashboard' | 'send'>('dashboard');

  return (
    <div className="min-h-screen">
      <Header>
        <RelayerStatus />
        <WalletConnect address={address} onConnect={setAddress} />
      </Header>

      <main className="pt-32 pb-12 px-4 max-w-lg mx-auto">
        {address ? (
          <Card className="p-8 relative overflow-hidden backdrop-blur-2xl">
            {/* Background decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              {view === 'dashboard' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                  <BalanceDisplay address={address} />

                  {/* Pending Claims Section */}
                  <ClaimableBalanceList address={address} />

                  <div className="flex gap-4">
                    <Button
                      className="flex-1 h-14 text-lg rounded-2xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 shadow-none"
                      onClick={() => setView('send')}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Tokens
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-muted-foreground text-xs text-center">
                      Network: <span className="text-white">Stellar Testnet</span>
                    </p>
                  </div>
                </div>
              ) : (
                <TransferForm
                  senderAddress={address}
                  onCancel={() => setView('dashboard')}
                  onSuccess={() => {
                    // Stay on success view in TransferForm
                  }}
                />
              )}
            </div>
          </Card>
        ) : (
          <div className="text-center py-20 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="space-y-4">
              <h1 className="text-5xl font-black text-white tracking-tighter">
                Gasless <span className="text-primary">Stellar</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xs mx-auto">
                The easiest way to send assets on Stellar. Zero fees, zero friction.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <WalletConnect address={address} onConnect={setAddress} />
              <p className="text-white/20 text-sm">Supports Freighter, Lobstr, xBull & more</p>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-12 border-t border-white/5">
              <div className="space-y-1">
                <div className="text-white font-bold">100% Free</div>
                <div className="text-xs text-white/30">No gas fees</div>
              </div>
              <div className="space-y-1">
                <div className="text-white font-bold">Instant</div>
                <div className="text-xs text-white/30">Stellar speed</div>
              </div>
              <div className="space-y-1">
                <div className="text-white font-bold">Secure</div>
                <div className="text-xs text-white/30">Self-custodial</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
