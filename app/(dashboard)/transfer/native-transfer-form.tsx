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
import { getExplorerTxUrl, shortenHash } from "@/lib/explorer"
import { getSwitchChainErrorMessage, getTransferErrorMessage } from "@/lib/wallet-errors"
import { ExternalLink } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { formatUnits, isAddress, parseUnits, type Address } from "viem"
import {
    useBalance,
    useChains,
    useEstimateFeesPerGas,
    useEstimateGas,
    useSendTransaction,
    useSwitchChain,
    useWaitForTransactionReceipt,
} from "wagmi"

/** Extra headroom on estimated gas cost (20%). */
const GAS_COST_BUFFER_BPS = BigInt(120)

export type NativeTransferFormProps = {
    chainId: number
    walletChainId: number
    walletAddress: Address
}

export default function NativeTransferForm({
    chainId,
    walletChainId,
    walletAddress,
}: NativeTransferFormProps) {
    const chains = useChains()
    const chain = chains.find((c) => c.id === chainId)
    const symbol = chain?.nativeCurrency.symbol ?? "ETH"
    const decimals = chain?.nativeCurrency.decimals ?? 18
    const wrongChain = walletChainId !== chainId

    const {
        data: balance,
        isLoading: isBalanceLoading,
        refetch: refetchBalance,
    } = useBalance({
        address: walletAddress,
        chainId,
        query: { enabled: Boolean(walletAddress) },
    })

    const balanceRaw = balance?.value
    const balanceFormatted =
        balanceRaw !== undefined ? formatUnits(balanceRaw, decimals) : undefined

    const [to, setTo] = useState("")
    const [amount, setAmount] = useState("")
    const [isEstimatingMax, setIsEstimatingMax] = useState(false)
    const toastedHash = useRef<string | null>(null)

    const estimateTo = isAddress(to) ? (to as Address) : walletAddress

    const { refetch: refetchGas } = useEstimateGas({
        chainId,
        account: walletAddress,
        to: estimateTo,
        // value 0 keeps estimate from failing when balance is tight; simple transfers are ~21k gas
        value: BigInt(0),
        query: { enabled: Boolean(walletAddress) && !wrongChain },
    })

    const { refetch: refetchFees } = useEstimateFeesPerGas({
        chainId,
        query: { enabled: !wrongChain },
    })

    const { mutate: sendTransaction, data: hash, isPending, reset } = useSendTransaction()
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

    const handleMax = async () => {
        if (balanceRaw === undefined) return
        if (wrongChain) {
            toast.error("Switch to the correct chain before using Max")
            return
        }

        setIsEstimatingMax(true)
        try {
            const [gasResult, feeResult] = await Promise.all([
                refetchGas(),
                refetchFees(),
            ])
            const gasLimit = gasResult.data
            const feePerGas =
                feeResult.data?.maxFeePerGas ?? feeResult.data?.gasPrice

            if (gasLimit === undefined || feePerGas === undefined) {
                toast.error("Unable to estimate gas fees")
                return
            }

            const gasCost = (gasLimit * feePerGas * GAS_COST_BUFFER_BPS) / BigInt(100)
            const max = balanceRaw > gasCost ? balanceRaw - gasCost : BigInt(0)
            if (max === BigInt(0)) {
                toast.error("Insufficient balance to cover gas")
                return
            }

            setAmount(formatUnits(max, decimals))
        } catch {
            toast.error("Unable to estimate gas fees")
        } finally {
            setIsEstimatingMax(false)
        }
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

        if (balanceRaw !== undefined && value > balanceRaw) {
            toast.error("Insufficient balance")
            return
        }

        sendTransaction(
            {
                to,
                value,
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
        wrongChain || isPending || isReceiptLoading || isBalanceLoading

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ChainIcon chainId={chainId} />
                    Transfer {symbol}
                </CardTitle>
                <CardDescription>
                    {chain?.name ?? `Chain ${chainId}`} · Native currency
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {wrongChain && (
                    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm">
                            Wallet is on chain {walletChainId}. Native transfer uses{" "}
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
                            : `${balanceFormatted ?? "0"} ${symbol}`}
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="native-transfer-to">To</FieldLabel>
                    <Input
                        id="native-transfer-to"
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
                        <FieldLabel htmlFor="native-transfer-amount">Amount</FieldLabel>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto px-1 text-xs"
                            disabled={balanceRaw === undefined || isEstimatingMax || wrongChain}
                            onClick={handleMax}
                        >
                            {isEstimatingMax ? "Estimating…" : "Max"}
                        </Button>
                    </div>
                    <Input
                        id="native-transfer-amount"
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <FieldDescription>
                        Amount to send ({symbol}). Max uses estimated gas × fee (+20% buffer).
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
