'use client'

import { erc20Abi, type Abi, type Address } from "viem"
import { useReadContract } from "wagmi"

export type TokenMeta = {
    name: string
    decimals: number
    symbol: string
}

type TokenContractParams = {
    contractAddress?: Address
    chainId?: number
}

export function useTokenOwner(
    { contractAddress, chainId }: TokenContractParams,
    abi: Abi = erc20Abi,
) {
    const { data: owner } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "owner",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })
    return owner as Address | undefined
}

export function useERC20TokenMeta(
    { contractAddress, chainId }: TokenContractParams,
    abi: Abi = erc20Abi,
) {
    const { data: name } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "name",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })

    const { data: decimals } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "decimals",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })

    const { data: symbol } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "symbol",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })

    return { name, decimals, symbol } as Partial<TokenMeta>
}
