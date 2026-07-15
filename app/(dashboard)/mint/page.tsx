'use client'

import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MyTokenABI } from "@/lib/abis/MyToken";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { isAddress, parseUnits, type Address } from "viem";
import { useConnection, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address || ''

export default function MintPage() {
    const { address, isConnected, chainId } = useConnection()
    const [to, setTo] = useState<string>('')
    const [amount, setAmount] = useState<string>('')

    const { data: owner } = useReadContract({
        address: contractAddress,
        abi: MyTokenABI,
        functionName: 'owner',
        query: { enabled: Boolean(contractAddress) }
    })

    const { data: decimals } = useReadContract({
        address: contractAddress,
        abi: MyTokenABI,
        functionName: 'decimals'
    })

    const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase()

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
        if (!contractAddress) {
            toast.error('Contract address is not set')
            return
        }
        if (!isConnected || !address) {
            toast.error('Wallet not connected')
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
                address: contractAddress,
                abi: MyTokenABI,
                functionName: 'mint',
                args: [to, value]
            },
            {
                onSuccess: () => {
                    toast.success('Mint transaction sent')
                },
                onError: (error) => {
                    toast.error(error.message)
                }
            }
        )
    }

    return (
        <div>
            <h1>Mint</h1>
            <p>chainId: {chainId}(Anvil should be 31337)</p>
            <p>owner: {owner as string}</p>
            <p>You are owner: {isOwner ? "Yes" : "No"}</p>

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
                    Enter the amount to mint (MT)
                </FieldDescription>
            </Field>
            <Button
                onClick={handleMint}
                disabled={!isOwner || isPending || isReceiptLoading}
            >
                {isPending ? "Signing..." : isReceiptLoading ? "Confirming..." : "mint"}
            </Button>
        </div>
    )
}