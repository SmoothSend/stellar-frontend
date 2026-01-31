
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export type Token = {
    symbol: string
    name: string
    decimals: number
    assetType: string // "native" or contract address
    balance?: string
    logo?: string
    hasTrustline?: boolean
}

type TokenSelectorProps = {
    tokens: Token[]
    selectedToken: Token
    onSelect: (token: Token) => void
}

export function TokenSelector({ tokens, selectedToken, onSelect }: TokenSelectorProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className="h-14 w-[140px] phantom-button border-0 rounded-xl justify-between px-3 bg-secondary/50 hover:bg-secondary/70"
                >
                    <span className="flex items-center gap-2">
                        {selectedToken.logo ? (
                            <img
                                src={selectedToken.logo}
                                alt={selectedToken.symbol}
                                className="w-6 h-6 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-primary-foreground font-bold">
                                {selectedToken.symbol[0]}
                            </div>
                        )}
                        <span className="font-medium text-foreground">{selectedToken.symbol}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-popover border-border/50 text-popover-foreground p-2 rounded-xl shadow-xl">
                {tokens.map((token) => (
                    <DropdownMenuItem
                        key={token.symbol}
                        onClick={() => onSelect(token)}
                        className="cursor-pointer focus:bg-accent focus:text-accent-foreground rounded-lg p-3 mb-1 last:mb-0"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                                {token.logo ? (
                                    <img
                                        src={token.logo}
                                        alt={token.symbol}
                                        className="w-8 h-8 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold border border-border">
                                        {token.symbol[0]}
                                    </div>
                                )}
                                <div>
                                    <div className="font-medium">{token.symbol}</div>
                                    <div className="text-xs text-muted-foreground">{token.name}</div>
                                </div>
                            </div>
                            {token.balance && (
                                <div className="text-right">
                                    <div className="text-sm font-mono text-foreground">{token.balance}</div>
                                    <div className="text-[10px] text-muted-foreground">Balance</div>
                                </div>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
