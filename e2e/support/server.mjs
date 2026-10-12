import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"

const testEnv = JSON.parse(
  readFileSync(new URL("./env.json", import.meta.url), "utf8")
)
const env = { ...process.env, ...testEnv }
const run = command => execSync(command, { stdio: "inherit", env })

run("npx prisma migrate reset --force --skip-seed")

if (!process.argv.includes("--skip-build")) {
  run("npx next build")
}

run(`npx next start -p ${testEnv.PORT}`)
