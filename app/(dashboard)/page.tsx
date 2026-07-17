'use client'

import ChainIcon from "@/components/common/chain-icon"
import TokenBalance from "@/components/common/token-balance"
import { Card, CardContent } from "@/components/ui/card"
import { useManagedTokens } from "@/hooks/use-managed-tokens"
import { formatUnits } from "viem"
import { useBalance, useConnection } from "wagmi"

export default function DashboardPage() {
    const { address, chainId } = useConnection()
    const { data: ETHBalance } = useBalance({ address })

    const { tokens } = useManagedTokens()

    return (
        <>
            <h1>Assets Overview</h1>

            <Card>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <ChainIcon chainId={chainId} />

                        <div className="flex flex-col gap-2">
                            <p>ETH</p>
                            <p>{ETHBalance ? formatUnits(ETHBalance.value, ETHBalance.decimals) : '0'} ETH</p>
                            <p>{address}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {
                tokens.map(token => (
                    <Card key={token.chainId}>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <ChainIcon chainId={token.chainId} />

                                <div className="flex flex-col gap-2">
                                    <p>{token.label}</p>
                                    <TokenBalance
                                        contractAddress={token.address}
                                        accountAddress={address}
                                        chainId={token.chainId}
                                    />
                                    <p>{token.address}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            }
        </>
    )
}