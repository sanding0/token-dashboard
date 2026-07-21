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
import { useMemo, useState } from "react"
import { useChains, useConnection } from "wagmi"
import NativeTransferForm from "./native-transfer-form"
import TransferForm from "./transfer-form"

const NATIVE_SELECTION_ID = "native"

export default function TransferPage() {
    const { address, isConnected, chainId } = useConnection()
    const chains = useChains()
    const { tokens, hydrated } = useManagedTokens()
    const [selectedId, setSelectedId] = useState<string>(NATIVE_SELECTION_ID)

    const transferableTokens = tokens.filter((t) =>
        tokenHasCapability(t.kind, "transfer"),
    )

    const nativeChain = useMemo(
        () => chains.find((c) => c.id === chainId),
        [chains, chainId],
    )
    const nativeSymbol = nativeChain?.nativeCurrency.symbol ?? "ETH"

    const isNativeActive =
        selectedId === NATIVE_SELECTION_ID ||
        !transferableTokens.some((t) => t.id === selectedId)

    const activeToken = isNativeActive
        ? null
        : transferableTokens.find((t) => t.id === selectedId) ?? null

    if (!hydrated) {
        return <p className="text-sm text-muted-foreground">Loading…</p>
    }

    if (!isConnected || !address || !chainId) {
        return (
            <PageShell>
                <Card>
                    <CardHeader>
                        <CardTitle>Wallet not connected</CardTitle>
                        <CardDescription>
                            Connect a wallet to transfer native currency or tokens.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </PageShell>
        )
    }

    return (
        <PageShell>
            <PageHeader
                title="Transfer"
                description="Send native currency or ERC20 tokens. Switch network before signing if needed."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Select asset</CardTitle>
                    <CardDescription>
                        Native currency on your connected chain, or a managed token.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-2">
                        <Button
                            type="button"
                            variant={isNativeActive ? "secondary" : "ghost"}
                            size="lg"
                            className="h-auto w-full justify-start gap-2 py-2"
                            onClick={() => setSelectedId(NATIVE_SELECTION_ID)}
                        >
                            <ChainIcon chainId={chainId} className="shrink-0" />
                            <span className="flex min-w-0 flex-col items-start text-left">
                                <span className="truncate">{nativeSymbol}</span>
                                <span className="text-xs font-normal text-muted-foreground">
                                    Native · {nativeChain?.name ?? `Chain ${chainId}`}
                                </span>
                            </span>
                        </Button>

                        {transferableTokens.map((token) => {
                            const isActive = activeToken?.id === token.id
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

            {isNativeActive ? (
                <NativeTransferForm
                    key={`native-${chainId}`}
                    chainId={chainId}
                    walletAddress={address}
                    walletChainId={chainId}
                />
            ) : activeToken ? (
                <TransferForm
                    key={activeToken.id}
                    chainId={activeToken.chainId}
                    address={activeToken.address}
                    label={activeToken.label}
                    abi={getTokenAbi(activeToken.kind)}
                    walletAddress={address}
                    walletChainId={chainId}
                />
            ) : null}
        </PageShell>
    )
}
