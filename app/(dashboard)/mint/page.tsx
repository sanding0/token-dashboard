'use client'

import ChainIcon from "@/components/common/chain-icon"
import { PageHeader, PageShell } from "@/components/common/page-shell"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useManagedTokens } from "@/hooks/use-managed-tokens"
import { getTokenAbi, getTokenKind, tokenHasCapability } from "@/lib/token-kinds"
import Link from "next/link"
import { useState } from "react"
import { useConnection } from "wagmi"
import TokenMeta from "./token-meta"

export default function MintPage() {
    const { address, isConnected, chainId } = useConnection()
    const { tokens, hydrated } = useManagedTokens()
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const mintableTokens = tokens.filter((t) => tokenHasCapability(t.kind, "mint"))

    if (!hydrated) {
        return <p className="text-sm text-muted-foreground">Loading…</p>
    }

    if (mintableTokens.length === 0) {
        return (
            <PageShell>
                <Card>
                    <CardHeader>
                        <CardTitle>No mintable tokens</CardTitle>
                        <CardDescription>
                            Add a token with type &quot;Ownable + Mint&quot; in Settings first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button nativeButton={false} render={<Link href="/settings" />}>Go to Settings</Button>
                    </CardContent>
                </Card>
            </PageShell>
        )
    }

    if (!isConnected || !address || !chainId) {
        return (
            <PageShell>
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet not connected</CardTitle>
                        <CardDescription>
                            Connect a wallet to mint tokens.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </PageShell>
        )
    }

    const selected =
        mintableTokens.find((t) => t.id === selectedId) ?? mintableTokens[0]

    return (
        <PageShell>
            <PageHeader
                title="Mint"
                description="Mint as the contract owner. Switch to the token's chain before signing."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Select token</CardTitle>
                    <CardDescription>
                        Only Ownable + Mint tokens are listed here.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        {mintableTokens.map((token) => {
                            const isActive = token.id === selected.id
                            return (
                                <Button
                                    key={token.id}
                                    type="button"
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="lg"
                                    className="h-auto w-full justify-start gap-2 py-2"
                                    onClick={() => setSelectedId(token.id)}
                                >
                                    <ChainIcon chainId={token.chainId} className="shrink-0" />
                                    <span className="flex min-w-0 flex-col items-start text-left">
                                        <span className="truncate">{token.label}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {getTokenKind(token.kind).label}
                                        </span>
                                        <span className="w-full truncate font-mono text-xs font-normal text-muted-foreground">
                                            {token.address}
                                        </span>
                                    </span>
                                </Button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <TokenMeta
                key={selected.id}
                chainId={selected.chainId}
                address={selected.address}
                label={selected.label}
                abi={getTokenAbi(selected.kind)}
                walletAddress={address}
                walletChainId={chainId}
            />
        </PageShell>
    )
}
