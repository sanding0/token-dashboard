import { spawnSync } from "node:child_process"
import {
  ANVIL_DEFAULT_PRIVATE_KEY,
  contractsPaths,
  loadDeployEnv,
  resolveDeployerPrivateKey,
} from "./deploy-env.mjs"

/** @type {string[]} forge script targets relative to contracts/: `script/File.s.sol:ContractName` */
const DEPLOY_LIST = ["script/MyToken.s.sol:DeployMyToken"]

const { root, contractsRoot } = contractsPaths(import.meta.url)
loadDeployEnv(root, contractsRoot)

const RPC_URL = process.env.ANVIL_RPC_URL || "http://127.0.0.1:8545"
const deployerKey = resolveDeployerPrivateKey("anvil")
const usingDefaultKey = deployerKey === ANVIL_DEFAULT_PRIVATE_KEY

if (DEPLOY_LIST.length === 0) {
  console.error("DEPLOY_LIST is empty")
  process.exit(1)
}

console.log(`Deploying ${DEPLOY_LIST.length} script(s) to Anvil`)
console.log(`RPC: ${RPC_URL}`)
console.log(
  `Deployer key: ${usingDefaultKey ? "Anvil account #0 (default)" : "from env"}`,
)

for (const target of DEPLOY_LIST) {
  console.log(`\n→ forge script ${target}`)

  const result = spawnSync(
    "forge",
    ["script", target, "--rpc-url", RPC_URL, "--broadcast"],
    {
      cwd: contractsRoot,
      stdio: "inherit",
      shell: true,
      env: process.env,
    },
  )

  if (result.status !== 0) {
    console.error(`Failed: ${target}`)
    process.exit(result.status ?? 1)
  }
}

console.log("\nAll scripts deployed to Anvil.")
console.log("Copy the logged address into Settings (chain: Anvil, type: Ownable + Mint).")
