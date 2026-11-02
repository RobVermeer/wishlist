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
    "Kan ik meer dan één linkje bij een wens zetten?",
    "Hoe verwijder ik een wens?",
    "Hoe werken categorieën?",
    "Hoe zet ik mijn wensen in een andere volgorde?",
    "Wat is een onbeperkte wens?",
    "Ik hou niet van verlanglijstjes, kan het ook anders?",
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
    "Hoelang zie ik mijn lootje?",
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
    "Wat mag er niet op Niet Weer Sokken?",
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

test("the frequently asked questions explain links on a wish", async ({
  page,
}) => {
  await page.goto("/vragen")

  await page
    .getByText("Kan ik meer dan één linkje bij een wens zetten?")
    .click()

  await expect(
    page.getByRole("region", { name: "Je verlanglijstje" })
  ).toContainText(
    "Ja, tot 5. Kies bij je wens ‘Nog een linkje’, bijvoorbeeld als hetzelfde cadeau in twee winkels te koop is."
  )
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

test("the frequently asked questions link to the huisregels", async ({
  page,
}) => {
  await page.goto("/vragen")

  await page.getByText("Wat mag er niet op Niet Weer Sokken?").click()
  await page
    .getByRole("region", { name: "Algemeen" })
    .getByRole("link", { name: "huisregels" })
    .click()

  await expect(page).toHaveURL("/huisregels")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Huisregels")
})

test("jump to a subject in the frequently asked questions", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")

  const subjects = page.getByRole("navigation", { name: "Onderwerpen" })
  await expect(subjects.getByRole("link")).toHaveText([
    /Algemeen\s*5 vragen/,
    /Je verlanglijstje\s*\d+ vragen/,
    /Delen en groepen\s*\d+ vragen/,
    /Lootjes trekken\s*7 vragen/,
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

test("the frequently asked questions explain how a lootje stays secret", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  const lots = page.getByRole("region", { name: "Lootjes trekken" })
  await lots.getByText("Hoe trek ik lootjes?").click()
  await expect(
    lots.getByText("kies de datum van het feest en een budget als je wilt")
  ).toBeVisible()
  await lots.getByText("Waar zie ik wie ik heb getrokken?").click()
  await expect(
    lots.getByText(
      "In de e-mail en in de groep. Daar zie je het pas als je ‘Laat zien’ kiest"
    )
  ).toBeVisible()
  await expect(lots.getByText(/link naar het verlanglijstje/)).toHaveCount(0)
  await lots.getByText("Kan ik in meerdere groepen lootjes trekken?").click()
  await expect(
    lots.getByText(
      "Op je overzicht zie je onder ‘Je lootjes’ in welke groepen je een lootje hebt"
    )
  ).toBeVisible()
  await lots.getByText("Hoelang zie ik mijn lootje?").click()
  await expect(
    lots.getByText("Tot en met de datum van het feest.")
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
      "Daar staat wat je voor wie koopt en op welke dag je het hebt afgestreept, het nieuwste bovenaan. Je ziet eerst de 15 nieuwste cadeaus van het afgelopen jaar, de rest zie je met ‘Toon eerdere cadeaus’."
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

test("the frequently asked questions explain sharing interests instead of wishes", async ({
  page,
}) => {
  await page.goto("/vragen")

  await page
    .getByText("Ik hou niet van verlanglijstjes, kan het ook anders?")
    .click()
  await expect(
    page.getByText(
      /^Ja\. Kies ‘Wijzig’ op je verlanglijstje en zet bij ‘Waar ik blij van word’/
    )
  ).toContainText("Wensen erbij mag, maar hoeft niet.")
})

test("the frequently asked questions explain how to change the order of wishes", async ({
  page,
}) => {
  await page.goto("/vragen")

  await page.getByText("Hoe zet ik mijn wensen in een andere volgorde?").click()
  await expect(
    page.getByText(
      /^Kies ‘Volgorde aanpassen’ boven je wensen\. Sleep dan een wens aan de puntjes ernaast naar een andere plek en kies ‘Klaar’ als alles goed staat\./
    )
  ).toBeVisible()
})

test("the frequently asked questions name the Wijzig button of a wishlist", async ({
  page,
}) => {
  await page.goto("/vragen")

  await page.getByText("Hoe verwijder ik mijn verlanglijstje?").click()
  await expect(
    page.getByText(
      /^Open je verlanglijstje, kies ‘Wijzig’ en dan ‘Verwijder’\./
    )
  ).toBeVisible()
})

test("the frequently asked questions say when bought wishes go", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  const buying = page.getByRole("region", { name: "Cadeaus kopen" })
  await buying
    .getByText("Blijven gekochte wensen op het verlanglijstje staan?")
    .click()
  await expect(
    buying.getByText(
      "Ja, tenzij je verlanglijstje in een groep staat waar lootjes zijn getrokken met een datum. Dan verdwijnen twee weken na die datum de wensen die al gekocht zijn."
    )
  ).toBeVisible()
  await expect(
    buying.getByText("Wie iets kocht, ziet het nog onder ‘Gekochte cadeaus’.")
  ).toBeVisible()

  const list = page.getByRole("region", { name: "Je verlanglijstje" })
  await list.getByText("Wat is een onbeperkte wens?").click()
  await expect(
    list.getByText("Hij verdwijnt ook niet als we na een feest opruimen.")
  ).toBeVisible()
})

test("the frequently asked questions say who gets asked for more wishes", async ({
  page,
}) => {
  await page.goto("/vragen")

  const buying = page.getByRole("region", { name: "Cadeaus kopen" })
  await buying.getByText("Hoe vraag ik om meer wensen?").click()
  await expect(
    buying.getByText(
      "Kies op het verlanglijstje van iemand anders ‘Vraag om meer wensen’. Wie het verlanglijstje beheert, krijgt dan een e-mail met een link ernaartoe. Dat kan één keer per dag per verlanglijstje."
    )
  ).toBeVisible()
})
