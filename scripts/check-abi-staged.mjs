import { execSync } from "node:child_process"

function stagedFiles() {
  const out = execSync("git diff --cached --name-only --diff-filter=ACMR", {
    encoding: "utf8",
  })
  return out.split("\n").map((s) => s.trim()).filter(Boolean)
}

const staged = stagedFiles()
const norm = (p) => p.replaceAll("\\", "/")

const solChanged = staged.some((f) =>
  norm(f).startsWith("contracts/src/") && norm(f).endsWith(".sol")
)
const abiStaged = staged.some((f) => norm(f).startsWith("lib/abis/"))

if (solChanged && !abiStaged) {
  console.error(`
The contract source code has been changed, but the updated ABI has not been staged.

Run:
  pnpm abi:sync

Then:
  git add lib/abis
`)
  process.exit(1)
}