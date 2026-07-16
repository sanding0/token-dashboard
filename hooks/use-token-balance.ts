import { formatUnits, type Abi, type Address } from "viem"
import { useReadContract } from "wagmi"

export function useTokenBalance(abi: Abi, tokenAddress?: Address, account?: Address) {
    const {
        data: decimals,
        isLoading: isDecimalsLoading,
        isError: isDecimalsError,
        error: decimalsError,
        refetch: refetchDecimals
    } = useReadContract({
        address: tokenAddress,
        abi,
        functionName: "decimals",
        query: { enabled: Boolean(tokenAddress) },
    })
    const {
        data: raw,
        isLoading:
        isBalanceLoading,
        isError: isBalanceError,
        error: balanceError,
        refetch: refetchBalance
    } = useReadContract({
        address: tokenAddress,
        abi,
        functionName: "balanceOf",
        args: account ? [account] : undefined,
        query: { enabled: Boolean(tokenAddress && account) },
    })

    const formatted =
        raw !== undefined && decimals !== undefined
            ? formatUnits(raw as bigint, decimals as number)
            : undefined

    return {
        raw, formatted,
        decimals,
        isLoading: isDecimalsLoading || isBalanceLoading,
        isError: isDecimalsError || isBalanceError,
        error: balanceError ?? decimalsError,
        refetch: () => {
            refetchDecimals()
            refetchBalance()
        }
    }
}