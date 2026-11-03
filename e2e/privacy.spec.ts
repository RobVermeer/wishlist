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
    page
      .getByRole("region", { name: "Wie wat ziet" })
      .getByRole("listitem")
      .last()
  ).toHaveText(
    /^De beheerders van Niet Weer Sokken zien .* de groepen en de verlanglijstjes, .* afgestreepte wensen .* die niet volgens de huisregels zijn\. Wie iets heeft gekocht, zien ze niet\.$/
  )

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

test("the privacy policy says who sees the name of a group", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(page.getByText("Bijgewerkt op 3 november 2026.")).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Wie wat ziet" }).getByRole("listitem")
  ).toContainText([
    "Wie de link van een groep heeft, ziet de naam van de groep, ook zonder in te loggen. De leden en hun verlanglijstjes zie je pas als je bent ingelogd en de groep volgt.",
  ])
})

test("the privacy policy says who sees what makes you happy", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(page.getByText("Bijgewerkt op 3 november 2026.")).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Wat we bewaren" })
  ).toContainText(
    "Je verlanglijstjes met hun wensen, linkjes, categorieën en waar je blij van wordt."
  )
  await expect(
    page.getByRole("region", { name: "Wie wat ziet" })
  ).toContainText(
    "Wie de link van je verlanglijstje opent en inlogt, ziet je naam en waar je blij van wordt, ook voordat diegene het volgt."
  )
  await expect(
    page.getByRole("region", { name: "Hoe lang we het bewaren" })
  ).toContainText(
    "Haal je iets weg bij waar je blij van wordt, dan verwijderen we het meteen."
  )
})

test("the privacy policy says bought wishes go after a party", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(page.getByText("Bijgewerkt op 3 november 2026.")).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Hoe lang we het bewaren" })
  ).toContainText(
    "Twee dagen na de datum van een loting halen we de wensen die al gekocht zijn van de verlanglijstjes in die groep."
  )
})

test("the privacy policy says who gets asked for more wishes", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(page.getByText("Bijgewerkt op 3 november 2026.")).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Wat we bewaren" })
  ).toContainText(
    "Wanneer je om meer wensen hebt gevraagd en voor welk verlanglijstje, zodat dat één keer per dag kan."
  )
  await expect(page.getByRole("region", { name: "E-mail" })).toContainText(
    "Een vraag om meer wensen, als iemand je die stuurt voor je verlanglijstje of een verlanglijstje dat je samen beheert."
  )
})

test("the privacy policy says what stays when an account is removed", async ({
  page,
}) => {
  await page.goto("/privacy")

  await expect(page.getByText("Bijgewerkt op 3 november 2026.")).toBeVisible()
  const section = page.getByRole("region", {
    name: "Je gegevens inzien, wijzigen of verwijderen",
  })
  await expect(section).toContainText(
    "Groepen die je hebt gemaakt gaan naar een ander lid, zodat hun verlanglijstjes en lootjes blijven. Zit er niemand anders in, dan verwijderen we ze."
  )
  await expect(section).toContainText(
    "Wensen die je bij anderen hebt afgestreept, blijven afgestreept, zodat niemand ze dubbel koopt."
  )
})
