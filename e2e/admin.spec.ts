import {
  test,
  expect,
  createAdmin,
  createUser,
  createGroup,
  emailsTo,
  prisma,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"

const card = (page: Page, text: string) =>
  page.locator("div.rounded-md").filter({ hasText: text })

test("regular users cannot access the admin", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  for (const path of ["/admin", "/admin/users", "/admin/groups"]) {
    await page.goto(path)
    await expect(page).toHaveURL("/")
  }
})

test("admin can open the admin from the menu", async ({ signIn }) => {
  const admin = await createAdmin()
  const page = await signIn(admin)

  await page.goto("/")
  await page.locator("header").getByRole("button").click()
  await page.getByRole("link", { name: "Admin" }).click()

  await expect(page).toHaveURL("/admin")
  for (const label of ["Gebruikers", "Verlanglijstjes", "Groepen", "Wensen"]) {
    await expect(
      page.locator("div.text-lg").filter({ hasText: label })
    ).toHaveText(new RegExp(`^\\s*${label}\\s*\\d+$`))
  }
})

test("admin can remove a user", async ({ signIn }) => {
  const admin = await createAdmin()
  const user = await createUser({ name: "Weg Gebruiker" })
  const page = await signIn(admin)

  await page.goto("/admin/users")
  const userCard = card(page, user.email!)
  await expect(userCard).toContainText("Weg Gebruiker")

  page.once("dialog", dialog => dialog.dismiss())
  await userCard.getByRole("button", { name: "Verwijder" }).click()
  await expect(userCard).toBeVisible()
  expect(await prisma.user.count({ where: { id: user.id } })).toBe(1)

  page.once("dialog", dialog => dialog.accept())
  await userCard.getByRole("button", { name: "Verwijder" }).click()

  await expect(userCard).toBeHidden()
  expect(await prisma.user.count({ where: { id: user.id } })).toBe(0)
})

test("admin can remove and restore a group", async ({ signIn }) => {
  const admin = await createAdmin()
  const owner = await createUser({ name: "Groep Eigenaar" })
  const group = await createGroup(owner, { title: `Admin groep ${owner.id}` })
  const page = await signIn(admin)

  await page.goto("/admin/groups")
  const groupCard = card(page, group.title)
  await expect(groupCard).toContainText("Groep Eigenaar")

  page.once("dialog", dialog => dialog.accept())
  await groupCard.getByRole("button", { name: "Verwijder" }).click()
  await expect
    .poll(
      async () =>
        (await prisma.group.findUniqueOrThrow({ where: { id: group.id } }))
          .removed
    )
    .toBe(true)

  await expect(groupCard.getByRole("link", { name: "Bekijk" })).toHaveAttribute(
    "href",
    `/admin/groups/${group.id}`
  )
  await page.goto(`/admin/groups/${group.id}`)
  await expect(page.getByRole("heading", { name: group.title })).toBeVisible()

  page.once("dialog", dialog => dialog.accept())
  await page.getByRole("button", { name: "Zet groep terug" }).click()
  await expect
    .poll(
      async () =>
        (await prisma.group.findUniqueOrThrow({ where: { id: group.id } }))
          .removed
    )
    .toBe(false)
})

test("admin can draw lots for a group", async ({ signIn }) => {
  const admin = await createAdmin()
  const owner = await createUser({ firstName: "Anna" })
  const members = [
    await createUser({ firstName: "Bert" }),
    await createUser({ firstName: "Carla" }),
    await createUser({ firstName: "Dirk" }),
  ]
  const skipped = await createUser({ firstName: "Eva" })
  const group = await createGroup(owner, {
    title: "Sinterklaas",
    members: [...members, skipped],
  })
  const participants = [owner, ...members]
  const page = await signIn(admin)

  await page.goto(`/admin/groups/${group.id}`)
  await page.getByLabel(new RegExp(skipped.email!)).click()
  await page.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("De lootjes zijn getrokken")
  await expect(page).toHaveURL("/admin/groups")

  for (const participant of participants) {
    await expect
      .poll(async () => (await emailsTo(participant.email!)).length)
      .toBe(1)
  }
  expect(await emailsTo(skipped.email!)).toHaveLength(0)

  const drawn = await Promise.all(
    participants.map(async participant => {
      const [email] = await emailsTo(participant.email!)

      expect(email.subject).toBe(
        `${participant.firstName}, je hebt een lootje getrokken voor Sinterklaas`
      )

      const name = email.html.match(
        /Je getrokken lootje: <strong>([^<]+)<\/strong>/
      )?.[1]

      expect(name).not.toBe(participant.firstName)

      return name
    })
  )

  expect(drawn.sort()).toEqual(
    participants.map(({ firstName }) => firstName).sort()
  )
})

test("drawing lots needs at least two participants", async ({ signIn }) => {
  const admin = await createAdmin()
  const owner = await createUser({ firstName: "Anna" })
  const member = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [member] })
  const page = await signIn(admin)

  await page.goto(`/admin/groups/${group.id}`)
  await page.getByLabel(new RegExp(member.email!)).click()
  await page.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText(
    "Kies minimaal twee deelnemers voor de loting"
  )
  await expect(page).toHaveURL(`/admin/groups/${group.id}`)
  expect(await emailsTo(owner.email!)).toHaveLength(0)
})
