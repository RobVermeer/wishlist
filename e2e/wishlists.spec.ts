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
  await expect(page.getByText("Je zit nog niet in een groep")).toBeVisible()
  await expect(page.getByText("Je hebt nog geen verlanglijstje")).toBeVisible()
})

test("create your own wishlist in your groups", async ({ signIn }) => {
  const user = await createUser()
  const family = await createGroup(user, { title: "Familie" })
  await createGroup(user, { title: "Vrienden" })
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await expect(dialog.getByLabel("Voor mezelf")).toBeChecked()
  await expect(dialog.getByLabel("Naam", { exact: true })).toHaveCount(0)
  await expect(dialog.getByLabel("Familie")).not.toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).not.toBeChecked()

  await expect(dialog.getByLabel("Beschrijving")).toHaveCount(0)
  await dialog.getByLabel("Familie").click()
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Verjaardag" }).click()
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("link", { name: "Mijn lijstje" })).toBeVisible()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
    include: { groups: true },
  })
  expect(wishlist.title).toBeNull()
  expect(wishlist.theme).toBe("birthday")
  expect(wishlist.groups.map(({ id }) => id)).toEqual([family.id])

  await page.goto("/")
  await page.getByRole("link", { name: "Mijn lijstje" }).click()
  await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
  await expect(page).toHaveTitle("Mijn lijstje - Niet Weer Sokken")
})

test("create a wishlist for someone else", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

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
  await expect(page).toHaveTitle("Baby Bram - Niet Weer Sokken")
  await expect(page.getByRole("heading", { name: "Baby Bram" })).toBeVisible()
})

test("wishlist validation errors are shown", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam", { exact: true }).fill("B")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText(
    "Naam moet minimaal uit 2 tekens bestaan"
  )
  await expect(dialog.getByLabel("Voor iemand anders")).toBeChecked()
  await expect(dialog.getByLabel("Naam", { exact: true })).toHaveValue("B")
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
  await expect(dialog.getByLabel("Beschrijving")).toHaveCount(0)
  const leaves = dialog.getByText(
    "De leden van deze groep zien dit verlanglijstje dan niet meer."
  )
  await expect(leaves).toBeHidden()
  await dialog.getByLabel("Familie").click()
  await expect(leaves).toBeVisible()
  await dialog.getByLabel("Familie").click()
  await expect(leaves).toBeHidden()
  await dialog.getByLabel("Familie").click()
  await dialog.getByLabel("Vrienden").click()
  await expect(leaves).toHaveCount(1)
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("heading", { name: "Opa Jan" })).toBeVisible()

  const updated = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
    include: { groups: true },
  })
  expect(updated.title).toBe("Opa Jan")
  expect(updated.groups.map(({ id }) => id)).toEqual([friends.id])
})

test("your own wishlist shows the groups it is in", async ({ signIn }) => {
  const user = await createUser()
  const groups = [
    await createGroup(user, { title: "Een" }),
    await createGroup(user, { title: "Twee" }),
    await createGroup(user, { title: "Drie" }),
  ]
  const wishlist = await createWishlist(user, { groups })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  await expect(
    page.getByRole("heading", {
      name: "Mijn lijstje in groepen Een, Twee & Drie",
    })
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
    "Je verlanglijstje wordt met alle wensen verwijderd. Je groepen en wie het volgt, zien het daarna niet meer. Wat anderen al hebben gekocht, blijft bij hen staan."
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
  await expect(page.getByText("Je hebt nog geen verlanglijstje")).toBeVisible()

  const removed = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
  })
  expect(removed.removed).toBe(true)

  await page.goto(`/group/${group.id}`)
  await expect(
    page.getByText("Er staan nog geen verlanglijstjes in deze groep")
  ).toBeVisible()

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(
    page.getByText("We kunnen deze pagina niet vinden")
  ).toBeVisible()
})

test("unknown wishlist shows not found", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/wishlist/does-not-exist")

  await expect(
    page.getByText("We kunnen deze pagina niet vinden")
  ).toBeVisible()
})

test("dashboard links to your groups and wishlists", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Dashboard groep" })
  const wishlist = await createWishlist(user, { title: "Dashboard lijst" })
  const page = await signIn(user)

  await page.goto("/")

  await expect(page).toHaveTitle("Overzicht - Niet Weer Sokken")
  await expect(
    page.getByRole("link", { name: "Dashboard groep" })
  ).toHaveAttribute("href", `/group/${group.id}`)
  await expect(
    page.getByRole("link", { name: "Dashboard lijst" })
  ).toHaveAttribute("href", `/wishlist/${wishlist.id}`)
})

test("your own wishlists on the dashboard say which groups they are in", async ({
  signIn,
}) => {
  const user = await createUser()
  const family = await createGroup(user, { title: "Familie" })
  const friends = await createGroup(user, { title: "Vrienden" })
  await createWishlist(user, { groups: [family, friends] })
  await createWishlist(user)
  await createWishlist(user, { title: "Opa", groups: [family] })
  const page = await signIn(user)

  await page.goto("/")

  await expect(
    page.getByRole("link").filter({ hasText: /^(Mijn lijstje|Opa)/ })
  ).toHaveText([
    /^Mijn lijstje\s*In groepen Familie en Vrienden$/,
    /^Mijn lijstje\s*Nog in geen groep$/,
    /^Opa$/,
  ])
})

test("the dashboard shows what you follow first, then your own wishlists", async ({
  signIn,
}) => {
  const user = await createUser()
  const friend = await createUser({ firstName: "Fenna" })
  await createGroup(user, { title: "Familie" })
  await createWishlist(friend, { followers: [user] })
  await createWishlist(user, { title: "Eigen lijst" })
  const page = await signIn(user)

  await page.goto("/")

  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "Wat je volgt",
    "Je verlanglijstjes",
  ])

  const following = page.locator("div.grid").filter({
    has: page.getByRole("button", { name: "Nieuwe groep" }),
  })
  await expect(following.getByRole("link")).toHaveText([/Familie/, /Fenna/])
  await expect(page.getByText("Je zit nog niet in een groep")).toBeHidden()
})

test("following only a wishlist doesn't show the empty state", async ({
  signIn,
}) => {
  const user = await createUser()
  const friend = await createUser({ firstName: "Fenna" })
  await createWishlist(friend, { followers: [user] })
  const page = await signIn(user)

  await page.goto("/")

  await expect(page.getByRole("link", { name: "Fenna" })).toBeVisible()
  await expect(page.getByText("Je zit nog niet in een groep")).toBeHidden()
})
