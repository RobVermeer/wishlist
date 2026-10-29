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

test("robots.txt keeps private pages out and points to the sitemap", async ({
  request,
}) => {
  const response = await request.get("/robots.txt")

  expect(response.status()).toBe(200)
  const text = await response.text()
  expect(text).toContain("Allow: /")
  for (const path of ["/admin", "/api", "/profile"]) {
    expect(text).toContain(`Disallow: ${path}`)
  }
  expect(text).not.toContain("Disallow: /lijstje")
  expect(text).toContain(`Sitemap: ${baseURL}/sitemap.xml`)
})

test("the sitemap lists the public pages", async ({ request }) => {
  const response = await request.get("/sitemap.xml")

  expect(response.status()).toBe(200)
  const locations = [...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)]
    .map(([, location]) => location)
    .sort()
  expect(locations).toEqual([`${baseURL}`, `${baseURL}/vragen`].sort())
})
