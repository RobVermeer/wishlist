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
