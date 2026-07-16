import type { Abi, Address } from "viem"
import { useReadContract } from "wagmi"

export type TokenMeta = {
    name: string
    decimals: number
    symbol: string
}

export function useTokenOwner(abi: Abi, tokenAddress?: Address) {
    const { data: owner } = useReadContract({
        address: tokenAddress,
        abi,
        functionName: "owner",
        query: { enabled: Boolean(tokenAddress) },
    })
    return owner as Address | undefined
}

export function useERC20TokenMeta(abi: Abi, tokenAddress?: Address) {
    const { data: name } = useReadContract({
        address: tokenAddress,
        abi,
        functionName: "name",
        query: { enabled: Boolean(tokenAddress) },
    })

    const { data: decimals } = useReadContract({
        address: tokenAddress,
        abi,
        functionName: "decimals",
        query: { enabled: Boolean(tokenAddress) },
    })
    const { data: symbol } = useReadContract({
        address: tokenAddress,
        abi,
        functionName: "symbol",
        query: { enabled: Boolean(tokenAddress) },
    })

    return { name, decimals, symbol } as Partial<TokenMeta>
}