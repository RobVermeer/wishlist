import {
  test,
  expect,
  createAdmin,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  emailsTo,
  prisma,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"

const card = (page: Page, text: string) =>
  page.locator("div.rounded-2xl").filter({ hasText: text })

test("regular users cannot access the admin", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  for (const path of [
    "/admin",
    "/admin/users",
    "/admin/groups",
    `/admin/users/${user.id}`,
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL("/")
  }
})

test("admin can open the admin from their profile", async ({ signIn }) => {
  const admin = await createAdmin()
  const page = await signIn(admin)

  await page.goto("/")
  await page.locator("header").getByRole("link", { name: "Je profiel" }).click()
  await page.getByRole("link", { name: "Admin" }).click()

  await expect(page).toHaveURL("/admin")
  for (const title of [
    "Gebruikers",
    "Verlanglijstjes",
    "Groepen",
    "Wensen",
    "Lootjes",
  ]) {
    await expect(page.getByRole("region", { name: title })).toBeVisible()
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

test("super admin can make someone admin and take it away", async ({
  signIn,
}) => {
  const superAdmin = await createAdmin()
  const user = await createUser({ name: "Nieuwe Admin" })
  const page = await signIn(superAdmin)
  const userPage = await signIn(user)

  await page.goto("/admin/users")
  const userCard = card(page, user.email!)
  await expect(userCard.getByText("Admin", { exact: true })).toBeHidden()

  await userCard.getByRole("button", { name: "Maak admin" }).click()

  await expect(userCard.getByText("Admin", { exact: true })).toBeVisible()
  await userPage.goto("/admin")
  await expect(userPage).toHaveURL("/admin")
  await expect(
    userPage.getByRole("region", { name: "Gebruikers" })
  ).toBeVisible()

  await userCard.getByRole("button", { name: "Geen admin meer" }).click()

  await expect(userCard.getByText("Admin", { exact: true })).toBeHidden()
  await expect(
    userCard.getByRole("button", { name: "Maak admin" })
  ).toBeVisible()
  await userPage.goto("/admin")
  await expect(userPage).toHaveURL("/")
})

test("the super admin can't be taken away or removed", async ({ signIn }) => {
  const superAdmin = await createAdmin()
  const page = await signIn(superAdmin)

  await page.goto("/admin/users")
  const superAdminCard = card(page, superAdmin.email!)

  await expect(superAdminCard.getByText("Superadmin")).toBeVisible()
  await expect(superAdminCard.getByRole("button")).toHaveCount(0)
})

test("admins see who is admin but can't manage admins", async ({ signIn }) => {
  const superAdmin = await createAdmin()
  const admin = await createUser({ isAdmin: true })
  const otherAdmin = await createUser({ isAdmin: true })
  const user = await createUser()
  const page = await signIn(admin)

  await page.goto("/admin/users")

  await expect(
    card(page, superAdmin.email!).getByText("Superadmin")
  ).toBeVisible()
  const otherAdminCard = card(page, otherAdmin.email!)
  await expect(otherAdminCard.getByText("Admin", { exact: true })).toBeVisible()
  await expect(
    otherAdminCard.getByRole("button", { name: "Geen admin meer" })
  ).toHaveCount(0)
  await expect(
    otherAdminCard.getByRole("button", { name: "Verwijder" })
  ).toHaveCount(0)
  const userCard = card(page, user.email!)
  await expect(
    userCard.getByRole("button", { name: "Verwijder" })
  ).toBeVisible()
  await expect(
    userCard.getByRole("button", { name: "Maak admin" })
  ).toHaveCount(0)
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

test("admin can remove bought wishes from someone's wishlist", async ({
  signIn,
}) => {
  const admin = await createUser({ isAdmin: true })
  const owner = await createUser({ firstName: "Oma" })
  const buyer = await createUser({ firstName: "Kleinzoon" })
  const wishlist = await createWishlist(owner, {
    title: "Oma's lijstje",
    followers: [buyer],
  })
  await createItem(wishlist, {
    title: "Breipennen",
    boughtBy: buyer,
    boughtAt: new Date(),
  })
  await createItem(wishlist, { title: "Puzzelboek" })
  const page = await signIn(admin)

  await page.goto("/admin/users")
  await card(page, owner.email!).getByRole("link", { name: "Bekijk" }).click()

  await expect(page).toHaveURL(`/admin/users/${owner.id}`)
  await expect(page.getByRole("heading", { name: owner.name! })).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Oma's lijstje" })
  ).toBeVisible()
  await expect(page.getByText(buyer.name!)).toHaveCount(0)
  await expect(page.getByText("Kleinzoon")).toHaveCount(0)
  await expect(card(page, "Breipennen")).toContainText("Afgestreept")
  await expect(card(page, "Puzzelboek")).not.toContainText("Afgestreept")
  await expect(card(page, "Puzzelboek").getByRole("button")).toHaveCount(0)

  await card(page, "Breipennen")
    .getByRole("button", { name: "Verwijder" })
    .click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Verwijder" })
    .click()

  await expect(card(page, "Breipennen")).toBeHidden()
  await expect(card(page, "Puzzelboek")).toBeVisible()

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(ownerPage.getByText("Puzzelboek")).toBeVisible()
  await expect(ownerPage.getByText("Breipennen")).toHaveCount(0)

  const buyerPage = await signIn(buyer)
  await buyerPage.goto("/profile/bought")
  await expect(card(buyerPage, "Breipennen")).toContainText(
    "Deze wens is verwijderd."
  )
})
