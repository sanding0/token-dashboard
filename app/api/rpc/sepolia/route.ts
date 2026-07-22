import { NextResponse } from "next/server"
import { sepolia } from "viem/chains"

function upstreamUrl() {
  return (
    process.env.SEPOLIA_RPC_URL?.trim() || sepolia.rpcUrls.default.http[0]
  )
}

function allowedOrigins(request: Request): Set<string> {
  const origins = new Set<string>()
  origins.add(new URL(request.url).origin)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin)
    } catch {
      // ignore invalid env
    }
  }

  const vercel = process.env.VERCEL_URL?.trim()
  if (vercel) {
    origins.add(`https://${vercel.replace(/^https?:\/\//, "")}`)
  }

  return origins
}


function isSameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite === "same-origin") return true
  // Cross-site browser calls are never allowed
  if (fetchSite === "cross-site" || fetchSite === "same-site") return false

  const allowed = allowedOrigins(request)

  const origin = request.headers.get("origin")
  if (origin) return allowed.has(origin)

  const referer = request.headers.get("referer")
  if (referer) {
    try {
      return allowed.has(new URL(referer).origin)
    } catch {
      return false
    }
  }

  // No browser origin signals (e.g. curl) — reject
  return false
}

/**
 * Transparent Sepolia JSON-RPC proxy.
 * Forwards the request body as-is and returns the upstream status/body unchanged
 * so viem/wagmi see the same responses as a direct RPC call.
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: "Forbidden: same-origin only" },
      },
      { status: 403 },
    )
  }

  const body = await request.arrayBuffer()

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      cache: "no-store",
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upstream RPC unavailable"
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message },
      },
      { status: 502 },
    )
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  })
}
