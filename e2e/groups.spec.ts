import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  prisma,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"

const groupCard = (page: Page, title: string) =>
  page.locator("div.rounded-md").filter({
    has: page.locator("a").getByText(title, { exact: true }),
  })

test("new user sees empty states for groups", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile/groups")

  await expect(page.getByText("Je volgt nog geen groepen.")).toBeVisible()
})

test("create a group with a theme", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)
  const title = `Familie ${user.id}`.slice(0, 40)

  await page.goto("/profile/groups")
  await page.getByRole("button", { name: "Maak een nieuwe groep aan" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuwe groep/ })
  await dialog.getByLabel("Naam").fill(title)
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Kerst" }).click()
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(groupCard(page, title)).toBeVisible()

  const group = await prisma.group.findFirstOrThrow({
    where: { userId: user.id },
    include: { members: true },
  })
  expect(group.title).toBe(title)
  expect(group.theme).toBe("christmas")
  expect(group.members.map(({ id }) => id)).toEqual([user.id])

  await page.goto("/")
  await page.getByRole("link", { name: title }).click()
  await expect(page).toHaveURL(`/group/${group.id}`)
  await expect(page.getByRole("heading", { name: title })).toBeVisible()
})

test("group title must be at least 2 characters", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile/groups")
  await page.getByRole("button", { name: "Maak een nieuwe groep aan" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuwe groep/ })
  await dialog.getByLabel("Naam").fill("A")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText(
    "Groep titel moet minimaal uit 2 tekens bestaan"
  )
  await expect(dialog).toBeVisible()
  await expect(dialog.getByLabel("Naam")).toHaveValue("A")
  expect(await prisma.group.count({ where: { userId: user.id } })).toBe(0)
})

test("owner can edit a group", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Oude naam" })
  const page = await signIn(user)

  await page.goto("/profile/groups")
  await groupCard(page, "Oude naam")
    .getByRole("button", { name: "Wijzig" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Wijzig groep" })
  await dialog.getByLabel("Naam").fill("Nieuwe naam")
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Sinterklaas" }).click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(groupCard(page, "Nieuwe naam")).toBeVisible()

  const updated = await prisma.group.findUniqueOrThrow({
    where: { id: group.id },
  })
  expect(updated.title).toBe("Nieuwe naam")
  expect(updated.theme).toBe("sinterklaas")
})

test("choosing no theme clears the group theme", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Thema groep", theme: "baby" })
  const page = await signIn(user)

  await page.goto("/profile/groups")
  await groupCard(page, "Thema groep")
    .getByRole("button", { name: "Wijzig" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Wijzig groep" })
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Geen thema" }).click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect
    .poll(
      async () =>
        (await prisma.group.findUniqueOrThrow({ where: { id: group.id } }))
          .theme
    )
    .toBeNull()
})

test("owner can remove a group", async ({ signIn }) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, {
    title: "Weg ermee",
    members: [member],
  })
  const page = await signIn(owner)

  await page.goto("/profile/groups")
  await groupCard(page, "Weg ermee")
    .getByRole("button", { name: "Wijzig" })
    .click()
  const dialog = page.getByRole("dialog", { name: "Wijzig groep" })
  await dialog.getByRole("button", { name: "Verwijder" }).click()

  const confirm = page.getByRole("alertdialog", { name: "Weet je het zeker?" })
  await expect(confirm).toContainText(
    "De groep wordt voor alle leden verwijderd."
  )
  await confirm.getByRole("button", { name: "Verwijder" }).click()

  await expect(dialog).toBeHidden()
  await expect(groupCard(page, "Weg ermee")).toBeHidden()
  await expect(page.getByText("Je volgt nog geen groepen.")).toBeVisible()
  expect(
    (await prisma.group.findUniqueOrThrow({ where: { id: group.id } })).removed
  ).toBe(true)

  const memberPage = await signIn(member)
  await memberPage.goto("/")
  await expect(memberPage.getByRole("link", { name: "Weg ermee" })).toBeHidden()

  await memberPage.goto(`/group/${group.id}`)
  await expect(
    memberPage.getByText("Oeps, we konden deze pagina niet vinden! 🤯")
  ).toBeVisible()
})

