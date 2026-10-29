import { test, expect, createUser } from "./fixtures"
import { baseURL } from "./support/env"
import { Page } from "@playwright/test"

const title = "Wishlist – Maak en deel je verlanglijstje"
const description =
  "Maak gratis je verlanglijstje en deel het met een link of in groepen met familie en vrienden. Voor je verjaardag, Sinterklaas, kerst en elk ander feestje, en streep stiekem af wat je gaat kopen."

const meta = (page: Page, name: string) =>
  page.locator(`meta[name="${name}"], meta[property="${name}"]`)

test("visitors see the landing page on the home page", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL("/")
  await expect(page).toHaveTitle(title)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Maak en deel je verlanglijstje",
    })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Inloggen met Google" })
  ).toBeVisible()
  await expect(meta(page, "description")).toHaveAttribute(
    "content",
    description
  )
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    baseURL
  )
})

test("the login page points search engines to the home page", async ({
  page,
}) => {
  await page.goto("/login")

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    baseURL
  )
  await expect(meta(page, "robots")).toHaveAttribute("content", /noindex/)
})

test("logged in users still see their dashboard on the home page", async ({
  signIn,
}) => {
  const user = await createUser({ firstName: "Lotte" })
  const page = await signIn(user)

  await page.goto("/")

  await expect(page.getByRole("heading", { name: "Hoi Lotte" })).toBeVisible()
  await expect(meta(page, "robots")).toHaveAttribute("content", /noindex/)
})
