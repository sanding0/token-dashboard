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
        <div className="flex max-w-[min(100%,18rem)] flex-wrap items-center justify-end gap-1.5 sm:max-w-none">
            {connectors.map((connector) => (
                <Button
                    key={connector.uid}
                    size="sm"
                    className="max-w-34 truncate sm:max-w-none"
                    onClick={() => handleConnect(connector)}
                >
                    {connector.name}
                </Button>
            ))}
        </div>
    )
}
