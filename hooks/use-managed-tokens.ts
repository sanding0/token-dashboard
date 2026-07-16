import { useLocalStorage } from "./use-local-storage"

export type ManagedToken = {
    id: string
    label: string
    chainId: number
    address: `0x${string}`
}

const STORAGE_KEY = "token-dashboard:managed-tokens"

export function useManagedTokens() {
  const [tokens, setTokens, { hydrated, remove }] = useLocalStorage<ManagedToken[]>(
    STORAGE_KEY,
    [],
  )

  function addToken(token: ManagedToken) {
    setTokens((prev) => {
      const exists = prev.some(
        (t) =>
          t.chainId === token.chainId &&
          t.address.toLowerCase() === token.address.toLowerCase(),
      )
      return exists ? prev : [...prev, token]
    })
  }

  function removeToken(id: string) {
    setTokens((prev) => prev.filter((t) => t.id !== id))
  }

  return { tokens, addToken, removeToken, hydrated, clear: remove }
}