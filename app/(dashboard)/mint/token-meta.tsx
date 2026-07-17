'use client'

import { useERC20TokenMeta, useTokenOwner } from "@/hooks/use-token-meta"
import { MyTokenABI } from "@/lib/abis/MyToken"
import { Address, isAddress, parseUnits } from "viem"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { toast } from "sonner";
import { getMintErrorMessage } from "@/lib/wallet-errors";

export type TokenMetaProps = {
    chainId: number
    address: Address,
    walletChainId: number
    walletAddress: Address
}


export default function TokenMeta({ chainId, address, walletChainId, walletAddress }: TokenMetaProps) {
    const { decimals, symbol } = useERC20TokenMeta({
        contractAddress: address,
        chainId,
    })
    const owner = useTokenOwner({ contractAddress: address, chainId }, MyTokenABI)
    const [amount, setAmount] = useState<string>('')
    const [to, setTo] = useState<string>('')

    const isOwner = !!walletAddress && !!owner && walletAddress.toLowerCase() === owner.toLowerCase()
    const { mutate: writeContract, data: hash, isPending, error } = useWriteContract()

    const { isLoading: isReceiptLoading, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash
    })

    useEffect(() => {
        if (isReceiptSuccess) {
            toast.success('Mint transaction successful')
        }
    }, [isReceiptSuccess])
    const handleMint = async () => {
        if (walletChainId !== chainId) {
            toast.error('Wallet is not on the correct chain. Please switch to the correct chain.')
            return
        }

        if (!isOwner) {
            toast.error('You are not the owner of the contract')
            return
        }

        if (!to) {
            toast.error('Recipient address is required')
            return
        }

        if (!amount) {
            toast.error('Amount is required')
            return
        }

        if (!isAddress(to)) {
            toast.error('Invalid recipient address')
            return
        }

        const value = parseUnits(amount, decimals || 18)

        writeContract(
            {
                address,
                abi: MyTokenABI,
                functionName: 'mint',
                args: [to, value]
            },
            {
                onSuccess: () => {
                    toast.success('Mint transaction sent')
                },
                onError: (error) => {
                    const errorMessage = getMintErrorMessage(error)
                    toast.error(errorMessage)
                }
            }
        )
    }

    return (
        <>
            <h1>Mint</h1>
            <p>chainId: {chainId}</p>
            <p>owner: {owner as string}</p>
            <Field>
                <FieldLabel htmlFor="input-demo-address">To</FieldLabel>
                <Input id="input-demo-address" type="text" placeholder="0x..." value={to} onChange={(e) => setTo(e.target.value as Address)} />
                <FieldDescription>
                    Enter the address to mint to
                </FieldDescription>
            </Field>
            <Field>
                <FieldLabel htmlFor="input-demo-amount">Amount</FieldLabel>
                <Input id="input-demo-amount" type="text" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <FieldDescription>
                    Enter the amount to mint ({symbol})
                </FieldDescription>
            </Field>
            <Button
                onClick={handleMint}
                disabled={!isOwner || isPending || isReceiptLoading}
            >
                {isPending ? "Signing..." : isReceiptLoading ? "Confirming..." : "mint"}
            </Button>
        </>
    )
}