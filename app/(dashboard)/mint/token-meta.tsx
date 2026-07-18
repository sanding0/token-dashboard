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
import { useERC20TokenMeta, useTokenOwner } from "@/hooks/use-token-meta"
import { getExplorerTxUrl, shortenHash } from "@/lib/explorer"
import { getMintErrorMessage, getSwitchChainErrorMessage } from "@/lib/wallet-errors"
import { ExternalLink } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { isAddress, parseUnits, type Abi, type Address } from "viem"
import {
    useChains,
    useSwitchChain,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi"

export type TokenMetaProps = {
    label: string
    chainId: number
    address: Address
    abi: Abi
    walletChainId: number
    walletAddress: Address
}

export default function TokenMeta({
    label,
    chainId,
    address,
    abi,
    walletChainId,
    walletAddress,
}: TokenMetaProps) {
    const chains = useChains()
    const chain = chains.find((c) => c.id === chainId)
    const wrongChain = walletChainId !== chainId

    const { decimals, symbol, isLoading: isMetaLoading } = useERC20TokenMeta({
        contractAddress: address,
        chainId,
    })
    const { owner, isLoading: isOwnerLoading } = useTokenOwner(
        { contractAddress: address, chainId },
        abi,
    )
    const [amount, setAmount] = useState<string>('')
    const [to, setTo] = useState<string>('')
    const toastedHash = useRef<string | null>(null)

    const isOwner = !!walletAddress && !!owner && walletAddress.toLowerCase() === owner.toLowerCase()
    const { mutate: writeContract, data: hash, isPending } = useWriteContract()
    const { mutateAsync: switchChain, isPending: isSwitching } = useSwitchChain()

    const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash
    })

    useEffect(() => {
        if (!isReceiptSuccess || !hash || toastedHash.current === hash) return
        toastedHash.current = hash
        const url = getExplorerTxUrl(chainId, hash, chains)
        toast.success('Mint confirmed', {
            description: url ? shortenHash(hash) : 'Transaction mined',
            action: url
                ? {
                    label: 'View',
                    onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
                }
                : undefined,
        })
    }, [isReceiptSuccess, hash, chainId, chains])

    const handleSwitchChain = async () => {
        try {
            await switchChain({ chainId })
            toast.success(`Switched to ${chain?.name ?? chainId}`)
        } catch (error) {
            const message = getSwitchChainErrorMessage(error)
            if (message) toast.error(message)
        }
    }

    const handleMint = async () => {
        if (wrongChain) {
            toast.error('Switch to the token chain before minting')
            return
        }

        if (!isOwner) {
            toast.error('You are not the owner of the contract')
            return
        }

        if (!to) {
            toast.error('Recipient address is required')
            return
        }

        if (!amount) {
            toast.error('Amount is required')
            return
        }

        if (!isAddress(to)) {
            toast.error('Invalid recipient address')
            return
        }

        if (decimals === undefined) {
            toast.error('Token decimals not loaded yet')
            return
        }

        const value = parseUnits(amount, decimals)

        writeContract(
            {
                address,
                abi,
                functionName: 'mint',
                args: [to, value],
                chainId,
            },
            {
                onSuccess: (txHash) => {
                    toast.success('Mint transaction sent', {
                        description: shortenHash(txHash),
                    })
                },
                onError: (error) => {
                    const errorMessage = getMintErrorMessage(error)
                    if (errorMessage) toast.error(errorMessage)
                }
            }
        )
    }

    const explorerUrl = hash ? getExplorerTxUrl(chainId, hash, chains) : null
    const mintDisabled =
        wrongChain ||
        !isOwner ||
        isPending ||
        isReceiptLoading ||
        isMetaLoading ||
        decimals === undefined

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ChainIcon chainId={chainId} />
                    Mint {label}
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

                <div className="grid gap-1 text-sm">
                    <p>
                        <span className="text-muted-foreground">Symbol: </span>
                        {isMetaLoading ? "…" : (symbol ?? "—")}
                    </p>
                    <p>
                        <span className="text-muted-foreground">Owner: </span>
                        {isOwnerLoading ? "…" : (
                            <span className="break-all font-mono text-xs">{owner ?? "—"}</span>
                        )}
                    </p>
                    <p>
                        <span className="text-muted-foreground">You are owner: </span>
                        {isOwnerLoading ? "…" : isOwner ? "Yes" : "No"}
                    </p>
                </div>

                <Field>
                    <FieldLabel htmlFor="mint-to">To</FieldLabel>
                    <Input
                        id="mint-to"
                        type="text"
                        placeholder="0x..."
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        spellCheck={false}
                    />
                    <FieldDescription>
                        Enter the address to mint to
                    </FieldDescription>
                </Field>
                <Field>
                    <FieldLabel htmlFor="mint-amount">Amount</FieldLabel>
                    <Input
                        id="mint-amount"
                        type="text"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                    <FieldDescription>
                        Enter the amount to mint ({symbol})
                    </FieldDescription>
                </Field>
                <Button
                    className="w-full sm:w-auto"
                    onClick={handleMint}
                    disabled={mintDisabled}
                >
                    {isPending
                        ? "Signing..."
                        : isReceiptLoading
                            ? "Confirming..."
                            : wrongChain
                                ? "Wrong network"
                                : !isOwner
                                    ? "Not owner"
                                    : "mint"}
                </Button>

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
