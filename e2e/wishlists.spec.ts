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

  const own = page.getByRole("region", { name: "Je verlanglijstjes" })
  await expect(own.getByText("Je hebt nog geen verlanglijstje")).toBeVisible()
  await expect(
    own.getByText("Maak je eerste verlanglijstje en zet er je wensen op.")
  ).toBeVisible()
  await own.getByRole("button", { name: "Nieuw verlanglijstje" }).click()
  await expect(
    page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  ).toBeVisible()
  await page.keyboard.press("Escape")

  const following = page.getByRole("region", { name: "Wat je volgt" })
  await expect(
    following.getByText("Je zit nog niet in een groep")
  ).toBeVisible()
  await following.getByRole("button", { name: "Nieuwe groep" }).click()
  await expect(page.getByRole("dialog", { name: /Nieuwe groep/ })).toBeVisible()
})

test("the dashboard explains the name", async ({ signIn }) => {
  const page = await signIn(await createUser({ firstName: "Lotte" }))

  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Hoi Lotte" })).toBeVisible()
  await expect(
    page.getByText(
      "Kijk wat je familie en vrienden graag willen, of zet je eigen wensen op een rij, zodat je niet weer sokken krijgt."
    )
  ).toBeVisible()
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
  await expect(
    dialog.getByLabel("Naam van wie het verlanglijstje is")
  ).toHaveCount(0)
  await expect(dialog.getByLabel("Familie")).not.toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).not.toBeChecked()

  await expect(dialog.getByLabel("Beschrijving")).toHaveCount(0)
  await dialog.getByLabel("Familie").click()
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Verjaardag" }).click()
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole("link", { name: "Mijn verlanglijstje" })
  ).toBeVisible()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
    include: { groups: true },
  })
  expect(wishlist.title).toBeNull()
  expect(wishlist.theme).toBe("birthday")
  expect(wishlist.groups.map(({ id }) => id)).toEqual([family.id])

  await page.goto("/")
  await page.getByRole("link", { name: "Mijn verlanglijstje" }).click()
  await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
  await expect(page).toHaveTitle("Mijn verlanglijstje - Niet Weer Sokken")
})

test("create a wishlist for someone else", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Voor iemand anders").click()
  await dialog
    .getByLabel("Naam van wie het verlanglijstje is")
    .fill("Baby Bram")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("link", { name: "Baby Bram" })).toBeVisible()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
  })
  expect(wishlist.title).toBe("Baby Bram")

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page).toHaveTitle("Baby Bram - Niet Weer Sokken")
  await expect(
    page.getByRole("heading", { name: "Baby Bram", level: 1 })
  ).toBeVisible()
})

test("wishlist validation errors are shown", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam van wie het verlanglijstje is").fill("B")
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText(
    "De naam van wie het verlanglijstje is moet minimaal uit 2 tekens bestaan."
  )
  await expect(dialog.getByLabel("Voor iemand anders")).toBeChecked()
  await expect(
    dialog.getByLabel("Naam van wie het verlanglijstje is")
  ).toHaveValue("B")
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
  const edit = page.getByRole("button", { name: "Wijzig verlanglijstje" })
  await expect(edit).toHaveText("Wijzig")
  await edit.click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  await expect(dialog.getByLabel("Familie")).toBeChecked()
  await expect(dialog.getByLabel("Vrienden")).not.toBeChecked()

  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam van wie het verlanglijstje is").fill("Opa Jan")
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
  await expect(
    page.getByRole("heading", { name: "Opa Jan", level: 1 })
  ).toBeVisible()

  const updated = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
    include: { groups: true },
  })
  expect(updated.title).toBe("Opa Jan")
  expect(updated.groups.map(({ id }) => id)).toEqual([friends.id])
})

test("your own wishlist shows the groups it is in under its title", async ({
  signIn,
}) => {
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
    page.getByRole("heading", { name: "Mijn verlanglijstje", exact: true })
  ).toBeVisible()
  await expect(page.getByText("In groepen Een, Twee en Drie")).toBeVisible()

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)
  await expect(
    page.getByRole("heading", { name: "Mijn verlanglijstje", exact: true })
  ).toBeVisible()
  await expect(page.getByText(/In groep/)).toHaveCount(0)
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
  await createWishlist(user, { title: "Oma" })
  const page = await signIn(user)

  await page.goto("/")

  await expect(
    page.getByRole("link").filter({ hasText: /^(Mijn verlanglijstje|Opa|Oma)/ })
  ).toHaveText([
    /^Mijn verlanglijstje\s*In groepen Familie en Vrienden$/,
    /^Mijn verlanglijstje$/,
    /^Opa\s*In groep Familie$/,
    /^Oma$/,
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

  const own = page.getByRole("region", { name: "Je verlanglijstjes" })
  await expect(own.getByRole("link")).toHaveText([/^Eigen lijst/])

  const following = page.getByRole("region", { name: "Wat je volgt" })
  await expect(following.getByRole("link")).toHaveText([/Familie/, /Fenna/])
  await expect(page.getByText("Je zit nog niet in een groep")).toBeHidden()
})

