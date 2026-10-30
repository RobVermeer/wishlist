import { test, expect, createUser } from "./fixtures"
import { Page } from "@playwright/test"

const iPhone = {
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  viewport: { width: 390, height: 844 },
}

const footer = (page: Page) => page.getByRole("contentinfo")

const footerLink = (page: Page, name: string) =>
  footer(page).getByRole("link", { name, exact: true })

const installLink = (page: Page) =>
  footer(page).getByRole("button", { name: "Installeer de app" })

async function followFooterLinks(page: Page) {
  await expect(footer(page)).toContainText(
    "Maak en deel je verlanglijstje, zonder dubbele cadeaus."
  )
  await expect(footer(page)).toContainText(
    `© ${new Date().getFullYear()} Niet Weer Sokken`
  )

  await footerLink(page, "Vragen").click()
  await expect(page).toHaveURL("/vragen")
  await expect(page).toHaveTitle("Veelgestelde vragen - Niet Weer Sokken")

  await footerLink(page, "Privacy").click()
  await expect(page).toHaveURL("/privacy")
  await expect(page).toHaveTitle("Privacy - Niet Weer Sokken")

  await footerLink(page, "Contact").click()
  await expect(page).toHaveURL("/vragen#stel-je-vraag")
  await expect(
    page.getByRole("heading", { name: "Staat je vraag er niet bij?" })
  ).toBeInViewport()

  await footerLink(page, "Niet Weer Sokken").click()
  await expect(page).toHaveURL("/")
}

test("visitors find their way through the footer", async ({ page }) => {
  await page.goto("/privacy")

  await followFooterLinks(page)

  await expect(
    page.getByRole("heading", {
      name: "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
    })
  ).toBeVisible()
})

test("logged in, the footer links work too", async ({ signIn }) => {
  const page = await signIn(await createUser())
  await page.goto("/")

  await followFooterLinks(page)

  await expect(page.getByRole("heading", { name: /Hoi/ })).toBeVisible()
  await footerLink(page, "Contact").click()
  await expect(
    page.getByRole("button", { name: "Stuur ons een bericht" })
  ).toBeVisible()
})

test.describe("on an iPhone", () => {
  test.use(iPhone)

  test("the footer explains how to install the app", async ({ signIn }) => {
    const page = await signIn(await createUser(), iPhone)
    await page.goto("/")

    await installLink(page).click()

    const dialog = page.getByRole("dialog", { name: "Installeer de app" })
    await expect(dialog).toContainText("Tik op Deel")
    await expect(dialog).toContainText("Kies Zet op beginscherm.")
    await expect(dialog).toContainText("Tik op Voeg toe.")
  })

  test("the footer doesn't repeat what the page already explains", async ({
    page,
    signIn,
  }) => {
    await page.goto("/")
    await expect(
      page.getByRole("region", { name: "Zet Niet Weer Sokken op je telefoon" })
    ).toBeVisible()
    await expect(installLink(page)).toHaveCount(0)

    await page.goto("/vragen")
    await expect(installLink(page)).toBeVisible()

    const loggedIn = await signIn(await createUser(), iPhone)
    await loggedIn.goto("/profile")
    await expect(
      loggedIn.getByRole("region", {
        name: "Zet Niet Weer Sokken op je telefoon",
      })
    ).toBeVisible()
    await expect(installLink(loggedIn)).toHaveCount(0)
  })

  test("the installed app doesn't offer it in the footer", async ({ page }) => {
    await page.addInitScript(() => {
      const matchMedia = window.matchMedia.bind(window)
      window.matchMedia = query =>
        query === "(display-mode: standalone)"
          ? ({ ...matchMedia(query), matches: true } as MediaQueryList)
          : matchMedia(query)
    })

    // The link only shows once the page knows it isn't installed, so wait
    // until it's hydrated before checking that it stays away.
    await page.goto("/vragen", { waitUntil: "networkidle" })

    await expect(footerLink(page, "Privacy")).toBeVisible()
    await expect(installLink(page)).toHaveCount(0)
  })
})
