import { existsSync, readFileSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Load KEY=VALUE into process.env without overriding existing vars.
 * @param {string} filePath
 */
export function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

/**
 * Load root + contracts env files (later files only fill missing keys).
 * @param {string} root
 * @param {string} contractsRoot
 */
export function loadDeployEnv(root, contractsRoot) {
  loadEnvFile(join(root, ".env.local"))
  loadEnvFile(join(root, ".env"))
  loadEnvFile(join(contractsRoot, ".env"))
}

/** First Anvil default account — safe for local-only use. */
export const ANVIL_DEFAULT_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"

/**
 * Forge `vm.envUint` requires a `0x` prefix for hex private keys.
 * @param {string} key
 * @returns {string}
 */
export function normalizePrivateKey(key) {
  const trimmed = key.trim()
  if (!trimmed) {
    throw new Error("Private key is empty")
  }
  if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
    return `0x${trimmed.slice(2)}`
  }
  // MetaMask sometimes exports 64 hex chars without 0x
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return `0x${trimmed}`
  }
  throw new Error(
    `Invalid private key format. Expected 0x-prefixed hex (or 64 hex chars), got length ${trimmed.length}.`,
  )
}

/**
 * Resolve private key for a target chain and expose it as DEPLOYER_PRIVATE_KEY
 * for forge scripts (`vm.envUint("DEPLOYER_PRIVATE_KEY")`).
 *
 * @param {"anvil" | "sepolia"} network
 * @returns {string}
 */
export function resolveDeployerPrivateKey(network) {
  if (network === "anvil") {
    const key = normalizePrivateKey(
      process.env.ANVIL_DEPLOYER_PRIVATE_KEY ||
        process.env.DEPLOYER_PRIVATE_KEY ||
        ANVIL_DEFAULT_PRIVATE_KEY,
    )
    process.env.DEPLOYER_PRIVATE_KEY = key
    return key
  }

  const raw =
    process.env.SEPOLIA_DEPLOYER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY
  if (!raw) {
    throw new Error(
      "Missing SEPOLIA_DEPLOYER_PRIVATE_KEY (or DEPLOYER_PRIVATE_KEY).\n\n" +
        "Add a funded Sepolia account private key to contracts/.env:\n" +
        "  SEPOLIA_DEPLOYER_PRIVATE_KEY=0x...\n",
    )
  }
  const key = normalizePrivateKey(raw)
  process.env.DEPLOYER_PRIVATE_KEY = key
  return key
}

export function contractsPaths(importMetaUrl) {
  const root = join(dirname(fileURLToPath(importMetaUrl)), "..")
  const contractsRoot = join(root, "contracts")
  return { root, contractsRoot }
}
