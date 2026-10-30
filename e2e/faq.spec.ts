import { test, expect, createUser } from "./fixtures"

test("find answers in the frequently asked questions", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("link", { name: "Veelgestelde vragen" }).click()

  await expect(page).toHaveURL("/vragen")
  await expect(page).toHaveTitle("Veelgestelde vragen - Niet Weer Sokken")
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Algemeen",
    "Je verlanglijstje",
    "Delen en groepen",
    "Lootjes trekken",
    "Cadeaus kopen",
    "Je account",
    "Staat je vraag er niet bij?",
  ])

  await expect(
    page
      .getByRole("heading", { name: "Je verlanglijstje" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Hoe maak ik een verlanglijstje?",
    "Hoe zet ik een wens op mijn verlanglijstje?",
    "Hoe verwijder ik een wens?",
    "Hoe werken categorieën?",
    "Hoe zet ik mijn wensen in een andere volgorde?",
    "Wat is een onbeperkte wens?",
    "Hoe maak ik een verlanglijstje voor mijn kind of iemand anders?",
    "Kan ik een verlanglijstje samen met iemand beheren?",
    "Wat doen de thema's?",
    "Hoe verwijder ik mijn verlanglijstje?",
  ])

  await expect(
    page
      .getByRole("heading", { name: "Delen en groepen" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Hoe deel ik mijn verlanglijstje, bijvoorbeeld voor mijn verjaardag?",
    "Wat is het verschil tussen een groep en een link?",
    "Maak ik een groep voor mijn familie of voor één feestje?",
    "Kan iedereen mijn verlanglijstje zien?",
    "Hoe maak ik een groep?",
    "Hoe zet ik mijn verlanglijstje in een groep, of haal ik het er weer uit?",
    "Kan mijn verlanglijstje in meerdere groepen staan?",
    "Hoeveel verlanglijstjes kan ik in een groep zetten?",
    "Hoe nodig ik iemand uit voor een groep?",
    "Wat mag ik als maker van een groep?",
    "Wat gebeurt er als ik uit een groep stap?",
    "Ik heb mijn link met de verkeerde persoon gedeeld. Wat nu?",
    "Hoe stop ik met het volgen van een verlanglijstje?",
  ])
  await expect(
    page
      .getByRole("heading", { name: "Lootjes trekken" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Hoe trek ik lootjes?",
    "Waar zie ik wie ik heb getrokken?",
    "Ziet iemand wie wie heeft getrokken?",
    "Kan iemand meedoen die nog niet in de groep zit?",
    "Kan ik de lootjes opnieuw trekken?",
    "Kan ik in meerdere groepen lootjes trekken?",
  ])
  await expect(
    page
      .getByRole("heading", { name: "Algemeen" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Waarom heet het Niet Weer Sokken?",
    "Kost Niet Weer Sokken iets?",
    "Kan ik Niet Weer Sokken op mijn telefoon zetten?",
    "Ik heb een fout gevonden of een vraag. Waar kan ik terecht?",
  ])
  await expect(
    page
      .getByRole("heading", { name: "Je account" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Waarom heb ik geen wachtwoord?",
    "Hoe pas ik mijn naam of profielfoto aan?",
    "Wat doen jullie met mijn gegevens?",
    "Hoe verwijder ik mijn account?",
  ])

  const question = page.getByText("Ziet degene die het wenst wat ik koop?")
  const answer = page.getByText("Nee, zo blijft het een verrassing")
  await expect(answer).toBeHidden()

  await question.click()
  await expect(answer).toBeVisible()

  await question.click()
  await expect(answer).toBeHidden()
})

test("the frequently asked questions link to the privacy policy", async ({
  page,
}) => {
  await page.goto("/vragen")

  await page.getByText("Wat doen jullie met mijn gegevens?").click()
  await page
    .getByRole("region", { name: "Je account" })
    .getByRole("link", { name: "Privacy" })
    .click()

  await expect(page).toHaveURL("/privacy")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Privacy")
})

test("jump to a subject in the frequently asked questions", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")

  const subjects = page.getByRole("navigation", { name: "Onderwerpen" })
  await expect(subjects.getByRole("link")).toHaveText([
    /Algemeen\s*4 vragen/,
    /Je verlanglijstje\s*\d+ vragen/,
    /Delen en groepen\s*\d+ vragen/,
    /Lootjes trekken\s*6 vragen/,
    /Cadeaus kopen\s*\d+ vragen/,
    /Je account\s*4 vragen/,
  ])

  await subjects.getByRole("link", { name: /Lootjes trekken/ }).click()
  await expect(page).toHaveURL("/vragen#lootjes-trekken")
  await expect(
    page.getByRole("heading", { name: "Lootjes trekken", level: 2 })
  ).toBeInViewport()

  await page
    .getByRole("region", { name: "Lootjes trekken" })
    .getByRole("link", { name: "Terug naar boven" })
    .click()
  await expect(subjects).toBeInViewport()
})

test("the frequently asked questions explain what a group is for", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  await page
    .getByText("Maak ik een groep voor mijn familie of voor één feestje?")
    .click()

  await expect(
    page.getByText(
      "Allebei kan. Een groep voor je familie of vrienden gebruik je elk jaar opnieuw"
    )
  ).toBeVisible()
})

test("the frequently asked questions say bought gifts stay when a wish is removed", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  await page
    .getByRole("region", { name: "Cadeaus kopen" })
    .getByText("Waar zie ik wat ik heb gekocht?")
    .click()
  await expect(
    page.getByText(
      "Daar staat wat je voor wie koopt en op welke dag je het hebt afgestreept, het nieuwste bovenaan. Wat je meer dan een jaar geleden kocht, staat onder ‘Eerdere cadeaus’."
    )
  ).toBeVisible()

  await page
    .getByRole("region", { name: "Cadeaus kopen" })
    .getByText("Wat gebeurt er met wat ik kocht als een wens wordt verwijderd?")
    .click()

  await expect(
    page.getByText(
      "Het blijft staan onder ‘Gekochte cadeaus’ op je profiel, met erbij dat de wens is verwijderd."
    )
  ).toBeVisible()
})

test("the frequently asked questions explain how to make a wishlist", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  await page
    .getByText("Hoe maak ik een verlanglijstje?", { exact: true })
    .click()

  await expect(
    page.getByText(
      "Kies op je overzicht ‘Nieuw verlanglijstje’. Kies of het voor jezelf is of voor iemand anders, kies eventueel een thema en vink de groepen aan waar het in moet. Daarna zet je er wensen op.",
      { exact: true }
    )
  ).toBeVisible()
})

test("the frequently asked questions explain the name", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  await page.getByText("Waarom heet het Niet Weer Sokken?").click()

  await expect(
    page.getByText(
      "Omdat je vast weleens iets hebt gekregen waar je niet om vroeg, zoals sokken."
    )
  ).toBeVisible()
})

test("the frequently asked questions point to installing the app", async ({
  signIn,
}) => {
  const page = await signIn(await createUser())

  await page.goto("/vragen")
  await page
    .getByText("Kan ik Niet Weer Sokken op mijn telefoon zetten?")
    .click()
  await expect(
    page.getByText(
      "Op je profiel staat hoe dat werkt, en onderaan de pagina via Installeer de app."
    )
  ).toBeVisible()

  await page
    .getByRole("contentinfo")
    .getByRole("button", { name: "Installeer de app" })
    .click()
  await expect(
    page
      .getByRole("dialog", { name: "Installeer de app" })
      .getByRole("heading", { name: "Zet Niet Weer Sokken op je telefoon" })
  ).toBeVisible()
})
