import { mainnet, sepolia } from "viem/chains";
import { createConfig, http } from "wagmi";
import { walletConnect } from "wagmi/connectors";

export const wagmiConfig = createConfig({
    chains: [mainnet, sepolia],
    ssr: true,
    connectors: [
        walletConnect({
            projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
            showQrModal: true
        })
    ],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
    }
})