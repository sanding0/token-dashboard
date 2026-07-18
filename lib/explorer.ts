import type { Chain } from "viem"

export function getExplorerTxUrl(
  chainId: number,
  hash: `0x${string}`,
  chains: readonly Chain[],
): string | null {
  const chain = chains.find((c) => c.id === chainId)
  const base = chain?.blockExplorers?.default?.url
  if (!base) return null
  return `${base}/tx/${hash}`
}

export function shortenHash(hash: string, size = 6) {
  if (hash.length <= size * 2 + 2) return hash
  return `${hash.slice(0, size + 2)}…${hash.slice(-size)}`
}
