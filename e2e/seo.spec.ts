import { test, expect, createUser, createWishlist } from "./fixtures"
import { baseURL } from "./support/env"
import { Page } from "@playwright/test"

const title = "Niet Weer Sokken – Maak en deel je verlanglijstje"
const description =
  "Maak gratis je verlanglijstje en deel het met een link of in groepen met familie en vrienden. Voor je verjaardag, Sinterklaas, kerst en elk ander feestje, en streep stiekem af wat je gaat kopen."

const meta = (page: Page, name: string) =>
  page.locator(`meta[name="${name}"], meta[property="${name}"]`)

async function jsonLd(page: Page) {
  const scripts = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents()
  return scripts.map(script => JSON.parse(script))
}

test("visitors see the landing page on the home page", async ({ page }) => {
  await page.goto("/")

  await expect(page).toHaveURL("/")
  await expect(page).toHaveTitle(title)
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
      exact: true,
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
  expect(locations).toEqual(
    [`${baseURL}`, `${baseURL}/vragen`, `${baseURL}/privacy`].sort()
  )
})

test("a shared link of the home page shows a preview", async ({
  page,
  request,
}) => {
  await page.goto("/")

  await expect(meta(page, "og:title")).toHaveAttribute("content", title)
  await expect(meta(page, "og:description")).toHaveAttribute(
    "content",
    description
  )
  await expect(meta(page, "og:locale")).toHaveAttribute("content", "nl_NL")
  await expect(meta(page, "twitter:card")).toHaveAttribute(
    "content",
    "summary_large_image"
  )
  const image = await meta(page, "og:image").getAttribute("content")
  expect(image).toMatch(new RegExp(`^${baseURL}/`))
  const response = await request.get(image!, { maxRedirects: 0 })
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("image/png")
})

test("a shared wishlist shows a preview but stays out of search results", async ({
  page,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  await createWishlist(owner, { shareToken: `seo-${owner.id}` })

  await page.goto(`/lijstje/seo-${owner.id}`)

  await expect(meta(page, "og:title")).toHaveAttribute(
    "content",
    "Olga heeft een verlanglijstje met je gedeeld"
  )
  await expect(meta(page, "og:image")).toHaveAttribute(
    "content",
    `${baseURL}/og.png`
  )
  await expect(meta(page, "robots")).toHaveAttribute("content", /noindex/)
})

test("the home page tells search engines it is a free web app", async ({
  page,
}) => {
  await page.goto("/")

  expect(await jsonLd(page)).toEqual([
    expect.objectContaining({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Niet Weer Sokken",
      url: baseURL,
      inLanguage: "nl",
      applicationCategory: "LifestyleApplication",
      offers: expect.objectContaining({ price: "0", priceCurrency: "EUR" }),
    }),
  ])
})

test("visitors can read the frequently asked questions", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: "Veelgestelde vragen" }).click()

  await expect(page).toHaveURL("/vragen")
  await expect(page).toHaveTitle("Veelgestelde vragen - Niet Weer Sokken")
  await page.getByText("Kost Niet Weer Sokken iets?").click()
  await expect(page.getByText("Nee, Niet Weer Sokken is gratis.")).toBeVisible()
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${baseURL}/vragen`
  )

  await expect(
    page.getByRole("button", { name: "Stuur ons een bericht" })
  ).toHaveCount(0)
  await page
    .getByRole("link", { name: "Log in om ons een bericht te sturen" })
    .click()
  await expect(page).toHaveURL("/login?callbackUrl=%2Fvragen")
})

test("search engines can find the privacy policy", async ({ page }) => {
  await page.goto("/privacy")

  await expect(page).toHaveTitle("Privacy - Niet Weer Sokken")
  await expect(meta(page, "description")).toHaveAttribute(
    "content",
    "Wat Niet Weer Sokken van je bewaart en waarom, wie het ziet, welke cookies we gebruiken en hoe je je account laat verwijderen."
  )
  await expect(meta(page, "robots")).toHaveAttribute("content", "index, follow")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${baseURL}/privacy`
  )
})

test("the frequently asked questions are structured data", async ({ page }) => {
  await page.goto("/vragen")

  const [faq] = await jsonLd(page)
  expect(faq["@type"]).toBe("FAQPage")
  expect(faq.mainEntity).toContainEqual({
    "@type": "Question",
    name: "Kost Niet Weer Sokken iets?",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Nee, Niet Weer Sokken is gratis.",
    },
  })
  expect(faq.mainEntity).toHaveLength(
    await page.locator("details summary").count()
  )
})

test("the app installs as Niet Weer Sokken", async ({ request }) => {
  const manifest = await (await request.get("/manifest.json")).json()

  expect(manifest).toMatchObject({
    name: "Niet Weer Sokken",
    short_name: "Niet Weer Sokken",
    description:
      "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
  })
})
