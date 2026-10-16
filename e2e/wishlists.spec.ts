import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  prisma,
  toasts,
} from "./fixtures"

test("new user sees empty states for wishlists", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await expect(page.getByText("Je zit nog niet in een groep 🥺")).toBeVisible()
  await expect(
    page.getByText("Je hebt nog geen verlanglijstje 🥺")
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
  await expect(dialog.getByLabel("Voor mezelf")).toBeChecked()
  await expect(dialog.getByLabel("Naam", { exact: true })).toHaveCount(0)
  await expect(dialog.getByLabel("Familie")).toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).toBeChecked()

  await dialog.getByLabel("Vrienden").click()
  await dialog.getByLabel("Beschrijving").fill("Voor mijn verjaardag")
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
  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam", { exact: true }).fill("Baby Bram")
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
  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam", { exact: true }).fill("B")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText(
    "Naam moet minimaal uit 2 tekens bestaan"
  )
  await expect(dialog.getByLabel("Voor iemand anders")).toBeChecked()
  await expect(dialog.getByLabel("Naam", { exact: true })).toHaveValue("B")

  await dialog.getByLabel("Naam", { exact: true }).fill("Bram")
  await dialog.getByLabel("Beschrijving").fill("x")
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

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  await expect(dialog.getByLabel("Familie")).toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).not.toBeChecked()

  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam", { exact: true }).fill("Opa Jan")
  await dialog.getByLabel("Beschrijving").fill("Zijn 80e verjaardag")
  await dialog.getByLabel("Familie").click()
  await dialog.getByLabel("Vrienden").click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("heading", { name: "Opa Jan" })).toBeVisible()
  await expect(page.getByText("Zijn 80e verjaardag")).toBeVisible()

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

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()
  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  const confirm = page.getByRole("alertdialog", { name: "Weet je het zeker?" })

  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await expect(confirm).toContainText(
    "Je verlanglijstje wordt met alle wensen verwijderd."
  )
  await confirm.getByRole("button", { name: "Toch niet" }).click()
  await expect(confirm).toBeHidden()
  expect(
    (await prisma.wishlist.findUniqueOrThrow({ where: { id: wishlist.id } }))
      .removed
  ).toBe(false)

  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await confirm.getByRole("button", { name: "Verwijder" }).click()

  await expect(page).toHaveURL("/")
  await expect(
    page.getByText("Je hebt nog geen verlanglijstje 🥺")
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

test("create a wishlist from the dashboard", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Beschrijving").fill("Voor mijn verjaardag")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await page.getByRole("link", { name: "Mijn lijstje" }).click()
  await expect(page.getByText("Voor mijn verjaardag")).toBeVisible()
})
