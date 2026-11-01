import {
  test,
  expect,
  createAdmin,
  createUser,
  emailsTo,
  toasts,
} from "./fixtures"

test("visitors can read the huisregels from the footer", async ({ page }) => {
  await page.goto("/")
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Huisregels" })
    .click()

  await expect(page).toHaveURL("/huisregels")
  await expect(page).toHaveTitle("Huisregels - Niet Weer Sokken")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Huisregels")
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Waar Niet Weer Sokken voor is",
    "Wat niet kan",
    "Wat de beheerders doen",
    "Zie je iets wat niet kan?",
  ])
  await expect(
    page.getByRole("region", { name: "Wat de beheerders doen" })
  ).toContainText("Een verlanglijstje weghalen.")

  await page
    .getByRole("link", { name: "Log in om ons een bericht te sturen" })
    .click()
  await expect(page).toHaveURL("/login?callbackUrl=%2Fhuisregels")
})

test("report something that breaks the huisregels", async ({ signIn }) => {
  const admin = await createAdmin()
  const user = await createUser({ firstName: "Melder" })
  const page = await signIn(user)
  const message = `Er staat een rare wens op Pieters lijstje ${user.id}`

  await page.goto("/huisregels")
  await page.getByRole("button", { name: "Stuur ons een bericht" }).click()
  const dialog = page.getByRole("dialog", { name: "Stuur ons een bericht" })
  await dialog.getByLabel("Ik zie iets wat niet kan").check()
  await dialog.getByLabel("Wat zie je, en waar?").fill(message)
  await dialog.getByRole("button", { name: "Verstuur" }).click()

  await expect(toasts(page)).toContainText("Je bericht is verstuurd")
  await expect
    .poll(async () =>
      (await emailsTo(admin.email!)).filter(({ html }) =>
        html.includes(message)
      )
    )
    .toHaveLength(1)
  const [email] = (await emailsTo(admin.email!)).filter(({ html }) =>
    html.includes(message)
  )
  expect(email.subject).toBe("Melding van Melder")
})

test("a report needs a message", async ({ signIn }) => {
  const page = await signIn(await createUser())

  await page.goto("/huisregels")
  await page.getByRole("button", { name: "Stuur ons een bericht" }).click()
  const dialog = page.getByRole("dialog", { name: "Stuur ons een bericht" })
  await dialog.getByLabel("Ik zie iets wat niet kan").check()
  await dialog.getByRole("button", { name: "Verstuur" }).click()

  await expect(toasts(page)).toContainText("Schrijf wat je hebt gezien")
})
