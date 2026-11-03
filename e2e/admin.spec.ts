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

  const dialog = page.getByRole("alertdialog")
  await userCard.getByRole("button", { name: "Verwijder" }).click()
  await expect(dialog).toContainText(
    "Weg Gebruiker verdwijnt, met alle verlanglijstjes. Groepen met andere leden gaan naar een van hen, de rest verdwijnt ook."
  )
  await dialog.getByRole("button", { name: "Toch niet" }).click()
  await expect(dialog).toBeHidden()
  await expect(userCard).toBeVisible()
  expect(await prisma.user.count({ where: { id: user.id } })).toBe(1)

  await userCard.getByRole("button", { name: "Verwijder" }).click()
  await dialog.getByRole("button", { name: "Verwijder" }).click()

  await expect(userCard).toBeHidden()
  expect(await prisma.user.count({ where: { id: user.id } })).toBe(0)
})

async function removeUser(page: Page, user: { email: string | null }) {
  await page.goto("/admin/users")
  await card(page, user.email!)
    .getByRole("button", { name: "Verwijder" })
    .click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Verwijder" })
    .click()
  await expect(card(page, user.email!)).toBeHidden()
}

test("removing a user hands their groups to another member", async ({
  signIn,
}) => {
  const admin = await createAdmin()
  const owner = await createUser()
  const member = await createUser()
  const title = `Familie ${member.id}`.slice(0, 40)
  const shared = await createGroup(owner, { title, members: [member] })
  const alone = await createGroup(owner)

  await removeUser(await signIn(admin), owner)

  const page = await signIn(member)
  await page.goto(`/group/${shared.id}`)
  await expect(page.getByRole("heading", { name: title })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Wijzig", exact: true })
  ).toBeVisible()
  expect(
    (await prisma.group.findUniqueOrThrow({ where: { id: shared.id } })).userId
  ).toBe(member.id)
  expect(await prisma.group.count({ where: { id: alone.id } })).toBe(0)
})

