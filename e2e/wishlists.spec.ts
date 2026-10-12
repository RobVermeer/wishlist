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

const wishlistCard = (page: Page, name: string) =>
  page.locator("div.rounded-md").filter({
    has: page.locator("a").getByText(name),
  })

test("new user sees empty states for wishlists", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await expect(
    page.getByText("Je volgt nog geen enkele groep 🥺")
  ).toBeVisible()
  await expect(
    page.getByText("Je hebt nog geen lijstjes gemaakt 🥺")
  ).toBeVisible()

  await page.goto("/profile/wishlists")
  await expect(
    page.getByText("Je hebt nog geen lijstjes gemaakt.")
  ).toBeVisible()
})

test("create your own wishlist in your groups", async ({ signIn }) => {
  const user = await createUser()
  const family = await createGroup(user, { title: "Familie" })
  await createGroup(user, { title: "Vrienden" })
  const page = await signIn(user)

  await page.goto("/profile/wishlists")
  await page
    .getByRole("button", { name: "Maak een nieuw verlanglijstje aan" })
    .click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await expect(dialog.getByLabel("Dit is mijn eigen lijstje")).toBeChecked()
  await expect(dialog.getByLabel("Familie")).toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).toBeChecked()

  await dialog.getByLabel("Vrienden").click()
  await dialog
    .getByLabel("Beschrijving wensenlijstje")
    .fill("Voor mijn verjaardag")
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Verjaardag" }).click()
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole("link", { name: "Mijn lijstje in groep Familie" })
  ).toBeVisible()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
    include: { groups: true },
  })
  expect(wishlist.title).toBeNull()
  expect(wishlist.description).toBe("Voor mijn verjaardag")
  expect(wishlist.theme).toBe("birthday")
  expect(wishlist.groups.map(({ id }) => id)).toEqual([family.id])

  await page.goto("/")
  await page.getByRole("link", { name: "Mijn lijstje" }).click()
  await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
  await expect(page).toHaveTitle("Mijn lijstje - Wishlist")
  await expect(page.getByText("Voor mijn verjaardag")).toBeVisible()
})

test("create a wishlist for someone else", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile/wishlists")
  await page
    .getByRole("button", { name: "Maak een nieuw verlanglijstje aan" })
    .click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Dit is mijn eigen lijstje").click()
  await dialog
    .getByLabel("Naam van diegene voor wie je het lijstje beheert")
    .fill("Baby Bram")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("link", { name: "Baby Bram" })).toBeVisible()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
  })
  expect(wishlist.title).toBe("Baby Bram")

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page).toHaveTitle("Baby Bram - Wishlist")
  await expect(page.getByRole("heading", { name: "Baby Bram" })).toBeVisible()
})

test("wishlist validation errors are shown", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile/wishlists")
  await page
    .getByRole("button", { name: "Maak een nieuw verlanglijstje aan" })
    .click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Dit is mijn eigen lijstje").click()
  await dialog
    .getByLabel("Naam van diegene voor wie je het lijstje beheert")
    .fill("B")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText(
    "Naam moet minimaal uit 2 tekens bestaan"
  )
  await expect(dialog.getByLabel("Dit is mijn eigen lijstje")).not.toBeChecked()
  await expect(
    dialog.getByLabel("Naam van diegene voor wie je het lijstje beheert")
  ).toHaveValue("B")

  await dialog
    .getByLabel("Naam van diegene voor wie je het lijstje beheert")
    .fill("Bram")
  await dialog.getByLabel("Beschrijving wensenlijstje").fill("x")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText(
    "Beschrijving moet minimaal uit 2 tekens bestaan"
  )
  await expect(dialog).toBeVisible()
  expect(await prisma.wishlist.count({ where: { userId: user.id } })).toBe(0)
})

test("edit a wishlist", async ({ signIn }) => {
  const user = await createUser()
  const family = await createGroup(user, { title: "Familie" })
  const friends = await createGroup(user, { title: "Vrienden" })
  const wishlist = await createWishlist(user, { groups: [family] })
  const page = await signIn(user)

  await page.goto("/profile/wishlists")
  await wishlistCard(page, "Mijn lijstje")
    .getByRole("button", { name: "Wijzig" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  await expect(dialog.getByLabel("Familie")).toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).not.toBeChecked()

  await dialog.getByLabel("Dit is mijn eigen lijstje").click()
  await dialog
    .getByLabel("Naam van diegene voor wie je het lijstje beheert")
    .fill("Opa Jan")
  await dialog
    .getByLabel("Beschrijving wensenlijstje")
    .fill("Zijn 80e verjaardag")
  await dialog.getByLabel("Familie").click()
  await dialog.getByLabel("Vrienden").click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole("link", { name: "Opa Jan in groep Vrienden" })
  ).toBeVisible()

  const updated = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
    include: { groups: true },
  })
  expect(updated.title).toBe("Opa Jan")
  expect(updated.description).toBe("Zijn 80e verjaardag")
  expect(updated.groups.map(({ id }) => id)).toEqual([friends.id])
})

test("wishlist card lists all its groups", async ({ signIn }) => {
  const user = await createUser()
  const groups = [
    await createGroup(user, { title: "Een" }),
    await createGroup(user, { title: "Twee" }),
    await createGroup(user, { title: "Drie" }),
  ]
  await createWishlist(user, { groups })
  const page = await signIn(user)

  await page.goto("/profile/wishlists")

  await expect(
    page.getByRole("link", { name: "Mijn lijstje in groepen Een, Twee & Drie" })
  ).toBeVisible()
})

test("remove a wishlist", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Familie" })
  const wishlist = await createWishlist(user, {
    title: "Weg lijst",
    groups: [group],
  })
  const page = await signIn(user)

  await page.goto("/profile/wishlists")
  await wishlistCard(page, "Weg lijst")
    .getByRole("button", { name: "Wijzig" })
    .click()
  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  await dialog.getByRole("button", { name: "Verwijder" }).click()

  await expect(dialog).toBeHidden()
  await expect(wishlistCard(page, "Weg lijst")).toBeHidden()
  await expect(
    page.getByText("Je hebt nog geen lijstjes gemaakt.")
  ).toBeVisible()

  const removed = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
  })
  expect(removed.removed).toBe(true)

  await page.goto(`/group/${group.id}`)
  await expect(page.getByText("Er zijn nog geen lijstjes! 😵‍💫")).toBeVisible()

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(
    page.getByText("Oeps, we konden deze pagina niet vinden! 🤯")
  ).toBeVisible()
})

test("unknown wishlist shows not found", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/wishlist/does-not-exist")

  await expect(
    page.getByText("Oeps, we konden deze pagina niet vinden! 🤯")
  ).toBeVisible()
})

test("dashboard links to your groups and wishlists", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Dashboard groep" })
  const wishlist = await createWishlist(user, { title: "Dashboard lijst" })
  const page = await signIn(user)

  await page.goto("/")

  await expect(page).toHaveTitle("Overzicht - Wishlist")
  await expect(
    page.getByRole("link", { name: "Dashboard groep" })
  ).toHaveAttribute("href", `/group/${group.id}`)
  await expect(
    page.getByRole("link", { name: "Dashboard lijst" })
  ).toHaveAttribute("href", `/wishlist/${wishlist.id}`)
})
