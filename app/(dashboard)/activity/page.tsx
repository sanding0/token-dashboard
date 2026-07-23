"use client"

import { PageHeader, PageShell } from "@/components/common/page-shell"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useManagedTokens } from "@/hooks/use-managed-tokens"
import {
  ACTIVITY_LOOKBACK_BLOCKS,
  useTokenActivity,
  type TokenActivity,
} from "@/hooks/use-token-activity"
import { getExplorerTxUrl, shortenAddress, shortenHash } from "@/lib/explorer"
import Link from "next/link"
import { useChains, useConnection } from "wagmi"

function otherParty(activity: TokenActivity) {
  return activity.kind === "send" ? activity.to : activity.from
}

export default function ActivityPage() {
  const { address, isConnected } = useConnection()
  const chains = useChains()
  const { tokens, hydrated } = useManagedTokens()
  const { activities, sepoliaTokens, isLoading, isError, error, refetch } =
    useTokenActivity({
      wallet: address,
      tokens,
      enabled: hydrated && isConnected,
    })

  if (!hydrated) {
    return <p className="text-sm text-muted-foreground">Loading…</p>
  }

  if (!isConnected || !address) {
    return (
      <PageShell>
        <Card>
          <CardHeader>
            <CardTitle>Wallet not connected</CardTitle>
            <CardDescription>
              Connect a wallet to see Sepolia token activity.
            </CardDescription>
          </CardHeader>
        </Card>
      </PageShell>
    )
  }

  if (sepoliaTokens.length === 0) {
    return (
      <PageShell>
        <Card>
          <CardHeader>
            <CardTitle>No Sepolia tokens</CardTitle>
            <CardDescription>
              Add a Sepolia token in Settings first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button nativeButton={false} render={<Link href="/settings" />}>
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHeader
        title="Activity"
        description={`Sepolia Transfer events for your managed tokens (deploy block or last ~${ACTIVITY_LOOKBACK_BLOCKS.toLocaleString()} blocks).`}
        action={
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            disabled={isLoading}
          >
            Refresh
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent transfers</CardTitle>
          <CardDescription>
            {sepoliaTokens.length} token
            {sepoliaTokens.length === 1 ? "" : "s"} on Sepolia
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : isError ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive">
                Failed to load
                {error instanceof Error ? `: ${error.message}` : "."}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refetch()}
              >
                Retry
              </Button>
            </div>
          ) : activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No transfers found in this range.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {activities.map((activity) => {
                const other = otherParty(activity)
                const txUrl = getExplorerTxUrl(
                  activity.chainId,
                  activity.transactionHash,
                  chains,
                )
                const sign = activity.kind === "send" ? "−" : "+"

                return (
                  <li
                    key={activity.id}
                    className="border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <p className="text-sm font-medium capitalize">
                      {activity.kind} · {activity.tokenLabel}
                    </p>
                    <p className="tabular-nums">
                      {sign}
                      {activity.formattedValue} {activity.symbol}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {activity.kind === "mint"
                        ? "mint"
                        : activity.kind === "send"
                          ? `to ${shortenAddress(other)}`
                          : `from ${shortenAddress(other)}`}
                      {" · "}
                      block {activity.blockNumber.toString()}
                      {txUrl ? (
                        <>
                          {" · "}
                          <a
                            href={txUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline-offset-2 hover:underline"
                          >
                            {shortenHash(activity.transactionHash)}
                          </a>
                        </>
                      ) : null}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </PageShell>
  )
}
