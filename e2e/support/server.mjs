import { execSync } from "node:child_process"
import { readFileSync, rmSync } from "node:fs"

const testEnv = JSON.parse(
  readFileSync(new URL("./env.json", import.meta.url), "utf8")
)
const env = { ...process.env, ...testEnv }
const run = command => execSync(command, { stdio: "inherit", env })

const databasePath = testEnv.DATABASE_URL.replace(/^file:/, "")

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
}

run(`npx next start -p ${testEnv.PORT}`)
