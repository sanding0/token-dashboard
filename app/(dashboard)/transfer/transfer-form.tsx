"use client"

import ChainIcon from "@/components/common/chain-icon"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useERC20TokenMeta } from "@/hooks/use-token-meta"
import { useTokenBalance } from "@/hooks/use-token-balance"
import { getExplorerTxUrl, shortenHash } from "@/lib/explorer"
import { getSwitchChainErrorMessage, getTransferErrorMessage } from "@/lib/wallet-errors"
import { ExternalLink } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { formatUnits, isAddress, parseUnits, type Abi, type Address } from "viem"
import {
    useChains,
    useSwitchChain,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi"

export type TransferFormProps = {
    label: string
    chainId: number
    address: Address
    abi: Abi
    walletChainId: number
    walletAddress: Address
}

export default function TransferForm({
    label,
    chainId,
    address,
    abi,
    walletChainId,
    walletAddress,
}: TransferFormProps) {
    const chains = useChains()
    const chain = chains.find((c) => c.id === chainId)
    const wrongChain = walletChainId !== chainId

    const { decimals, symbol, isLoading: isMetaLoading } = useERC20TokenMeta({
        contractAddress: address,
        chainId,
    }, abi)

    const {
        raw: balanceRaw,
        formatted: balanceFormatted,
        isLoading: isBalanceLoading,
        refetch: refetchBalance,
    } = useTokenBalance({
        contractAddress: address,
        accountAddress: walletAddress,
        chainId,
    }, abi)

    const [to, setTo] = useState("")
    const [amount, setAmount] = useState("")
    const toastedHash = useRef<string | null>(null)

    const { mutate: writeContract, data: hash, isPending, reset } = useWriteContract()
    const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain()

    const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } =
        useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        if (!isReceiptSuccess || !hash || toastedHash.current === hash) return
        toastedHash.current = hash
        void refetchBalance()
        const url = getExplorerTxUrl(chainId, hash, chains)
        toast.success("Transfer confirmed", {
            description: url ? shortenHash(hash) : "Transaction mined",
            action: url
                ? {
                    label: "View",
                    onClick: () => window.open(url, "_blank", "noopener,noreferrer"),
                }
                : undefined,
        })
    }, [isReceiptSuccess, hash, chainId, chains, refetchBalance])

    const handleSwitchChain = async () => {
        try {
            await switchChain({ chainId })
            toast.success(`Switched to ${chain?.name ?? chainId}`)
        } catch (error) {
            const message = getSwitchChainErrorMessage(error)
            if (message) toast.error(message)
        }
    }

    const handleMax = () => {
        if (balanceRaw === undefined || decimals === undefined) return
        setAmount(formatUnits(balanceRaw as bigint, decimals))
    }

    const handleTransfer = () => {
        if (wrongChain) {
            toast.error("Switch to the token chain before transferring")
            return
        }

        if (!to) {
            toast.error("Recipient address is required")
            return
        }

        if (!isAddress(to)) {
            toast.error("Invalid recipient address")
            return
        }

        if (to.toLowerCase() === walletAddress.toLowerCase()) {
            toast.error("Cannot transfer to your own address")
            return
        }

        if (!amount) {
            toast.error("Amount is required")
            return
        }

        if (decimals === undefined) {
            toast.error("Token decimals not loaded yet")
            return
        }

        let value: bigint
        try {
            value = parseUnits(amount, decimals)
        } catch {
            toast.error("Invalid amount")
            return
        }

        if (value <= BigInt(0)) {
            toast.error("Amount must be greater than zero")
            return
        }

        if (balanceRaw !== undefined && value > (balanceRaw as bigint)) {
            toast.error("Insufficient balance")
            return
        }

        writeContract(
            {
                address,
                abi,
                functionName: "transfer",
                args: [to, value],
                chainId,
            },
            {
                onSuccess: (txHash) => {
                    toast.success("Transfer transaction sent", {
                        description: shortenHash(txHash),
                    })
                },
                onError: (error) => {
                    const message = getTransferErrorMessage(error)
                    if (message) toast.error(message)
                },
            },
        )
    }

    const explorerUrl = hash ? getExplorerTxUrl(chainId, hash, chains) : null
    const transferDisabled =
        wrongChain ||
        isPending ||
        isReceiptLoading ||
        isMetaLoading ||
        isBalanceLoading ||
        decimals === undefined

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ChainIcon chainId={chainId} />
                    Transfer {label}
                </CardTitle>
                <CardDescription className="break-all">
                    {chain?.name ?? `Chain ${chainId}`} ·{" "}
                    <span className="font-mono text-xs">{address}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {wrongChain && (
                    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm">
                            Wallet is on chain {walletChainId}. This token is on{" "}
                            {chain?.name ?? chainId}.
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            disabled={isSwitching}
                            onClick={handleSwitchChain}
                        >
                            {isSwitching ? "Switching…" : `Switch to ${chain?.name ?? chainId}`}
                        </Button>
                    </div>
                )}

                <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-xs text-muted-foreground">Your balance</p>
                    <p className="font-medium tabular-nums">
                        {isBalanceLoading
                            ? "Loading…"
                            : `${balanceFormatted ?? "0"} ${symbol ?? ""}`}
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="transfer-to">To</FieldLabel>
                    <Input
                        id="transfer-to"
                        type="text"
                        placeholder="0x…"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        spellCheck={false}
                    />
                    <FieldDescription>Recipient wallet address</FieldDescription>
                </Field>

                <Field>
                    <div className="flex items-center justify-between gap-2">
                        <FieldLabel htmlFor="transfer-amount">Amount</FieldLabel>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto px-1 text-xs"
                            disabled={balanceRaw === undefined || decimals === undefined}
                            onClick={handleMax}
                        >
                            Max
                        </Button>
                    </div>
                    <Input
                        id="transfer-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <FieldDescription>
                        Amount to send{symbol ? ` (${symbol})` : ""}
                    </FieldDescription>
                </Field>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                        className="w-full sm:w-auto"
                        onClick={handleTransfer}
                        disabled={transferDisabled}
                    >
                        {isPending
                            ? "Signing…"
                            : isReceiptLoading
                                ? "Confirming…"
                                : wrongChain
                                    ? "Wrong network"
                                    : "Transfer"}
                    </Button>
                    {hash && (
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                            onClick={() => {
                                reset()
                                toastedHash.current = null
                                setAmount("")
                            }}
                        >
                            New transfer
                        </Button>
                    )}
                </div>

                {hash && (
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>Tx:</span>
                        <span className="font-mono text-xs">{shortenHash(hash)}</span>
                        {explorerUrl && (
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-foreground underline-offset-4 hover:underline"
                            >
                                Explorer
                                <ExternalLink className="size-3.5" />
                            </a>
                        )}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
