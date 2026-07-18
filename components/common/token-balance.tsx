import { useTokenBalance } from "@/hooks/use-token-balance"
import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"
import { Address } from "viem"

type TokenBalanceProps = HTMLAttributes<HTMLParagraphElement> & {
    contractAddress: Address
    accountAddress?: Address
    chainId?: number
}

export default function TokenBalance({
    contractAddress,
    accountAddress,
    chainId,
    className,
    ...rest
}: TokenBalanceProps) {
    const { formatted, isLoading, isError, refetch } = useTokenBalance({
        contractAddress,
        accountAddress,
        chainId,
    })

    if (!accountAddress) {
        return (
            <p className={cn("text-sm text-muted-foreground", className)} {...rest}>
                Connect wallet
            </p>
        )
    }

    if (isLoading) {
        return (
            <p className={cn("text-sm text-muted-foreground", className)} {...rest}>
                Loading…
            </p>
        )
    }

    if (isError) {
        return (
            <p className={cn("text-sm text-destructive", className)} {...rest}>
                Failed to load{" "}
                <button
                    type="button"
                    className="underline underline-offset-2"
                    onClick={() => refetch()}
                >
                    Retry
                </button>
            </p>
        )
    }

    return (
        <p className={cn("font-medium tabular-nums", className)} {...rest}>
            {formatted ?? "0"}
        </p>
    )
}
