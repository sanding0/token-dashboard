import {
  DEFAULT_TOKEN_KIND,
  isTokenKindId,
  type TokenKindId,
} from "@/lib/token-kinds"
import { useLocalStorage } from "./use-local-storage"

export type ManagedToken = {
    id: string
    label: string
    chainId: number
    address: `0x${string}`
    kind: TokenKindId
    deployedAtBlock?: string
}

const STORAGE_KEY = "token-dashboard:managed-tokens"

function normalizeToken(token: ManagedToken): ManagedToken {
  const kind = isTokenKindId(token.kind) ? token.kind : DEFAULT_TOKEN_KIND
  const deployedAtBlock = token.deployedAtBlock ? parseDeployedAtBlock(token.deployedAtBlock) : null
  return {
    ...token,
    kind,
    ...(deployedAtBlock ? { deployedAtBlock } : {}),
  }
}

export function parseDeployedAtBlock(raw: string): string | undefined {
  const trimmed = raw.trim()
  if (!trimmed) return 
  try {
    const value = BigInt(trimmed)
    if (value < BigInt(0)) return
    return value.toString()
  } catch {
    return
  }
}

export function useManagedTokens() {
  const [rawTokens, setTokens, { hydrated, remove }] = useLocalStorage<ManagedToken[]>(
    STORAGE_KEY,
    [],
  )

  const tokens = rawTokens.map(normalizeToken)

  function addToken(token: ManagedToken) {
    setTokens((prev) => {
      const exists = prev.some(
        (t) =>
          t.chainId === token.chainId &&
          t.address.toLowerCase() === token.address.toLowerCase(),
      )
      return exists ? prev : [...prev, normalizeToken(token)]
    })
  }

  function removeToken(id: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id))
  }

  return { tokens, addToken, removeToken, hydrated, clear: remove }
}
