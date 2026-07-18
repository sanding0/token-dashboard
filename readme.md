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

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Optional | Enables WalletConnect; injected wallet works without it |
| `NEXT_PUBLIC_MAINNET_RPC_URL` | Optional | Mainnet RPC override |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Optional | Default Anvil deploy address for local demos |

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

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Next.js app |
| `pnpm contracts:build` | Forge build |
| `pnpm abi:sync` | Build + export ABI to `lib/abis` |
| `pnpm deploy:anvil` | Deploy MyToken to local Anvil |
