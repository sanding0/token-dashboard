'use client'
import { Button } from "@/components/ui/button"
import { useConnect, useConnectors } from "wagmi"

export default function ConnectButton() {
    const { mutate: connect } = useConnect()
    const connectors = useConnectors()

    return (
        <div className="flex items-center gap-2 md:flex-row">
          {
            connectors.map((connector) =>
                <Button
                    key={connector.uid}
                    onClick={() => connect({ connector })}
                >
                    {connector.name}
                </Button>
            )
          } 
        </div>
    ) 

}