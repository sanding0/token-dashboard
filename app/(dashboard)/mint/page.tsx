'use client'

import TokenMeta from "./token-meta";
import { useManagedTokens } from "@/hooks/use-managed-tokens";
import { useEffect } from "react";
import { toast } from "sonner";
import { useConnection } from "wagmi";

export default function MintPage() {
    const { address, isConnected, chainId } = useConnection()

    const { tokens } = useManagedTokens()

    useEffect(() => {
        if (tokens.length === 0) {
            toast.error('No tokens found')
            return
        }

        if (!isConnected || !address || !chainId) {
            toast.error('Wallet not connected')
            return
        }
    }, [tokens, isConnected, address, chainId])

    if (tokens.length === 0) {
        return <div>No tokens found</div>
    }
    if (!isConnected || !address || !chainId) {
        return <div>Wallet not connected</div>
    }

    return (
        <div>
            {tokens.map(token => (
                <TokenMeta
                    key={token.chainId}
                    {...token}
                    walletAddress={address}
                    walletChainId={chainId}
                />
            ))}
        </div>
    )
}