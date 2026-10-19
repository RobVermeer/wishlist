import { test, expect } from "./fixtures"

test("logged out visitors see what Wishlist can do", async ({ page }) => {
  await page.goto("/login")

  await expect(
    page.getByRole("heading", { name: "Welkom bij Wishlist" })
  ).toBeVisible()
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Deel je verlanglijstjes met familie en vrienden, en streep stiekem af wat je gaat kopen."
  )

  const example = page.getByRole("figure")
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
    "Deel met wie je wilt",
    "Stiekem afstrepen",
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
    page
      .getByRole("heading", { name: "Voor elke gelegenheid" })
      .locator("..")
      .getByRole("listitem")
  ).toHaveText(["Sinterklaas", "Kerst", "Verjaardag", "Babyshower"])

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
