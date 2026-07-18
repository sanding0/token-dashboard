import { MyTokenABI } from "@/lib/abis/MyToken"
import { erc20Abi, type Abi } from "viem"

export const TOKEN_KIND_IDS = ["erc20", "ownableMintable"] as const

export type TokenKindId = (typeof TOKEN_KIND_IDS)[number]

export type TokenCapability = "balance" | "transfer" | "owner" | "mint"

type TokenKindConfig = {
    id: TokenKindId
    label: string
    description: string
    abi: Abi
    capabilities: readonly TokenCapability[]
}

export const TOKEN_KINDS: Record<TokenKindId, TokenKindConfig> = {
    erc20: {
        id: "erc20",
        label: "ERC20",
        description: "Standard token — balance and transfer",
        abi: erc20Abi,
        capabilities: ["balance", "transfer"],
    },
    ownableMintable: {
        id: "ownableMintable",
        label: "Ownable + Mint",
        description: "ERC20 with owner() and mint() (e.g. MyToken)",
        abi: MyTokenABI,
        capabilities: ["balance", "transfer", "owner", "mint"],
    },
}

export const DEFAULT_TOKEN_KIND: TokenKindId = "ownableMintable"

export function isTokenKindId(value: unknown): value is TokenKindId {
    return typeof value === "string" && value in TOKEN_KINDS
}

export function getTokenKind(kind: TokenKindId = DEFAULT_TOKEN_KIND) {
    return TOKEN_KINDS[kind] ?? TOKEN_KINDS[DEFAULT_TOKEN_KIND]
}

export function getTokenAbi(kind: TokenKindId = DEFAULT_TOKEN_KIND): Abi {
    return getTokenKind(kind).abi
}

export function tokenHasCapability(
    kind: TokenKindId | undefined,
    capability: TokenCapability,
) {
    return getTokenKind(kind).capabilities.includes(capability)
}