test("the buttons to make a wishlist or group sit above their section", async ({
  signIn,
}) => {
  const user = await createUser()
  await createGroup(user, { title: "Familie" })
  await createWishlist(user, { title: "Eigen lijst" })
  const page = await signIn(user)

  await page.goto("/")

  for (const [section, name] of [
    ["Je verlanglijstjes", "Nieuw verlanglijstje"],
    ["Wat je volgt", "Nieuwe groep"],
  ]) {
    const region = page.getByRole("region", { name: section })
    await expect(region.getByRole("button")).toHaveCount(1)
    const button = await region.getByRole("button", { name }).boundingBox()
    const firstTile = await region.getByRole("link").first().boundingBox()
    expect(button!.y + button!.height).toBeLessThanOrEqual(firstTile!.y)
  }

  await page.getByRole("button", { name: "Nieuwe groep" }).click()
  await expect(page.getByRole("dialog", { name: /Nieuwe groep/ })).toBeVisible()
})

test("on a phone the buttons fit next to their section title", async ({
  signIn,
}) => {
  const user = await createUser()
  await createGroup(user, { title: "Familie" })
  await createWishlist(user, { title: "Eigen lijst" })
  const page = await signIn(user, { viewport: { width: 375, height: 812 } })

  await page.goto("/")

  for (const [section, name] of [
    ["Wat je volgt", "Nieuwe groep"],
    ["Je verlanglijstjes", "Nieuw verlanglijstje"],
  ]) {
    const region = page.getByRole("region", { name: section })
    const title = await region
      .getByRole("heading", { name: section })
      .boundingBox()
    const button = await region.getByRole("button", { name }).boundingBox()
    const middle = button!.y + button!.height / 2
    expect(middle).toBeGreaterThan(title!.y)
    expect(middle).toBeLessThan(title!.y + title!.height)
    expect(button!.x + button!.width).toBeLessThanOrEqual(375)
  }
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

test("closing an edited wishlist asks first", async ({ signIn }) => {
  const user = await createUser()
  const family = await createGroup(user, { title: "Familie" })
  await createGroup(user, { title: "Vrienden" })
  const wishlist = await createWishlist(user, {
    groups: [family],
    theme: "birthday",
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  const confirm = page.getByRole("alertdialog", {
    name: "Wijzigingen niet opslaan?",
  })
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Reizen" }).click()
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await dialog.getByLabel("Vrienden").click()
  await dialog.getByRole("button", { name: "Sluit" }).click()

  await confirm.getByRole("button", { name: "Verder bewerken" }).click()
  await expect(confirm).toBeHidden()
  await expect(dialog.getByLabel("Thema")).toHaveText("Reizen")
  await expect(dialog.getByLabel("Vrienden")).toBeChecked()

  await page.keyboard.press("Escape")
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()
  await expect(dialog).toBeHidden()

  const unchanged = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
    include: { groups: true },
  })
  expect(unchanged.theme).toBe("birthday")
  expect(unchanged.groups.map(({ id }) => id)).toEqual([family.id])

  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()
  await expect(dialog.getByLabel("Thema")).toHaveText("Verjaardag")
  await expect(dialog.getByLabel("Vrienden")).not.toBeChecked()
})

test("closing a wishlist for someone else after changing the name asks first", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user, { title: "Opa Jan" })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  await dialog.getByLabel("Naam van wie het verlanglijstje is").fill("Oma Jo")
  await page.keyboard.press("Escape")
  await page
    .getByRole("alertdialog", { name: "Wijzigingen niet opslaan?" })
    .getByRole("button", { name: "Niet opslaan" })
    .click()

  await expect(dialog).toBeHidden()
  expect(
    (await prisma.wishlist.findUniqueOrThrow({ where: { id: wishlist.id } }))
      .title
  ).toBe("Opa Jan")
})

test("closing an edited wishlist without changes doesn't ask", async ({
  signIn,
}) => {
  const user = await createUser()
  const family = await createGroup(user, { title: "Familie" })
  const wishlist = await createWishlist(user, {
    groups: [family],
    theme: "birthday",
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  const confirm = page.getByRole("alertdialog", {
    name: "Wijzigingen niet opslaan?",
  })
  await dialog.getByLabel("Familie").click()
  await dialog.getByLabel("Familie").click()
  await page.keyboard.press("Escape")

  await expect(dialog).toBeHidden()
  await expect(confirm).toHaveCount(0)

  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Reizen" }).click()
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(confirm).toHaveCount(0)
  await expect
    .poll(
      async () =>
        (
          await prisma.wishlist.findUniqueOrThrow({
            where: { id: wishlist.id },
          })
        ).theme
    )
    .toBe("travel")
})

test("closing a new wishlist after choosing a group asks first", async ({
  signIn,
}) => {
  const user = await createUser()
  await createGroup(user, { title: "Familie" })
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  const confirm = page.getByRole("alertdialog", {
    name: "Wijzigingen niet opslaan?",
  })
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(confirm).toHaveCount(0)

  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()
  await dialog.getByLabel("Familie").click()
  await page.keyboard.press("Escape")
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()

  await expect(dialog).toBeHidden()
  expect(await prisma.wishlist.count({ where: { userId: user.id } })).toBe(0)
})

test("the tab says whose verlanglijstje in a group it is", async ({
  signIn,
}) => {
  const user = await createUser({ firstName: "Tom" })
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  const own = await createWishlist(user, { groups: [group] })
  const other = await createWishlist(sanne, { groups: [group] })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}/${own.id}`)
  await expect(page).toHaveTitle(
    "Mijn verlanglijstje - Familie - Niet Weer Sokken"
  )

  await page.goto(`/group/${group.id}/${other.id}`)
  await expect(page).toHaveTitle("Sanne - Familie - Niet Weer Sokken")
})