test("wishes bought by a removed user stay bought", async ({ signIn }) => {
  const admin = await createAdmin()
  const owner = await createUser()
  const buyer = await createUser()
  const shopper = await createUser()
  const group = await createGroup(owner, { members: [buyer, shopper] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  await createItem(wishlist, {
    title: "Sokken",
    boughtBy: buyer,
    boughtAt: new Date(),
  })
  // Bought before the date of buying was kept.
  await createItem(wishlist, { title: "Puzzel", boughtBy: buyer })
  const late = await createItem(wishlist, { title: "Boek" })
  const page = await signIn(shopper)
  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await prisma.wishlistItem.update({
    where: { id: late.id },
    data: { userId: buyer.id, boughtAt: new Date() },
  })

  await removeUser(await signIn(admin), buyer)

  await card(page, "Boek").getByRole("button", { name: "Ik koop dit" }).click()
  await expect(toasts(page)).toContainText(
    "Deze wens is al door iemand anders gekocht"
  )
  await page.reload()
  for (const title of ["Sokken", "Puzzel", "Boek"]) {
    await expect(card(page, title)).toContainText("Wordt al gekocht")
    await expect(card(page, title).getByRole("button")).toHaveCount(0)
  }
})

test("removing a user removes their reminders", async ({ signIn }) => {
  const admin = await createAdmin()
  const user = await createUser()
  const other = await createUser()
  await prisma.reminder.createMany({
    data: [
      { to: user.id, from: other.id },
      { to: other.id, from: user.id },
    ],
  })

  await removeUser(await signIn(admin), user)

  expect(
    await prisma.reminder.count({
      where: { OR: [{ to: user.id }, { from: user.id }] },
    })
  ).toBe(0)
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
  await expect(groupCard).not.toContainText("Verwijderd")

  await page.goto(`/admin/groups/${group.id}`)
  await expect(page.getByRole("heading", { name: group.title })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Zet groep terug" })
  ).toHaveCount(0)

  await page.goto("/admin/groups")

  await groupCard.getByRole("button", { name: "Verwijder" }).click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toContainText(
    `‘${group.title}’ verdwijnt voor alle leden`
  )
  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await expect
    .poll(
      async () =>
        (await prisma.group.findUniqueOrThrow({ where: { id: group.id } }))
          .removed
    )
    .toBe(true)
  await expect(groupCard).toContainText("Verwijderd")
  await expect(
    groupCard.getByRole("button", { name: "Verwijder" })
  ).toHaveCount(0)

  await expect(groupCard.getByRole("link", { name: "Bekijk" })).toHaveAttribute(
    "href",
    `/admin/groups/${group.id}`
  )
  await page.goto(`/admin/groups/${group.id}`)
  await expect(page.getByRole("heading", { name: group.title })).toBeVisible()

  await page.getByRole("button", { name: "Zet groep terug" }).click()
  const restore = page.getByRole("alertdialog", { name: "Weet je het zeker?" })
  await expect(restore).toContainText(
    `‘${group.title}’ is daarna weer te zien voor alle leden.`
  )
  await restore.getByRole("button", { name: "Zet groep terug" }).click()
  await expect(toasts(page)).toContainText("De groep is teruggezet.")
  await expect
    .poll(
      async () =>
        (await prisma.group.findUniqueOrThrow({ where: { id: group.id } }))
          .removed
    )
    .toBe(false)
  await expect(
    page.getByRole("button", { name: "Zet groep terug" })
  ).toHaveCount(0)
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
      expect(email.html).toContain(
        "Je krijgt deze e-mail omdat je in de groep Sinterklaas zit."
      )

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
  await expect(
    card(page, "Puzzelboek").getByRole("button", { name: "Verwijder" })
  ).toBeVisible()

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

test("admin can remove wishes and verlanglijstjes that break the huisregels", async ({
  signIn,
}) => {
  const admin = await createUser({ isAdmin: true })
  const owner = await createUser({ firstName: "Pieter" })
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, {
    title: "Pieters lijstje",
    groups: [group],
  })
  const spam = await createWishlist(owner, {
    title: "Koop hier goedkoop",
    groups: [group],
  })
  await createItem(wishlist, { title: "Iets wat niet kan" })
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(admin)

  await page.goto(`/admin/users/${owner.id}`)
  await card(page, "Iets wat niet kan")
    .getByRole("button", { name: "Verwijder" })
    .click()
  const dialog = page.getByRole("alertdialog")
  await expect(dialog).toContainText("huisregels")
  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await expect(card(page, "Iets wat niet kan")).toBeHidden()

  await page
    .getByRole("region", { name: "Koop hier goedkoop" })
    .getByRole("button", { name: "Verwijder verlanglijstje" })
    .click()
  await expect(dialog).toContainText("huisregels")
  await dialog.getByRole("button", { name: "Verwijder verlanglijstje" }).click()
  await expect(
    page.getByRole("heading", { name: "Koop hier goedkoop" })
  ).toBeHidden()
  await expect(
    page.getByRole("heading", { name: "Pieters lijstje" })
  ).toBeVisible()

  const memberPage = await signIn(member)
  await memberPage.goto(`/group/${group.id}`)
  await expect(
    memberPage.getByText("Pieters lijstje", { exact: true })
  ).toBeVisible()
  await expect(memberPage.getByText("Koop hier goedkoop")).toHaveCount(0)
  await memberPage.goto(`/wishlist/${wishlist.id}`)
  await expect(memberPage.getByText("Fiets")).toBeVisible()
  await expect(memberPage.getByText("Iets wat niet kan")).toHaveCount(0)
  expect(
    (await prisma.wishlist.findUniqueOrThrow({ where: { id: spam.id } }))
      .removed
  ).toBe(true)
})

test("admin pages say in the tab which page they are", async ({ signIn }) => {
  const admin = await createAdmin()
  const user = await createUser({ name: "Sanne de Vries" })
  const group = await createGroup(user, { title: "Familie" })
  const page = await signIn(admin)

  for (const [path, title] of [
    ["/admin", "Admin - Niet Weer Sokken"],
    ["/admin/groups", "Groepen - Niet Weer Sokken"],
    ["/admin/users", "Gebruikers - Niet Weer Sokken"],
    [`/admin/groups/${group.id}`, "Familie - Niet Weer Sokken"],
    [`/admin/users/${user.id}`, "Sanne de Vries - Niet Weer Sokken"],
  ]) {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
  }
})

test("admin detail pages link back to their list", async ({ signIn }) => {
  const admin = await createAdmin()
  const user = await createUser({ name: "Sanne de Vries" })
  const group = await createGroup(user, { title: "Familie" })
  const page = await signIn(admin)

  for (const [path, list, title] of [
    [`/admin/groups/${group.id}`, "Groepen", "Familie"],
    [`/admin/users/${user.id}`, "Gebruikers", "Sanne de Vries"],
  ]) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(
      title
    )
    await page.getByRole("link", { name: `Terug naar ${list}` }).click()
    await expect(page).toHaveURL(path.replace(/\/[^/]+$/, ""))
    await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(0)
  }
})

test("admin list pages don't repeat the name of their tab", async ({
  signIn,
}) => {
  const page = await signIn(await createAdmin())

  for (const [path, tab] of [
    ["/admin/groups", "Groepen"],
    ["/admin/users", "Gebruikers"],
  ]) {
    await page.goto(path)
    await expect(page.getByRole("link", { name: tab })).toBeVisible()
    await expect(page.getByRole("heading", { name: tab })).toHaveCount(0)
  }
})
