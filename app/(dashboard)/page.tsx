'use client'

import { MyTokenABI } from "@/lib/abis/MyToken"
import { formatUnits, type Address } from "viem"
import { useBalance, useConnection, useReadContract } from "wagmi"

export default function DashboardPage() {
    const { address } = useConnection()
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address || ''

    const { data: MTBalance } = useReadContract({
        address: contractAddress,
        abi: MyTokenABI,
        functionName: 'balanceOf',
        args: [address as Address],
        query: { enabled: Boolean(address && contractAddress) }
    })

    const { data: decimals } = useReadContract({
        address: contractAddress,
        abi: MyTokenABI,
        functionName: 'decimals',
        query: { enabled: Boolean(contractAddress) }
    })

    const { data: ETHBalance } = useBalance({ address })

    return (
        <>
            <h1>Dashboard</h1>
            <p>MTBalance: {MTBalance ? formatUnits(MTBalance, decimals || 18) : '0'} MT</p>
            <p>ETHBalance: {ETHBalance ? formatUnits(ETHBalance.value, 18) : '0'} ETH</p>
        </>
    )
}