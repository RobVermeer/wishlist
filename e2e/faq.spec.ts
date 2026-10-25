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
    "Cadeaus kopen",
    "Je account",
  ])

  await expect(
    page
      .getByRole("heading", { name: "Je verlanglijstje" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Hoe zet ik een wens op mijn verlanglijstje?",
    "Hoe werken categorieën?",
    "Hoe zet ik mijn wensen in een andere volgorde?",
    "Wat is een onbeperkte wens?",
    "Hoe maak ik een verlanglijstje voor mijn kind?",
    "Kan ik een verlanglijstje samen met iemand beheren?",
  ])

  await expect(
    page
      .getByRole("heading", { name: "Delen en groepen" })
      .locator("..")
      .locator("summary")
  ).toHaveText([
    "Hoe deel ik mijn verlanglijstje, bijvoorbeeld voor mijn verjaardag?",
    "Wat is het verschil tussen een groep en een link?",
    "Hoe maak ik een groep?",
    "Hoe zet ik mijn verlanglijstje in een groep, of haal ik het er weer uit?",
    "Kan mijn verlanglijstje in meerdere groepen staan?",
    "Hoe nodig ik iemand uit voor een groep?",
    "Wat mag ik als maker van een groep?",
    "Wat gebeurt er als ik uit een groep stap?",
    "Ik heb mijn link met de verkeerde persoon gedeeld. Wat nu?",
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
