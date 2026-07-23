import type { Address, Chain, Hash } from "viem"

function getExplorerBase(
  chainId: number,
  chains: readonly Chain[],
): string | null {
  const chain = chains.find((c) => c.id === chainId)
  return chain?.blockExplorers?.default?.url ?? null
}

export function getExplorerTxUrl(
  chainId: number,
  hash: Hash,
  chains: readonly Chain[],
): string | null {
  const base = getExplorerBase(chainId, chains)
  if (!base) return null
  return `${base}/tx/${hash}`
}

export function getExplorerAddressUrl(
  chainId: number,
  address: Address,
  chains: readonly Chain[],
): string | null {
  const base = getExplorerBase(chainId, chains)
  if (!base) return null
  return `${base}/address/${address}`
}

export function shortenHash(hash: string, size = 6) {
  if (hash.length <= size * 2 + 2) return hash
  return `${hash.slice(0, size + 2)}…${hash.slice(-size)}`
}

export function shortenAddress(address: string, size = 4) {
  if (address.length <= size * 2 + 2) return address
  return `${address.slice(0, size + 2)}…${address.slice(-size)}`
}
