'use client'

import { useConnection } from "wagmi";
import ConnectButton from "./_components/connect-button";
import WalletInfo from "./_components/wallet-info";

export default function ConnectPage() {
    const {isConnected} = useConnection()
    return (
        <>
            {isConnected ? <WalletInfo /> : <ConnectButton />}
        </>
    )
}