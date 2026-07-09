'use client'

import { Button } from "@/components/ui/button"
import { mainnet } from "viem/chains"
import { normalize } from "viem/ens"
import { useBalance, useConnection, useDisconnect, useEnsAvatar, useEnsName } from "wagmi"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { formatUnits } from "viem"
import CopyButton from "@/components/common/copy-button"
import { Skeleton } from "@/components/ui/skeleton"

function truncateAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletInfo() {
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

    const { mutate: disconnect } = useDisconnect()

    if (!address) return null

    const displayName = ensName ?? truncateAddress(address)

    return (
        <div className="flex items-center gap-3">
            <Avatar>
                <AvatarImage src={ensAvatar as string} />
                <AvatarFallback>
                    {displayName.charAt(0)}
                </AvatarFallback>
            </Avatar>
            <div>
                <div className="flex items-center gap-2">
                    {isConnecting ? <Skeleton className="w-20 h-4" /> : <span>{displayName}</span>}
                    <CopyButton value={address} />
                </div>

                {balanceLoading ?
                    <Skeleton className="w-full h-4" />
                    : <div className="text-muted-foreground text-sm">
                        {`${chain?.name} · ${balance?.value ? formatUnits(balance?.value, balance?.decimals) : 0} ${balance?.symbol}`}
                    </div>
                }
            </div>
            <Button onClick={() => disconnect()}>Disconnect</Button>
        </div>
    )
}