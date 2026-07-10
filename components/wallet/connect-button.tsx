'use client'

import { Button } from "@/components/ui/button"
import { getConnectErrorMessage } from "@/lib/wallet-errors"
import { toast } from "sonner"
import {
    type Connector,
    useConnect,
    useConnectors,
} from "wagmi"


export default function ConnectButton() {
    const { mutate: connect } = useConnect()
    const connectors = useConnectors()
    const handleConnect = (connector: Connector) => {
        connect(
            { connector },
            {
                onError(error) {
                    const message = getConnectErrorMessage(error)
                    if (message) toast.error(message)
                }
            }
        )
    }

    return (
        <div className="flex items-center gap-2 md:flex-row">
            {connectors.map((connector) => (
                <Button
                    key={connector.uid}
                    onClick={() => handleConnect(connector)}
                >
                    {connector.name}
                </Button>
            ))}
        </div>
    )
}
