import { test, expect } from "./fixtures"

test("logged out visitors see what Wishlist can do", async ({ page }) => {
  await page.goto("/login")

  await expect(
    page.getByRole("heading", { name: "Welkom bij Wishlist" })
  ).toBeVisible()
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Eén verlanglijstje voor al je feestjes. Deel het met een link of in groepen met familie en vrienden, en streep stiekem af wat je gaat kopen."
  )
  await expect(
    page.getByText(
      /^Houd één verlanglijstje bij voor elk feestje.*met een link/
    )
  ).toBeVisible()

  const example = page.getByRole("figure", { name: /Sanne ziet dat niet/ })
  await expect(example.getByRole("listitem")).toHaveText([
    /^Fiets\s*Ik koop dit$/,
    /^Boeken\s*Onbeperkt$/,
    /^LEGO kasteel\s*Wordt al gekocht$/,
    /^Bordspel\s*Jij koopt dit\s*Toch niet$/,
    /^Warme sokken\s*Ik koop dit$/,
  ])
  for (const [index, title] of [
    [2, "LEGO kasteel"],
    [3, "Bordspel"],
  ] as const) {
    await expect(
      example.getByRole("listitem").nth(index).getByText(title)
    ).toHaveClass(/line-through/)
  }
  await expect(example).toContainText("Sanne ziet dat niet")

  for (const feature of [
    "Stiekem afstrepen",
    "Je cadeaus op een rij",
    "Overzichtelijk",
    "Ook voor een ander",
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
      has: page.getByRole("heading", { name: "Stiekem afstrepen" }),
    })
  ).toContainText("De anderen zien het, degene die het wenst niet")
  await expect(
    page.getByRole("listitem").filter({
      has: page.getByRole("heading", { name: "Je cadeaus op een rij" }),
    })
  ).toContainText("Gekochte cadeaus")
  await expect(
    page.getByRole("heading", { name: "Deel met wie je wilt" })
  ).toHaveCount(0)

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
    ["Eén lijstje om bij te houden", "Deel je verlanglijstje met een link"],
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
