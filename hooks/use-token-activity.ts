"use client"

import { useQuery } from "@tanstack/react-query"
import type { ManagedToken } from "@/hooks/use-managed-tokens"
import {
  erc20Abi,
  formatUnits,
  parseAbiItem,
  zeroAddress,
  type Address,
  type Hash,
  type PublicClient,
} from "viem"
import { sepolia } from "viem/chains"
import { usePublicClient } from "wagmi"

export type ActivityKind = "mint" | "receive" | "send"

export type TokenActivity = {
  id: string
  kind: ActivityKind
  tokenLabel: string
  symbol: string
  formattedValue: string
  from: Address
  to: Address
  transactionHash: Hash
  blockNumber: bigint
  chainId: number
}

const TRANSFER_EVENT = parseAbiItem(
  "event Transfer(address indexed from, address indexed to, uint256 value)",
)

/** When deploy block is unknown, only scan this many recent blocks. */
export const ACTIVITY_LOOKBACK_BLOCKS = BigInt(3_000)
const LOG_CHUNK_SIZE = BigInt(2_000)

function resolveFromBlock(latest: bigint, tokens: ManagedToken[]) {
  const fallback =
    latest > ACTIVITY_LOOKBACK_BLOCKS
      ? latest - ACTIVITY_LOOKBACK_BLOCKS
      : BigInt(0)

  let fromBlock: bigint | null = null
  for (const token of tokens) {
    let start = fallback
    const raw = token.deployedAtBlock?.trim()
    if (raw) {
      try {
        start = BigInt(raw)
      } catch {
        start = fallback
      }
    }
    if (fromBlock === null || start < fromBlock) fromBlock = start
  }

  if (fromBlock === null || fromBlock > latest) return fallback
  return fromBlock < BigInt(0) ? BigInt(0) : fromBlock
}

function classify(
  from: Address,
  to: Address,
  wallet: Address,
): ActivityKind | null {
  const w = wallet.toLowerCase()
  if (to.toLowerCase() === w && from === zeroAddress) return "mint"
  if (from.toLowerCase() === w) return "send"
  if (to.toLowerCase() === w) return "receive"
  return null
}

async function getTransferLogs(
  client: PublicClient,
  params: {
    addresses: Address[]
    wallet: Address
    fromBlock: bigint
    toBlock: bigint
  },
) {
  const { addresses, wallet, fromBlock, toBlock } = params
  const logs = []

  for (let start = fromBlock; start <= toBlock; start += LOG_CHUNK_SIZE) {
    const end =
      start + LOG_CHUNK_SIZE - BigInt(1) > toBlock
        ? toBlock
        : start + LOG_CHUNK_SIZE - BigInt(1)

    const [sent, received] = await Promise.all([
      client.getLogs({
        address: addresses,
        event: TRANSFER_EVENT,
        args: { from: wallet },
        fromBlock: start,
        toBlock: end,
      }),
      client.getLogs({
        address: addresses,
        event: TRANSFER_EVENT,
        args: { to: wallet },
        fromBlock: start,
        toBlock: end,
      }),
    ])
    logs.push(...sent, ...received)
  }

  return logs
}

async function fetchTokenActivity(
  client: PublicClient,
  wallet: Address,
  tokens: ManagedToken[],
): Promise<TokenActivity[]> {
  if (tokens.length === 0) return []

  const latest = await client.getBlockNumber()
  const fromBlock = resolveFromBlock(latest, tokens)
  const addresses = tokens.map((t) => t.address)
  const tokenByAddress = new Map(
    tokens.map((t) => [t.address.toLowerCase(), t] as const),
  )

  const logs = await getTransferLogs(client, {
    addresses,
    wallet,
    fromBlock,
    toBlock: latest,
  })

  const seen = new Set<string>()
  const metaCache = new Map<string, { decimals: number; symbol: string }>()
  const activities: TokenActivity[] = []

  for (const log of logs) {
    if (
      !log.transactionHash ||
      log.logIndex === null ||
      log.logIndex === undefined ||
      !log.address ||
      !log.blockNumber
    ) {
      continue
    }

    const id = `${log.transactionHash}-${log.logIndex}`
    if (seen.has(id)) continue
    seen.add(id)

    const from = log.args.from
    const to = log.args.to
    const value = log.args.value
    if (!from || !to || value === undefined) continue

    const kind = classify(from, to, wallet)
    if (!kind) continue

    const token = tokenByAddress.get(log.address.toLowerCase())
    if (!token) continue

    let meta = metaCache.get(token.address.toLowerCase())
    if (!meta) {
      const [decimals, symbol] = await Promise.all([
        client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "decimals",
        }),
        client.readContract({
          address: token.address,
          abi: erc20Abi,
          functionName: "symbol",
        }),
      ])
      meta = { decimals: Number(decimals), symbol: symbol as string }
      metaCache.set(token.address.toLowerCase(), meta)
    }

    activities.push({
      id,
      kind,
      tokenLabel: token.label,
      symbol: meta.symbol,
      formattedValue: formatUnits(value, meta.decimals),
      from,
      to,
      transactionHash: log.transactionHash,
      blockNumber: log.blockNumber,
      chainId: token.chainId,
    })
  }

  activities.sort((a, b) => {
    if (a.blockNumber === b.blockNumber) return b.id.localeCompare(a.id)
    return a.blockNumber > b.blockNumber ? -1 : 1
  })

  return activities
}

export function useTokenActivity({
  wallet,
  tokens,
  enabled = true,
}: {
  wallet?: Address
  tokens: ManagedToken[]
  enabled?: boolean
}) {
  const sepoliaTokens = tokens.filter((t) => t.chainId === sepolia.id)
  const client = usePublicClient({ chainId: sepolia.id })

  const tokenKey = sepoliaTokens
    .map((t) => t.address.toLowerCase())
    .sort()
    .join(",")

  const query = useQuery({
    queryKey: ["token-activity", wallet?.toLowerCase(), tokenKey],
    enabled: Boolean(enabled && wallet && client && sepoliaTokens.length > 0),
    queryFn: () => {
      if (!client || !wallet) return [] as TokenActivity[]
      return fetchTokenActivity(client, wallet, sepoliaTokens)
    },
  })

  return {
    activities: query.data ?? [],
    sepoliaTokens,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