test("member can leave a group but cannot edit it", async ({ signIn }) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, {
    title: "Vriendengroep",
    members: [member],
  })
  const page = await signIn(member)

  await page.goto("/profile/groups")
  await groupCard(page, "Vriendengroep")
    .getByRole("button", { name: "Wijzig" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Verlaat groep 🥺" })
  await expect(dialog).toContainText("heb je weer een invite nodig")
  await expect(dialog.getByLabel("Naam")).toBeHidden()
  await dialog.getByRole("button", { name: "Stap uit de groep" }).click()

  await expect(dialog).toBeHidden()
  await expect(groupCard(page, "Vriendengroep")).toBeHidden()
  await expect(page.getByText("Je volgt nog geen groepen.")).toBeVisible()

  const left = await prisma.group.findUniqueOrThrow({
    where: { id: group.id },
    include: { members: true },
  })
  expect(left.members.map(({ id }) => id)).toEqual([owner.id])
  expect(left.removed).toBe(false)
})

test("visiting a group you don't follow lets you follow it", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const visitor = await createUser()
  const group = await createGroup(owner, { title: "Uitnodiging" })
  await createWishlist(owner, { groups: [group] })
  const page = await signIn(visitor)

  await page.goto(`/group/${group.id}`)

  await expect(page.getByText("Je volgt deze groep nog niet 😵")).toBeVisible()
  await expect(page.getByRole("link", { name: "Olga" })).toBeHidden()

  await page.getByRole("button", { name: "Volg de groep" }).click()

  await expect(page.getByRole("heading", { name: "Uitnodiging" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Olga" })).toBeVisible()

  await page.goto("/")
  await expect(page.getByRole("link", { name: "Uitnodiging" })).toBeVisible()
})

test("group page lists the wishlists of its members", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser({ firstName: "Mo" })
  const outsider = await createUser({ firstName: "Xander" })
  const group = await createGroup(owner, { title: "Feest", members: [member] })
  const ownerList = await createWishlist(owner, { groups: [group] })
  const managedList = await createWishlist(member, {
    title: "Baby Mo",
    groups: [group],
  })
  await createWishlist(member, { title: "Geheim lijstje" })
  await createWishlist(outsider)
  const page = await signIn(member)

  await page.goto(`/group/${group.id}`)

  await expect(page).toHaveTitle("Feest - Wishlist")
  await expect(page.getByRole("link", { name: "Olga" })).toHaveAttribute(
    "href",
    `/group/${group.id}/${ownerList.id}`
  )
  await expect(page.getByRole("link", { name: "Baby Mo" })).toHaveAttribute(
    "href",
    `/group/${group.id}/${managedList.id}`
  )
  await expect(page.getByRole("link", { name: "Mijn lijstje" })).toBeHidden()
  await expect(page.getByRole("link", { name: "Geheim lijstje" })).toBeHidden()
  await expect(page.getByRole("link", { name: "Xander" })).toBeHidden()
})

test("group without wishlists shows an empty state", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user)
  const page = await signIn(user)

  await page.goto(`/group/${group.id}`)

  await expect(page.getByText("Er zijn nog geen lijstjes! 😵‍💫")).toBeVisible()
  await page.getByRole("link", { name: "je profiel" }).click()
  await expect(page).toHaveURL("/profile/wishlists")
})

test("share button copies the group link", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user)
  const page = await signIn(user)

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined })
  })
  await page.goto(`/group/${group.id}`)
  await page
    .getByRole("button", { name: "Nodig iemand uit voor de groep" })
    .click()

  await expect(toasts(page)).toContainText("Link van groep gekopieerd")
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    page.url()
  )
})

test("unknown group shows not found", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/group/does-not-exist")

  await expect(
    page.getByText("Oeps, we konden deze pagina niet vinden! 🤯")
  ).toBeVisible()
})

test("cancelling the share sheet doesn't copy the link", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user)
  const page = await signIn(user)

  await page.addInitScript(() => {
    const state = window as unknown as { copied: boolean; settled: boolean }
    state.copied = false
    state.settled = false
    Object.defineProperty(navigator, "share", {
      value: () => {
        setTimeout(() => (state.settled = true))
        return Promise.reject(new DOMException("Share canceled", "AbortError"))
      },
    })
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: async () => void (state.copied = true) },
    })
  })
  await page.goto(`/group/${group.id}`)
  await page
    .getByRole("button", { name: "Nodig iemand uit voor de groep" })
    .click()

  await page.waitForFunction(
    () => (window as unknown as { settled: boolean }).settled
  )
  expect(
    await page.evaluate(() => (window as unknown as { copied: boolean }).copied)
  ).toBe(false)
  await expect(toasts(page)).toHaveText("")
})
