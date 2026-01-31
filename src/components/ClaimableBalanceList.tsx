import { useState, useEffect } from 'react';
import { fetchClaimableBalances, ClaimableBalance, buildClaimTransaction, relayTransaction } from '../lib/stellar';
import { signTransaction } from '../lib/wallet';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowDownToLine } from "lucide-react";
import { ToastAction } from '@/components/ui/toast';

interface ClaimableBalanceListProps {
    address: string;
}

export function ClaimableBalanceList({ address }: ClaimableBalanceListProps) {
    const { toast } = useToast();
    const [balances, setBalances] = useState<ClaimableBalance[]>([]);
    const [loading, setLoading] = useState(false);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        if (address) {
            loadBalances();
            const interval = setInterval(loadBalances, 10000);
            return () => clearInterval(interval);
        }
    }, [address]);

    const loadBalances = async () => {
        setLoading(true);
        try {
            const data = await fetchClaimableBalances(address);
            setBalances(data);
        } catch (error) {
            console.error("Failed to load claimable balances", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClaim = async (balance: ClaimableBalance) => {
        setClaimingId(balance.id);

        try {
            const assetCode = getAssetCode(balance.asset);
            toast({ title: "Claiming Asset", description: `Claiming ${balance.amount} ${assetCode}...` });

            const transaction = await buildClaimTransaction(address, balance.id, balance.asset);

            toast({ title: "Sign Transaction", description: "Check your wallet to sign..." });

            const signedXDR = await signTransaction(transaction.toXDR());

            toast({ title: "Relaying", description: "Submitting to network..." });

            const result = await relayTransaction(signedXDR);

            if (result.success && result.hash) {
                toast({
                    title: "Success!",
                    description: `Successfully claimed ${balance.amount} ${assetCode}.`,
                    className: "bg-green-500/10 border-green-500/20 text-green-500",
                    action: (
                        <ToastAction altText="View on Explorer" onClick={() => window.open(result.explorerUrl, '_blank')}>
                            View on Explorer
                        </ToastAction>
                    ),
                });
                loadBalances(); // Refresh list
            } else {
                throw new Error(result.error || 'Claim failed');
            }

        } catch (err: any) {
            toast({
                variant: "destructive",
                title: "Claim Failed",
                description: err.message || 'Unknown error'
            });
        } finally {
            setClaimingId(null);
        }
    };

    const getAssetCode = (assetString: string) => {
        if (assetString === 'native') return 'XLM';
        if (assetString.includes(':')) return assetString.split(':')[0];
        return assetString;
    };

    if (loading && balances.length === 0) {
        return <div className="text-center p-4 text-muted-foreground animate-pulse">Loading pending claims...</div>;
    }

    if (balances.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Pending Payments</h3>
            <div className="grid gap-3">
                {balances.map((balance) => (
                    <Card key={balance.id} className="p-4 bg-secondary/30 border-secondary/50 flex items-center justify-between group hover:bg-secondary/50 transition-colors">
                        <div className="flex items-center gap-4 min-w-0 pr-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-primary">
                                <ArrowDownToLine className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 truncate">
                                <div className="font-semibold text-foreground truncate">
                                    {balance.amount} <span className="text-primary">{getAssetCode(balance.asset)}</span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                    From: <span className="font-mono">{balance.sponsor.slice(0, 4)}...{balance.sponsor.slice(-4)}</span>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={() => handleClaim(balance)}
                            disabled={!!claimingId}
                            size="sm"
                            className="phantom-button h-9 px-4 font-medium flex-shrink-0"
                        >
                            {claimingId === balance.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Claim"
                            )}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
