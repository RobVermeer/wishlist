import { setTimeout } from "node:timers/promises"
import { test, expect, createUser, createGroup, prisma } from "./fixtures"

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

test("changes wait for another connection that is writing", async ({
  signIn,
}) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Verlaat" }).click()
  const dialog = page.getByRole("dialog", { name: "Verlaat groep 🥺" })

  // Hold a write lock, like the fixtures of a test running in parallel, while
  // the server leaves the group. It waits for the lock and answers once the
  // lock is released, or fails right away when it can't wait.
  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: owner.id }, data: { firstName: "O" } })
    await dialog.getByRole("button", { name: "Stap uit de groep" }).click()
    await Promise.race([
      page.waitForResponse(response => response.request().method() === "POST"),
      setTimeout(1000),
    ])
  })

  await expect(page).toHaveURL("/")
  const { members } = await prisma.group.findUniqueOrThrow({
    where: { id: group.id },
    include: { members: true },
  })
  expect(members.map(({ id }) => id)).toEqual([owner.id])
})
