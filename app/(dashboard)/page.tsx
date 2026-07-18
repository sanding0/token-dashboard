'use client'

import ChainIcon from "@/components/common/chain-icon"
import { PageHeader, PageShell } from "@/components/common/page-shell"
import TokenBalance from "@/components/common/token-balance"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useManagedTokens } from "@/hooks/use-managed-tokens"
import { formatUnits } from "viem"
import Link from "next/link"
import { useBalance, useChainId, useChains, useConnection } from "wagmi"

export default function DashboardPage() {
    const { address, isConnected } = useConnection()
    const chainId = useChainId()
    const chains = useChains()
    const chain = chains.find((c) => c.id === chainId)
    const nativeSymbol = chain?.nativeCurrency.symbol ?? "ETH"

    const { data: nativeBalance, isLoading: isNativeLoading } = useBalance({
        address,
        chainId,
        query: { enabled: Boolean(address) },
    })

    const { tokens, hydrated } = useManagedTokens()

    if (!hydrated) {
        return <p className="text-sm text-muted-foreground">Loading…</p>
    }

    return (
        <PageShell>
            <PageHeader
                title="Assets Overview"
                description="Native balance on the connected chain, plus tokens you manage in Settings."
            />

            {!isConnected || !address ? (
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet not connected</CardTitle>
                        <CardDescription>
                            Connect a wallet to see balances.
                        </CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <Card>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <ChainIcon chainId={chainId} className="size-8 shrink-0" />

                            <div className="min-w-0 flex flex-col gap-1">
                                <p className="font-medium">{nativeSymbol}</p>
                                <p className="text-sm text-muted-foreground">
                                    {chain?.name ?? `Chain ${chainId}`}
                                </p>
                                <p className="font-medium tabular-nums">
                                    {isNativeLoading
                                        ? "Loading…"
                                        : nativeBalance
                                            ? `${formatUnits(nativeBalance.value, nativeBalance.decimals)} ${nativeSymbol}`
                                            : `0 ${nativeSymbol}`}
                                </p>
                                <p className="truncate font-mono text-xs text-muted-foreground">{address}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-medium">Managed tokens</h2>
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/settings" />}>
                    Manage
                </Button>
            </div>

            {tokens.length === 0 ? (
                <Card>
                    <CardHeader>
                        <CardTitle>No tokens yet</CardTitle>
                        <CardDescription>
                            Add a contract address in Settings to track balances here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button nativeButton={false} render={<Link href="/settings" />}>Go to Settings</Button>
                    </CardContent>
                </Card>
            ) : (
                tokens.map((token) => {
                    const tokenChain = chains.find((c) => c.id === token.chainId)
                    return (
                        <Card key={token.id}>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <ChainIcon chainId={token.chainId} className="size-8 shrink-0" />

                                    <div className="min-w-0 flex flex-col gap-1">
                                        <p className="font-medium">{token.label}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {tokenChain?.name ?? "Unknown"} · {token.chainId}
                                        </p>
                                        <TokenBalance
                                            contractAddress={token.address}
                                            accountAddress={address}
                                            chainId={token.chainId}
                                        />
                                        <p className="truncate font-mono text-xs text-muted-foreground">{token.address}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })
            )}
        </PageShell>
    )
}
