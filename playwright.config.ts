import { defineConfig, devices } from "@playwright/test"
import { testEnv, baseURL, mailURL } from "./e2e/support/env"

Object.assign(process.env, testEnv)

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "nl-NL",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/support/mock-resend.mjs",
      url: mailURL,
      reuseExistingServer: !process.env.CI,
      env: testEnv,
    },
    {
      command: "node e2e/support/server.mjs",
      url: `${baseURL}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: testEnv,
    },
  ],
})
