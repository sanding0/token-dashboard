'use client'

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    type Connector,
    ConnectorAlreadyConnectedError,
    ProviderNotFoundError,
    useConnect,
    useConnectors,
} from "wagmi"

function isUserRejected(error: unknown): boolean {
    if (!error || typeof error !== 'object') return false
    const e = error as { name?: string; code?: number; message?: string; shortMessage?: string }
    if (e.name === 'UserRejectedRequestError' || e.code === 4001) return true
    const text = `${e.message ?? ''} ${e.shortMessage ?? ''}`
    return /user rejected|connection request reset/i.test(text)
}

function getConnectErrorMessage(error: unknown): string | null {
    if (isUserRejected(error)) return null
    if (error instanceof ConnectorAlreadyConnectedError) {
        return 'Wallet already connected'
    }

    if (error instanceof ProviderNotFoundError) {
        return 'Wallet service initialization failed, please refresh the page and try again'
    }

    if (error && typeof error === 'object' && 'shortMessage' in error) {
        const msg = (error as { shortMessage: string }).shortMessage
        if (msg) return msg
    }
    return 'Wallet connection failed, please try again later'
}

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
