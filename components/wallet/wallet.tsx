"use client"

import { useConnection } from "wagmi"
import WalletInfo from "@/components/wallet/wallet-info"
import ConnectButton from "@/components/wallet/connect-button"

export default function WalletComponent({
    ...props
}) {
    const { isConnected } = useConnection()
    return (
        <div className="h-16 p-4 flex justify-end w-full shrink-0" {...props}>
            {isConnected ? <WalletInfo /> : <ConnectButton />}
        </div>
    )
}