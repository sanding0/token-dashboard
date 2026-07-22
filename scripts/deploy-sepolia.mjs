import { spawnSync } from "node:child_process"
import {
  contractsPaths,
  loadDeployEnv,
  resolveDeployerPrivateKey,
} from "./deploy-env.mjs"

/** @type {string[]} forge script targets relative to contracts/: `script/File.s.sol:ContractName` */
const DEPLOY_LIST = ["script/MyToken.s.sol:DeployMyToken"]

const { root, contractsRoot } = contractsPaths(import.meta.url)
loadDeployEnv(root, contractsRoot)

const RPC_URL = process.env.SEPOLIA_RPC_URL
if (!RPC_URL) {
  console.error(`
Missing SEPOLIA_RPC_URL.

Set it in contracts/.env (see contracts/.env.example):
  SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<key>
  SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...
  ETHERSCAN_API_KEY=...   # optional, enables --verify
`)
  process.exit(1)
}

let deployerKey
try {
  deployerKey = resolveDeployerPrivateKey("sepolia")
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
}

if (DEPLOY_LIST.length === 0) {
  console.error("DEPLOY_LIST is empty")
  process.exit(1)
}

const verify = Boolean(process.env.ETHERSCAN_API_KEY)

console.log(`Deploying ${DEPLOY_LIST.length} script(s) to Sepolia`)
console.log(`RPC: ${RPC_URL}`)
console.log(`Deployer key: from env (${deployerKey.slice(0, 6)}…)`)
console.log(`Verify: ${verify ? "yes" : "no (set ETHERSCAN_API_KEY to enable)"}`)

for (const target of DEPLOY_LIST) {
  console.log(`\n→ forge script ${target}`)

  const args = [
    "script",
    target,
    "--rpc-url",
    RPC_URL,
    "--broadcast",
    "--slow",
  ]

  if (verify) {
    args.push("--verify", "--etherscan-api-key", process.env.ETHERSCAN_API_KEY)
  }

  const result = spawnSync("forge", args, {
    cwd: contractsRoot,
    stdio: "inherit",
    shell: true,
    env: process.env,
  })

  if (result.status !== 0) {
    console.error(`Failed: ${target}`)
    process.exit(result.status ?? 1)
  }
}

console.log("\nAll scripts deployed to Sepolia.")
console.log("Copy the logged address into Settings (chain: Sepolia, type: Ownable + Mint).")
