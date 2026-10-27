import { test, expect, createUser } from "./fixtures"

test("find answers in the frequently asked questions", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("link", { name: "Veelgestelde vragen" }).click()

  await expect(page).toHaveURL("/vragen")
  await expect(page).toHaveTitle("Veelgestelde vragen - Wishlist")
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
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
      .getByRole("heading", { name: "Je account" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Kost Wishlist iets?",
    "Waarom heb ik geen wachtwoord?",
    "Kan ik Wishlist op mijn telefoon zetten?",
    "Hoe pas ik mijn naam of profielfoto aan?",
    "Hoe verwijder ik mijn account?",
    "Ik heb een fout gevonden of een vraag. Waar kan ik terecht?",
  ])

  const question = page.getByText("Ziet degene die het wenst wat ik koop?")
  const answer = page.getByText("Nee, zo blijft het een verrassing")
  await expect(answer).toBeHidden()

  await question.click()
  await expect(answer).toBeVisible()

  await question.click()
  await expect(answer).toBeHidden()
})

test("the frequently asked questions ask to log in first", async ({ page }) => {
  await page.goto("/login")
  await expect(
    page.getByRole("link", { name: "Veelgestelde vragen" })
  ).toHaveCount(0)

  await page.goto("/vragen")

  await expect(page).toHaveURL("/login?callbackUrl=%2Fvragen")
})

test("jump to a subject in the frequently asked questions", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")

  const subjects = page.getByRole("navigation", { name: "Onderwerpen" })
  await expect(subjects.getByRole("link")).toHaveText([
    /Je verlanglijstje\s*\d+ vragen/,
    /Delen en groepen\s*\d+ vragen/,
    /Lootjes trekken\s*6 vragen/,
    /Cadeaus kopen\s*\d+ vragen/,
    /Je account\s*\d+ vragen/,
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
      "Daar staat wat je voor wie koopt en op welke dag je het hebt afgestreept."
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
