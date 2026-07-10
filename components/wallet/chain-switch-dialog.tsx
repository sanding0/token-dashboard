'use client'

import ChainIcon from "@/components/common/chain-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getSwitchChainErrorMessage } from "@/lib/wallet-errors";
import { useState } from "react";
import { toast } from "sonner";
import { useChainId, useChains, useSwitchChain } from "wagmi";

export type ChainSwitchDialogProps = {
    trigger: React.ReactElement
}

export default function ChainSwitchDialog({ trigger }: ChainSwitchDialogProps) {
    const chains = useChains()
    const [dialogOpen, setDialogOpen] = useState(false)
    const currentChainId = useChainId()
    const { isPending, mutateAsync: switchChain } = useSwitchChain()
    const [loadingChainId, setLoadingChainId] = useState<number | null>(null)

    const handleSwitchChain = async (chainId: number) => {
        if (chainId === currentChainId) return

        setLoadingChainId(chainId)
        try {
            await switchChain({ chainId })
            toast.success('Switched chain successfully')
            setDialogOpen(false)
        } catch (error) {
            const message = getSwitchChainErrorMessage(error)
            toast.error(message)
        } finally {
            setLoadingChainId(null)
        }
    }

    const renderChainList = (list: typeof chains) => {
        return list.map((chain) => {
            const isCurrent = chain.id === currentChainId
            const isLoadingChain = loadingChainId === chain.id
            return (
                <Button
                    disabled={isCurrent || isPending}
                    variant="ghost"
                    size="lg"
                    key={chain.id}
                    className="text-base"
                    onClick={() => handleSwitchChain(chain.id)}
                >
                    <ChainIcon chainId={chain.id} />
                    {chain.name}
                    <span
                        className={
                            cn(
                                "inline-block w-2 h-2 rounded-full ml-auto",
                                isCurrent && !isPending && 'bg-green-500',
                                isLoadingChain && isPending && 'bg-yellow-500',
                            )
                        }
                    />
                </Button>

            )
        })

    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={trigger}>
            </DialogTrigger>

            <DialogContent className='gap-y-2 text-base'>
                <DialogHeader className="font-bold text-lg">
                    Switch Chain
                </DialogHeader>
                <DialogDescription>
                    Switch the chain you are connected to.
                </DialogDescription>

                <div className="flex flex-col gap-2">
                    {renderChainList(chains)}
                </div>
            </DialogContent>
        </Dialog>
    )
}