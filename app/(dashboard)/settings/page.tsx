"use client"

import ChainIcon from "@/components/common/chain-icon"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useManagedTokens } from "@/hooks/use-managed-tokens"
import {
    DEFAULT_TOKEN_KIND,
    TOKEN_KINDS,
    TOKEN_KIND_IDS,
    getTokenKind,
    type TokenKindId,
} from "@/lib/token-kinds"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { getAddress, isAddress } from "viem"
import { useChainId, useChains } from "wagmi"

export default function SettingsPage() {
    const chains = useChains()
    const walletChainId = useChainId()
    const { tokens, addToken, removeToken, clear, hydrated } = useManagedTokens()

    const [label, setLabel] = useState("")
    const [address, setAddress] = useState("")
    const [chainId, setChainId] = useState<number>(walletChainId || chains[0]?.id || 1)
    const [kind, setKind] = useState<TokenKindId>(DEFAULT_TOKEN_KIND)

    const handleAdd = (e: React.SubmitEvent) => {
        e.preventDefault()

        const trimmedLabel = label.trim()
        if (!trimmedLabel) {
            toast.error("Label is required")
            return
        }

        if (!isAddress(address)) {
            toast.error("Invalid contract address")
            return
        }

        if (!chains.some((c) => c.id === chainId)) {
            toast.error("Unsupported chain")
            return
        }

        const normalized = getAddress(address)
        const exists = tokens.some(
            (t) =>
                t.chainId === chainId &&
                t.address.toLowerCase() === normalized.toLowerCase(),
        )
        if (exists) {
            toast.error("This token is already added")
            return
        }

        addToken({
            id: crypto.randomUUID(),
            label: trimmedLabel,
            chainId,
            address: normalized,
            kind,
        })

        setLabel("")
        setAddress("")
        setKind(DEFAULT_TOKEN_KIND)
        toast.success("Token added")
    }

    const handleClear = () => {
        if (tokens.length === 0) return
        clear()
        toast.success("All tokens cleared")
    }

    if (!hydrated) {
        return <p className="text-sm text-muted-foreground">Loading…</p>
    }

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
            <div>
                <h1 className="text-xl font-medium">Settings</h1>
                <p className="text-sm text-muted-foreground">
                    Manage tokens stored in localStorage for this dashboard.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Add token</CardTitle>
                    <CardDescription>
                        Save a contract address and chain so Dashboard and Mint can use it.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAdd}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="token-label">Label</FieldLabel>
                                <Input
                                    id="token-label"
                                    placeholder="MyToken"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                />
                                <FieldDescription>Display name in the UI</FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="token-chain">Chain</FieldLabel>
                                <select
                                    id="token-chain"
                                    value={chainId}
                                    onChange={(e) => setChainId(Number(e.target.value))}
                                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    {chains.map((chain) => (
                                        <option key={chain.id} value={chain.id}>
                                            {chain.name} ({chain.id})
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="token-kind">Type</FieldLabel>
                                <select
                                    id="token-kind"
                                    value={kind}
                                    onChange={(e) => setKind(e.target.value as TokenKindId)}
                                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                >
                                    {TOKEN_KIND_IDS.map((id) => (
                                        <option key={id} value={id}>
                                            {TOKEN_KINDS[id].label}
                                        </option>
                                    ))}
                                </select>
                                <FieldDescription>
                                    {TOKEN_KINDS[kind].description}
                                </FieldDescription>
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="token-address">Contract address</FieldLabel>
                                <Input
                                    id="token-address"
                                    placeholder="0x…"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    spellCheck={false}
                                />
                            </Field>

                            <Button type="submit">Add token</Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="has-data-[slot=card-action]:grid-cols-[1fr_auto]">
                    <CardTitle>Managed tokens</CardTitle>
                    <CardDescription>
                        {tokens.length === 0
                            ? "No tokens yet."
                            : `${tokens.length} token${tokens.length === 1 ? "" : "s"} saved.`}
                    </CardDescription>
                    {tokens.length > 0 && (
                        <CardAction>
                            <Button type="button" variant="destructive" size="sm" onClick={handleClear}>
                                Clear all
                            </Button>
                        </CardAction>
                    )}
                </CardHeader>
                <CardContent>
                    {tokens.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Add a token above to get started.
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-3">
                            {tokens.map((token) => {
                                const chain = chains.find((c) => c.id === token.chainId)
                                return (
                                    <li
                                        key={token.id}
                                        className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
                                    >
                                        <div className="flex min-w-0 items-start gap-2">
                                            <ChainIcon chainId={token.chainId} className="mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="font-medium">{token.label}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {chain?.name ?? "Unknown"} · {token.chainId} ·{" "}
                                                    {getTokenKind(token.kind).label}
                                                </p>
                                                <p className="truncate font-mono text-xs text-muted-foreground">
                                                    {token.address}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            aria-label={`Remove ${token.label}`}
                                            onClick={() => {
                                                removeToken(token.id)
                                                toast.success("Token removed")
                                            }}
                                        >
                                            <Trash2 />
                                        </Button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
