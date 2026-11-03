import { test, expect } from "./fixtures"

test("logged out visitors see what Niet Weer Sokken can do", async ({
  page,
}) => {
  await page.goto("/login")

  await expect(
    page.getByRole("heading", {
      name: "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
    })
  ).toBeVisible()
  await expect(
    page.getByText(
      /^Houd één verlanglijstje bij voor elk feestje.*met een link/
    )
  ).toBeVisible()

  const example = page.getByRole("figure", { name: /Sanne ziet dat niet/ })
  await expect(
    example
      .getByRole("list", { name: "Waar Sanne blij van wordt" })
      .getByRole("listitem")
  ).toHaveText(["tekenen", "dino's", "zwemmen"])
  await expect(example).toContainText(
    "Naast de wensen hieronder kun je Sanne ook verrassen met iets wat hierbij past."
  )
  const wishes = example
    .getByRole("list", { name: "Wensen van Sanne" })
    .getByRole("listitem")
  await expect(wishes).toHaveText([
    /^Fiets\s*bol\.com\s*coolblue\.nl\s*Ik koop dit$/,
    /^Boeken\s*Onbeperkt$/,
    /^LEGO kasteel\s*Wordt al gekocht$/,
    /^Bordspel\s*Jij koopt dit\s*Toch niet$/,
    /^Warme sokken\s*Ik koop dit$/,
  ])
  for (const [index, title] of [
    [2, "LEGO kasteel"],
    [3, "Bordspel"],
  ] as const) {
    await expect(wishes.nth(index).getByText(title)).toHaveClass(/line-through/)
  }
  await expect(example).toContainText("Sanne ziet dat niet")

  for (const feature of [
    "Lootjes trekken",
    "Op je telefoon",
    "Stiekem afstrepen",
    "Je gekochte cadeaus op een rij",
    "Overzichtelijk",
    "Ook voor een ander",
    "Liever geen wensen?",
    "Wensen en interesses samen",
    "Onbeperkte wensen",
    "Vraag om meer wensen",
  ]) {
    await expect(page.getByRole("heading", { name: feature })).toBeVisible()
  }
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Ook voor een ander" }),
    })
  ).toContainText("samen met de andere ouder")
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Liever geen wensen?" }),
    })
  ).toContainText(
    "Dan kunnen de anderen je verrassen met iets wat daarbij past."
  )
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Wensen en interesses samen" }),
    })
  ).toContainText("Dan kiezen de anderen een wens of verrassen ze je.")
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Stiekem afstrepen" }),
    })
  ).toContainText("De anderen zien het, degene die het wenst niet")
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", {
        name: "Je gekochte cadeaus op een rij",
      }),
    })
  ).toContainText("Gekochte cadeaus")
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Onbeperkte wensen" }),
    })
  ).toContainText(
    "Ook als we na een feest met lootjes de gekochte wensen opruimen."
  )
  await expect(
    page.getByRole("heading", { name: "Deel met wie je wilt" })
  ).toHaveCount(0)
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Lootjes trekken" }),
    })
  ).toContainText(
    "Trek lootjes in je groep voor de datum van het feest, met een budget als je wilt."
  )

  await expect(
    page.getByRole("heading", { name: "Voor elke gelegenheid" })
  ).toHaveCount(0)

  await expect(
    page
      .getByRole("heading", { name: "In drie stappen klaar" })
      .locator("..")
      .getByRole("listitem")
  ).toHaveText([
    /Log in met Google of je e-mailadres/,
    /Maak je verlanglijstje/,
    /Deel de link of nodig je familie en vrienden uit/,
  ])
})

test("the call to action at the bottom goes back to logging in", async ({
  page,
}) => {
  await page.goto("/login")

  const login = page.getByRole("button", { name: "Inloggen met e-mail" })
  const cta = page.getByRole("link", { name: "Maak je verlanglijstje" })

  await expect(
    page.getByRole("heading", { name: "Klaar om te beginnen?", exact: true })
  ).toBeVisible()
  await cta.scrollIntoViewIfNeeded()
  await expect(login).not.toBeInViewport()

  await cta.click()

  await expect(page).toHaveURL("/login#inloggen")
  await expect(login).toBeInViewport()
})

test("visitors see that one wishlist works for all their groups", async ({
  page,
}) => {
  await page.goto("/login")

  const section = page
    .getByRole("heading", { name: "Eén verlanglijstje voor al je feestjes" })
    .locator("..")
  const figure = section.getByRole("figure", {
    name: "Het verlanglijstje van Sanne voor elk feestje",
  })
  await expect(
    figure.getByRole("listitem").filter({ has: page.getByRole("heading") })
  ).toHaveText([
    /^Sanne\s*Gedeeld met een link voor de verjaardag$/,
    /^Sinterklaas\s*Sanne\s*Opa\s*Oma$/,
    /^Kerst\s*Sanne\s*Lisa\s*Mo$/,
    /^En elk ander feestje$/,
  ])
  await expect(figure).toContainText("met een link voor de verjaardag")

  for (const [title, text] of [
    [
      "Overal hetzelfde verlanglijstje",
      "Deel je verlanglijstje met een link en zet het ook in je groepen: voor je familie, je vrienden of dat ene feestje.",
    ],
    ["Eén link voor de hele groep", "de verlanglijstjes van iedereen"],
    ["Niets dubbel", "staat bij het volgende ook afgestreept"],
  ]) {
    await expect(
      section
        .getByRole("listitem")
        .filter({ has: page.getByRole("heading", { name: title }) })
    ).toContainText(text)
  }
})
