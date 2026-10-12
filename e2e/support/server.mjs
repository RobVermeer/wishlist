import { execSync } from "node:child_process"
import { cpSync, readFileSync, rmSync } from "node:fs"
import { resolve } from "node:path"

const testEnv = JSON.parse(
  readFileSync(new URL("./env.json", import.meta.url), "utf8")
)
const databasePath = resolve(testEnv.DATABASE_URL.replace(/^file:/, ""))
const env = {
  ...process.env,
  ...testEnv,
  DATABASE_URL: `file:${databasePath}`,
}
const run = command => execSync(command, { stdio: "inherit", env })

if (!databasePath.endsWith("/e2e.db")) {
  throw new Error(
    `Refusing to recreate ${databasePath}, it is not the e2e database`
  )
}

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  rmSync(`${databasePath}${suffix}`, { force: true })
}

run("npx prisma migrate deploy")
run("npx prisma generate")

if (!process.argv.includes("--skip-build")) {
  run("npx next build")
  cpSync("public", ".next/standalone/public", { recursive: true })
  cpSync(".next/static", ".next/standalone/.next/static", { recursive: true })
}

run("node .next/standalone/server.js")
