import { erc20Abi, formatUnits, type Abi, type Address } from "viem"
import { useReadContract } from "wagmi"

type TokenBalanceParams = {
    contractAddress?: Address
    accountAddress?: Address
    chainId?: number
}

export function useTokenBalance(
    { contractAddress, accountAddress, chainId }: TokenBalanceParams,
    abi: Abi = erc20Abi,
) {
    const {
        data: decimals,
        isLoading: isDecimalsLoading,
        isError: isDecimalsError,
        error: decimalsError,
        refetch: refetchDecimals,
    } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "decimals",
        chainId,
        query: { enabled: Boolean(contractAddress) },
    })
    const {
        data: raw,
        isLoading: isBalanceLoading,
        isError: isBalanceError,
        error: balanceError,
        refetch: refetchBalance,
    } = useReadContract({
        address: contractAddress,
        abi,
        functionName: "balanceOf",
        args: accountAddress ? [accountAddress] : undefined,
        chainId,
        query: { enabled: Boolean(contractAddress && accountAddress) },
    })

    const formatted =
        raw !== undefined && decimals !== undefined
            ? formatUnits(raw as bigint, decimals as number)
            : undefined

    return {
        raw,
        formatted,
        decimals,
        isLoading: isDecimalsLoading || isBalanceLoading,
        isError: isDecimalsError || isBalanceError,
        error: balanceError ?? decimalsError,
        refetch: () => {
            refetchDecimals()
            refetchBalance()
        },
    }
}
