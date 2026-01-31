
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

type NetworkBadgeProps = {
    network: "testnet" | "mainnet"
    onToggle: () => void
}

export function NetworkBadge({ network, onToggle }: NetworkBadgeProps) {
    return (
        <Button
            variant="outline"
            size="sm"
            onClick={onToggle}
            className={`
        gap-2 rounded-full border-0 px-3 h-8 font-medium transition-all
        ${network === "mainnet"
                    ? "bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20"
                    : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20"
                }
      `}
        >
            <Globe className="w-3.5 h-3.5" />
            <span className="capitalize text-xs">{network}</span>
        </Button>
    )
}
