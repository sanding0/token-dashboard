'use client'

import { Button } from "@/components/ui/button"
import { normalize } from "viem/ens"
import { useConnection, useDisconnect, useEnsAvatar, useEnsName } from "wagmi"

export default function WalletInfo() {
    const { address } = useConnection()
    const { data: ensName } = useEnsName({ address })
    const { data: ensAvatar } = useEnsAvatar({ name: ensName ? normalize(ensName) : undefined })
    const { mutate: disconnect } = useDisconnect()

    return (
        <div>
            {ensAvatar && <img src={ensAvatar} alt='ENS Avatar' className="w-10 h-10 rounded-full" />}
            {address && <div> {ensName ? `${ensName}(${address})` : `${address}`} </div>}

            <Button variant="outline" onClick={() => disconnect()}>
                Disconnect
            </Button>
        </div>
    )

}