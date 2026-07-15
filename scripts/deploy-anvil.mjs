import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

/** @type {string[]} forge script targets relative to contracts/: `script/File.s.sol:ContractName` */
const DEPLOY_LIST = ["script/MyToken.s.sol:DeployMyToken"]

const RPC_URL = process.env.ANVIL_RPC_URL || "http://127.0.0.1:8545"
const contractsRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "contracts")

if (DEPLOY_LIST.length === 0) {
  console.error("DEPLOY_LIST is empty")
  process.exit(1)
}

console.log(`Deploying ${DEPLOY_LIST.length} script(s) to ${RPC_URL}`)

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

console.log("\nAll scripts deployed.")
