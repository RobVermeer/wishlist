import {
  test,
  expect,
  createAdmin,
  createUser,
  emailsTo,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"

const openContactForm = async (page: Page) => {
  await page.getByRole("button", { name: "Stuur ons een bericht" }).click()
  return page.getByRole("dialog", { name: "Stuur ons een bericht" })
}

test("send a message about a bug to the admin from the FAQ", async ({
  signIn,
}) => {
  const admin = await createAdmin()
  const user = await createUser({ firstName: "Kees" })
  const page = await signIn(user)
  const message = `De knop doet niks ${user.id}`

  await page.goto("/vragen")
  const dialog = await openContactForm(page)
  await expect(dialog.getByRole("textbox")).toHaveCount(0)
  await expect(dialog.getByRole("button", { name: "Verstuur" })).toBeDisabled()
  await dialog.getByLabel("Ik heb een fout gevonden").check()
  await dialog.getByLabel("Wat gaat er mis?").fill(message)
  await dialog.getByRole("button", { name: "Verstuur" }).click()

  await expect(toasts(page)).toContainText("Je bericht is verstuurd")
  await expect(dialog).toBeHidden()

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
  expect(email.subject).toBe("Fout gevonden door Kees")
  expect(email.replyTo).toEqual([user.email])
  expect(email.html).toContain(user.email)
  expect(email.html).toContain(user.id)
})

test("ask to delete your account from your profile", async ({ signIn }) => {
  const admin = await createAdmin()
  const user = await createUser({ firstName: "Weg" })
  const page = await signIn(user)

  await page.goto("/profile")
  const dialog = await openContactForm(page)
  await dialog.getByLabel("Verwijder mijn account").check()
  await expect(dialog.getByRole("textbox")).toHaveCount(0)
  await expect(dialog).toContainText(
    "samen met je verlanglijstjes en de groepen die je hebt gemaakt"
  )
  await dialog.getByRole("button", { name: "Vraag om verwijdering" }).click()

  await expect(toasts(page)).toContainText("Je bericht is verstuurd")
  await expect
    .poll(async () =>
      (await emailsTo(admin.email!)).filter(({ html }) =>
        html.includes(user.id)
      )
    )
    .toHaveLength(1)
  const [email] = (await emailsTo(admin.email!)).filter(({ html }) =>
    html.includes(user.id)
  )
  expect(email.subject).toBe("Account verwijderen voor Weg")
  expect(email.replyTo).toEqual([user.email])
})

test("a question needs a message", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  const dialog = await openContactForm(page)
  await dialog.getByLabel("Ik heb een vraag").check()
  await expect(dialog.getByLabel("Wat wil je weten?")).toBeVisible()
  await dialog.getByRole("button", { name: "Verstuur" }).click()

  await expect(toasts(page)).toContainText("Schrijf wat je ons wilt vragen")
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel("Ik heb een vraag")).toBeChecked()
})

test("messages can be at most 2000 characters", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  const dialog = await openContactForm(page)
  await dialog.getByLabel("Iets anders").check()
  await dialog.getByLabel("Je bericht").fill("a".repeat(2001))
  await dialog.getByRole("button", { name: "Verstuur" }).click()

  await expect(toasts(page)).toContainText(
    "Je bericht mag maximaal uit 2000 tekens bestaan"
  )
  await expect(dialog.getByLabel("Je bericht")).toHaveValue("a".repeat(2001))
})

test("what you typed stays when you switch topics", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/vragen")
  const dialog = await openContactForm(page)
  await dialog.getByLabel("Ik heb een vraag").check()
  await dialog.getByLabel("Wat wil je weten?").fill("Kan ik lootjes trekken?")
  await dialog.getByLabel("Iets anders").check()

  await expect(dialog.getByLabel("Je bericht")).toHaveValue(
    "Kan ik lootjes trekken?"
  )
})
