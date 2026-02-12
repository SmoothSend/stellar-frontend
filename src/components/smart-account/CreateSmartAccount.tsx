import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getStellarApiConfig } from '../../lib/config';
import { Loader2, Plus, Sparkles, Shield, Zap, Database } from 'lucide-react';

interface CreateSmartAccountProps {
  ownerAddress: string;
  onCreated: (cAddress: string) => void;
}

export function CreateSmartAccount({ ownerAddress, onCreated }: CreateSmartAccountProps) {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const handleCreate = async () => {
    setCreating(true);
    setError(null);

    try {
      setStep('Deploying Smart Account contract...');
      const { baseUrl, headers } = getStellarApiConfig();

      const res = await fetch(`${baseUrl}/api/v1/relayer/stellar/c-address/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ownerGAddress: ownerAddress }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Failed to create Smart Account (${res.status})`);
      }

      const data = await res.json();
      setStep('Smart Account created!');

      // Small delay so user sees success
      await new Promise((r) => setTimeout(r, 800));
      onCreated(data.cAddress);
    } catch (err: any) {
      console.error('Create Smart Account failed:', err);
      setError(err.message || 'Failed to create Smart Account');
    } finally {
      setCreating(false);
      setStep('');
    }
  };

  return (
    <Card className="p-8 relative overflow-hidden backdrop-blur-2xl">
      {/* Decorative background */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 space-y-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Create Smart Account</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Deploy a Soroban-powered C-Address linked to your wallet.
            No reserves, no trustlines, no gas fees.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-green-500/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-xs text-muted-foreground">No Reserve</div>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-xs text-muted-foreground">Gasless</div>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-xs text-muted-foreground">Rent-based</div>
          </div>
        </div>

        {/* Create Button */}
        <Button
          className="w-full h-14 text-lg rounded-2xl"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              {step}
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Create Smart Account
            </>
          )}
        </Button>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            {error}
          </div>
        )}

        {/* Info */}
        <p className="text-xs text-white/20">
          Your G-Address: <span className="font-mono">{ownerAddress.slice(0, 8)}...{ownerAddress.slice(-8)}</span>
        </p>
      </div>
    </Card>
  );
}
