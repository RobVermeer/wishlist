import { test, expect, createUser } from "./fixtures"

test("visitors can read the privacy policy from the landing page", async ({
  page,
}) => {
  await page.goto("/")
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacy" })
    .click()

  await expect(page).toHaveURL("/privacy")
  await expect(page).toHaveTitle("Privacy - Niet Weer Sokken")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy")
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Wat we bewaren",
    "Waarom we dat bewaren",
    "Wie wat ziet",
    "Inloggen",
    "E-mail",
    "Cookies",
    "Waar je gegevens staan",
    "Hoe lang we het bewaren",
    "Je gegevens inzien, wijzigen of verwijderen",
    "Vragen over je privacy?",
  ])
  await expect(
    page.getByRole("region", { name: "Cookies" }).getByRole("listitem")
  ).toHaveText([
    /^Een sessiecookie/,
    /^Tijdens het inloggen twee cookies/,
    /^Een cookie dat een jaar lang onthoudt/,
  ])

  await expect(
    page.getByRole("button", { name: "Stuur ons een bericht" })
  ).toHaveCount(0)
  await page
    .getByRole("link", { name: "Log in om ons een bericht te sturen" })
    .click()
  await expect(page).toHaveURL("/login?callbackUrl=%2Fprivacy")
})

test("logged in users can ask about their data from the privacy policy", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Privacy" })
    .click()

  await expect(page).toHaveURL("/privacy")
  await page.getByRole("button", { name: "Stuur ons een bericht" }).click()
  await expect(
    page.getByRole("dialog", { name: "Stuur ons een bericht" })
  ).toBeVisible()
})
