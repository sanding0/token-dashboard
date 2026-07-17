"use client"

import { useTokenBalance } from "@/hooks/use-token-balance"
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
    ...rest
}: TokenBalanceProps) {
    const { formatted } = useTokenBalance({
        contractAddress,
        accountAddress,
        chainId,
    })

    return <p {...rest}>{formatted ?? "—"}</p>
}
