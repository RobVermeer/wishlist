import { test, expect } from "./fixtures"
import { Page } from "@playwright/test"

const logo = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: "Niet Weer Sokken" })

// The heart is a drawing without a role, so it's found inside the logo.
const heart = (page: Page) => logo(page).locator(".sock-heart")

const beats = (page: Page) =>
  heart(page).evaluate(element => element.getAnimations().length > 0)

// How many times the heart beats in a row, Infinity until something stops it.
const repeats = (page: Page) =>
  heart(page).evaluate(
    element => element.getAnimations()[0]?.effect?.getTiming().iterations
  )

// Holds the privacy page until the returned function lets it through.
async function holdPrivacyPage(page: Page) {
  let release = () => {}
  const released = new Promise<void>(resolve => (release = resolve))
  await page.route(
    url => url.pathname === "/privacy",
    async route => {
      await released
      await route.continue()
    }
  )
  return release
}

const privacyLink = (page: Page) =>
  page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacy", exact: true })

test("the heart in the logo beats briefly when you point at it", async ({
  page,
}) => {
  await page.goto("/login")
  await expect(logo(page)).toBeVisible()
  expect(await beats(page)).toBe(false)

  await logo(page).hover()
  await expect.poll(() => repeats(page)).toBe(2)

  // It stops by itself, also while the pointer stays on the logo.
  await expect.poll(() => beats(page), { timeout: 5_000 }).toBe(false)
})

test("the heart in the logo beats while a page loads", async ({ page }) => {
  const release = await holdPrivacyPage(page)
  await page.goto("/login")

  await privacyLink(page).click()
  await expect.poll(() => repeats(page)).toBe(Infinity)

  release()
  await expect(page).toHaveTitle("Privacy - Niet Weer Sokken")
  await expect.poll(() => beats(page)).toBe(false)
})

test.describe("with less motion", () => {
  test.use({ reducedMotion: "reduce" })

  test("the heart in the logo stays still", async ({ page }) => {
    const release = await holdPrivacyPage(page)
    await page.goto("/login")

    await logo(page).hover()
    expect(await beats(page)).toBe(false)

    await privacyLink(page).click()
    await expect(page.locator("html")).toHaveAttribute("data-loading")
    expect(await beats(page)).toBe(false)

    release()
    await expect(page).toHaveTitle("Privacy - Niet Weer Sokken")
  })
})
