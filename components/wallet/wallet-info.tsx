import { Button } from "@/components/ui/button"
import { mainnet } from "viem/chains"
import { normalize } from "viem/ens"
import { Connector, useBalance, useConnection, useEnsAvatar, useEnsName } from "wagmi"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatUnits } from "viem"
import CopyButton from "@/components/common/copy-button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { LogOut } from "lucide-react"
import ChainSwitchDialog from "@/components/wallet/chain-switch-dialog"
import ChainIcon from "@/components/common/chain-icon"

function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletInfo({ connector }: {
    connector: Connector
}) {
    const { address, chain, isConnecting } = useConnection()
    const { data: ensName } = useEnsName({
        address,
        chainId: mainnet.id,
    })
    const { data: ensAvatar } = useEnsAvatar({
        name: ensName ? normalize(ensName) : undefined,
        chainId: mainnet.id,
    })
    const { data: balance, isLoading: balanceLoading } = useBalance({ address })
    const [balanceVisible, setBalanceVisible] = useState(false)

    if (!address) return null

    const displayName = ensName ?? truncateAddress(address)

    return (
        <div className="flex max-w-full items-center gap-0.5 sm:gap-1">
            <div className="flex min-w-0 items-center gap-1.5 rounded-lg bg-background">
                <Avatar className="size-7 shrink-0 sm:size-8">
                    <AvatarImage src={ensAvatar as string} />
                    <AvatarFallback>
                        {displayName.charAt(0)}
                    </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                    <div className="flex items-center gap-0.5">
                        {isConnecting ? (
                            <Skeleton className="h-4 w-16 sm:w-20" />
                        ) : (
                            <span className="max-w-[5.5rem] truncate text-sm sm:max-w-[9rem] md:max-w-[12rem]">
                                {displayName}
                            </span>
                        )}
                        <span className="hidden sm:inline-flex">
                            <CopyButton value={address} />
                        </span>
                    </div>

                    {balanceLoading ? (
                        <Skeleton className="mt-1 hidden h-3 w-24 sm:block" />
                    ) : (
                        <div className="mt-0.5 hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                            <ChainSwitchDialog
                                trigger={
                                    <Button variant="ghost" size="sm" className="h-auto max-w-[7rem] truncate p-0 px-1 text-xs">
                                        <ChainIcon chainId={chain?.id} />
                                        <span className="truncate">{chain?.name}</span>
                                    </Button>
                                }>
                            </ChainSwitchDialog>
                            <button
                                type="button"
                                className="cursor-pointer truncate hover:text-foreground"
                                onClick={() => setBalanceVisible(!balanceVisible)}
                            >
                                {balanceVisible ? balance?.value ? formatUnits(balance?.value, balance?.decimals) : 0 : "•••••"}
                                {` ${balance?.symbol}`}
                            </button>
                        </div>
                    )}
                </div>

                <div className="sm:hidden">
                    <ChainSwitchDialog
                        trigger={
                            <Button variant="ghost" size="icon-sm" aria-label="Switch chain">
                                <ChainIcon chainId={chain?.id} />
                            </Button>
                        }
                    />
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 sm:size-8"
                aria-label="Disconnect"
                onClick={() => connector.disconnect()}
            >
                <LogOut className="w-4 h-4" />
            </Button>
        </div>
    )
}