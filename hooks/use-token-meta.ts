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
    const { data: owner, isLoading, isError, error, refetch } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "owner",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })
    return {
        owner: owner as Address | undefined,
        isLoading,
        isError,
        error,
        refetch,
    }
}

export function useERC20TokenMeta(
    { contractAddress, chainId }: TokenContractParams,
    abi: Abi = erc20Abi,
) {
    const nameQuery = useReadContract({
        address: contractAddress,
        abi,
        functionName: "name",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })

    const decimalsQuery = useReadContract({
        address: contractAddress,
        abi,
        functionName: "decimals",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })

    const symbolQuery = useReadContract({
        address: contractAddress,
        abi,
        functionName: "symbol",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })

    return {
        name: nameQuery.data as string | undefined,
        decimals: decimalsQuery.data as number | undefined,
        symbol: symbolQuery.data as string | undefined,
        isLoading: nameQuery.isLoading || decimalsQuery.isLoading || symbolQuery.isLoading,
        isError: nameQuery.isError || decimalsQuery.isError || symbolQuery.isError,
        error: nameQuery.error ?? decimalsQuery.error ?? symbolQuery.error,
    }
}
