import { test, expect, createUser, prisma } from "./fixtures"

test("dates are stored as unix epoch milliseconds", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)
  const title = `Datum ${user.id}`.slice(0, 40)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuwe groep" }).click()
  const dialog = page.getByRole("dialog", { name: /Nieuwe groep/ })
  await dialog.getByLabel("Naam van de groep").fill(title)
  await dialog.getByRole("button", { name: "Maak aan" }).click()
  await expect(dialog).toBeHidden()

  const [group] = await prisma.$queryRaw<{ type: string; createdAt: number }[]>`
    SELECT typeof(createdAt) AS type, createdAt FROM "Group" WHERE title = ${title}
  `

  expect(group.type).toBe("integer")
  expect(Math.abs(Number(group.createdAt) - Date.now())).toBeLessThan(60_000)
})
