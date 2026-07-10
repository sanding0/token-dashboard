"use client"

import { useConnection, useConnectionEffect } from "wagmi"
import WalletInfo from "@/components/wallet/wallet-info"
import ConnectButton from "@/components/wallet/connect-button"
import { toast } from "sonner"

export default function WalletComponent({
    ...props
}) {
    const { status, connector } = useConnection()
    useConnectionEffect({
        onConnect(data) {
            console.log(data, 'onConnect');
            if (!data.isReconnected) {
                toast.success('Wallet connected successfully');
            }
        },
        onDisconnect() {
            toast.info('Wallet disconnected successfully');
        }
    })

    return (
        <div className="p-2 flex justify-end w-full shrink-0" {...props}>
            {status === 'connected' ? <WalletInfo connector={connector} /> : <ConnectButton />}
        </div>
    )
}