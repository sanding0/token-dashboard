import { arbitrum, mainnet, polygon, sepolia, anvil } from "viem/chains";
import { createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
    chains: [mainnet, arbitrum, polygon, sepolia, anvil],
    ssr: true,
    connectors: [
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
            showQrModal: true
        })
    ],
    transports: {
        [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_RPC_URL || ''),
        [sepolia.id]: http(),
        [arbitrum.id]: http(),
        [polygon.id]: http(),
        [anvil.id]: http(),
    }
})