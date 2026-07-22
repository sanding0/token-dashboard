# Token Dashboard

Multi-chain ERC20 dashboard built with **Next.js**, **wagmi v3**, and **viem**. Manage token contracts in localStorage, view balances, and mint as Ownable owner.

## Features

- Wallet connect (injected / MetaMask + optional WalletConnect)
- Chain switch UX
- Managed tokens persisted in `localStorage` (type: ERC20 or Ownable + Mint)
- Dashboard balances (native + ERC20)
- Mint flow for Ownable + Mint tokens (wrong-network CTA + tx explorer link)
- Foundry contract + ABI sync scripts

## Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

### Env

Copy `.env.example` → `.env.local` for the Next app. Put deploy keys in `contracts/.env`.

| Variable | Where | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `.env.local` | Optional; enables WalletConnect |
| `NEXT_PUBLIC_MAINNET_RPC_URL` | `.env.local` | Optional mainnet RPC override |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | `.env.local` | Browser RPC; keep as `/api/rpc/sepolia` (proxy path, no key) |
| `SEPOLIA_RPC_URL` | `.env.local` | Server-only Alchemy/Infura URL for the proxy **and** `pnpm deploy:sepolia` |
| `NEXT_PUBLIC_APP_URL` | `.env.local` | Optional; proxy same-origin allowlist |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `.env.local` | Optional; default Anvil demo address |
| `SEPOLIA_DEPLOYER_PRIVATE_KEY` | `contracts/.env` | Deployer key for Sepolia |
| `ETHERSCAN_API_KEY` | `contracts/.env` | Optional; enables forge `--verify` |

## Local Anvil demo

```bash
# terminal 1
anvil

# terminal 2
pnpm deploy:anvil
pnpm abi:sync
pnpm dev
```

1. Connect MetaMask to Anvil (`http://127.0.0.1:8545`, chain id `31337`)
2. **Settings** → add token (label + chain + address + type **Ownable + Mint**)
3. **Dashboard** → check balance
4. **Mint** → select token → switch chain if needed → mint as owner

## Deploy to Sepolia

1. Root `.env.local` — shared RPC (also used by the Next proxy):

```bash
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<key>
NEXT_PUBLIC_SEPOLIA_RPC_URL=/api/rpc/sepolia
```

2. `contracts/.env` — deploy secrets only (see `contracts/.env.example`):

```bash
SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...   # optional — enables forge --verify
```

```bash
pnpm deploy:anvil    # local Anvil (optional keys; defaults work)
pnpm deploy:sepolia  # reads SEPOLIA_RPC_URL from .env.local + key from contracts/.env
```

Deployer must have Sepolia ETH. After deploy, add the printed address in **Settings** (Sepolia · Ownable + Mint).

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Next.js app |
| `pnpm contracts:build` | Forge build |
| `pnpm abi:sync` | Build + export ABI to `lib/abis` |
| `pnpm deploy:anvil` | Deploy MyToken to local Anvil |
| `pnpm deploy:sepolia` | Deploy MyToken to Sepolia (optional verify) |
