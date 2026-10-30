import { test, expect, createUser } from "./fixtures"
import { Page } from "@playwright/test"

const footer = (page: Page) => page.getByRole("contentinfo")

const footerLink = (page: Page, name: string) =>
  footer(page).getByRole("link", { name, exact: true })

async function followFooterLinks(page: Page) {
  await expect(footer(page)).toContainText(
    "Verlanglijstjes delen, zonder dubbele cadeaus."
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
