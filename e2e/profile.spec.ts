import { test, expect, createUser, prisma, toasts } from "./fixtures"
import { rm } from "node:fs/promises"
import { testEnv } from "./support/env"

const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

test("profile tabs navigate between profile pages", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile")
  await expect(page.getByRole("heading", { name: "Profiel" })).toBeVisible()

  for (const [name, path] of [
    ["Verlanglijstjes", "/profile/wishlists"],
    ["Groepen", "/profile/groups"],
    ["Gekochte cadeaus", "/profile/bought"],
    ["Profiel", "/profile"],
  ]) {
    await page.getByRole("link", { name, exact: true }).click()
    await expect(page).toHaveURL(path)
  }
})

test("change your first name", async ({ signIn }) => {
  const user = await createUser({ firstName: "Kees" })
  const page = await signIn(user)

  await page.goto("/profile")
  await expect(page.getByLabel("Voornaam")).toHaveValue("Kees")

  await page.getByLabel("Voornaam").fill("Klaas")
  await page.getByRole("button", { name: "Opslaan" }).click()

  await expect(toasts(page)).toContainText("Je gegevens zijn opgeslagen")
  expect(
    (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).firstName
  ).toBe("Klaas")

  await page.reload()
  await expect(page.getByLabel("Voornaam")).toHaveValue("Klaas")
})

test("saving an empty profile shows an error", async ({ signIn }) => {
  const user = await createUser({ firstName: "Kees" })
  const page = await signIn(user)

  await page.goto("/profile")
  await page.getByLabel("Voornaam").clear()
  await page.getByRole("button", { name: "Opslaan" }).click()

  await expect(toasts(page)).toContainText("Je hebt geen velden ingevuld")
  expect(
    (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).firstName
  ).toBe("Kees")
})

test("upload a profile picture", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  try {
    await page.goto("/profile")
    await page.getByLabel("Profielfoto").setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: pixel,
    })
    await page.getByRole("button", { name: "Opslaan" }).click()

    await expect(toasts(page)).toContainText("Je gegevens zijn opgeslagen")

    const { image } = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    })
    expect(image).toMatch(
      new RegExp(
        `^${testEnv.BASE_URL}/avatars/${user.id}/[\\d.]+-avatar\\.png$`
      )
    )
  } finally {
    await rm(`.next/standalone/public/avatars/${user.id}`, {
      recursive: true,
      force: true,
    })
  }
})
