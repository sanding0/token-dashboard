"use client"

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
import TransferForm from "./transfer-form"

export default function TransferPage() {
    const { address, isConnected, chainId } = useConnection()
    const { tokens, hydrated } = useManagedTokens()
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const transferableTokens = tokens.filter((t) =>
        tokenHasCapability(t.kind, "transfer"),
    )

    if (!hydrated) {
        return <p className="text-sm text-muted-foreground">Loading…</p>
    }

    if (transferableTokens.length === 0) {
        return (
            <PageShell>
                <Card>
                    <CardHeader>
                        <CardTitle>No transferable tokens</CardTitle>
                        <CardDescription>
                            Add an ERC20 or Ownable + Mint token in Settings first.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button nativeButton={false} render={<Link href="/settings" />}>
                            Go to Settings
                        </Button>
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
                            Connect a wallet to transfer tokens.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </PageShell>
        )
    }

    const selected =
        transferableTokens.find((t) => t.id === selectedId) ?? transferableTokens[0]

    return (
        <PageShell>
            <PageHeader
                title="Transfer"
                description="Send tokens from your wallet. Switch to the token's chain before signing."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Select token</CardTitle>
                    <CardDescription>
                        Any managed token with transfer support.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        {transferableTokens.map((token) => {
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

            <TransferForm
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
