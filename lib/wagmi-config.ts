import { arbitrum, mainnet, polygon, sepolia, anvil } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";

const walletConnectProjectId =
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

export const wagmiConfig = createConfig({
    chains: [mainnet, arbitrum, polygon, sepolia, anvil],
    ssr: true,
    connectors: [
        injected({ shimDisconnect: true }),
        ...(walletConnectProjectId
            ? [
                walletConnect({
                    projectId: walletConnectProjectId,
                    showQrModal: true
                })
            ]
            : []),
    ],
    transports: {
        [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || undefined),
        [sepolia.id]: http(),
        [arbitrum.id]: http(),
        [polygon.id]: http(),
        [anvil.id]: http(),
    }
})