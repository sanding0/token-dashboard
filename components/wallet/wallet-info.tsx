'use client'

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
        <>
            <div className="flex flex-col gap-1 items-center">
                <div className="px-2 flex gap-1 items-center">
                    <Avatar>
                        <AvatarImage src={ensAvatar as string} />
                        <AvatarFallback>
                            {displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    {isConnecting ? <Skeleton className="w-20 h-4" /> : <span>{displayName}</span>}
                    <CopyButton value={address} />
                </div>

                {balanceLoading ?
                    <Skeleton className="w-full h-4" />
                    : <div className="text-muted-foreground text-sm flex gap-1 items-center px-2">
                        <ChainSwitchDialog
                            trigger={
                                <Button variant="ghost" size="sm" className="p-0 px-1">
                                    <ChainIcon chainId={chain?.id} />
                                    {`${chain?.name} `}
                                </Button>
                            }>
                        </ChainSwitchDialog>
                        <span className="hover:text-text-alternative cursor-pointer" onClick={() => setBalanceVisible(!balanceVisible)}>
                            {balanceVisible ? balance?.value ? formatUnits(balance?.value, balance?.decimals) : 0 : "•••••"}
                            {` ${balance?.symbol}`}
                        </span>
                    </div>
                }
            </div>
            <Button variant="ghost" size="icon" onClick={() => connector.disconnect()}>
                <LogOut className="w-4 h-4" />
            </Button>
        </>
    )
}