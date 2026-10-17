import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  prisma,
  toasts,
} from "./fixtures"

test("create a group with a theme", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)
  const title = `Familie ${user.id}`.slice(0, 40)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuwe groep" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuwe groep/ })
  await expect(dialog).toHaveAccessibleDescription(
    /Wil je alleen je eigen verlanglijstje delen, bijvoorbeeld voor je verjaardag\? Dan heb je geen groep nodig/
  )
  await dialog.getByLabel("Naam").fill(title)
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Kerst" }).click()
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("link", { name: title })).toBeVisible()

  const group = await prisma.group.findFirstOrThrow({
    where: { userId: user.id },
    include: { members: true },
  })
  expect(group.title).toBe(title)
  expect(group.theme).toBe("christmas")
  expect(group.members.map(({ id }) => id)).toEqual([user.id])

  await page.getByRole("link", { name: title }).click()
  await expect(page).toHaveURL(`/group/${group.id}`)
  await expect(page.getByRole("heading", { name: title })).toBeVisible()
})

test("group title must be at least 2 characters", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuwe groep" }).click()

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

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Wijzig", exact: true }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig groep" })
  await dialog.getByLabel("Naam").fill("Nieuwe naam")
  await dialog.getByLabel("Thema").click()
  await page.getByRole("option", { name: "Sinterklaas" }).click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("heading", { name: "Nieuwe naam" })).toBeVisible()

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

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Wijzig", exact: true }).click()

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

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Wijzig", exact: true }).click()
  const dialog = page.getByRole("dialog", { name: "Wijzig groep" })
  await dialog.getByRole("button", { name: "Verwijder" }).click()

  const confirm = page.getByRole("alertdialog", { name: "Weet je het zeker?" })
  await expect(confirm).toContainText(
    "De groep wordt voor alle leden verwijderd."
  )
  await confirm.getByRole("button", { name: "Verwijder" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Weg ermee" })).toHaveCount(0)
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

  await page.goto(`/group/${group.id}`)
  await expect(
    page.getByRole("button", { name: "Wijzig", exact: true })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Verlaat" }).click()

  const dialog = page.getByRole("dialog", { name: "Verlaat groep 🥺" })
  await expect(dialog).toContainText("heb je een nieuwe uitnodiging nodig")
  await expect(dialog.getByLabel("Naam")).toBeHidden()
  await dialog.getByRole("button", { name: "Stap uit de groep" }).click()

  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Vriendengroep" })).toHaveCount(0)

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
  await expect(
    page.getByRole("heading", { name: "Olga", exact: true })
  ).toBeVisible()

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
  await expect(
    page.getByRole("heading", {
      name: "Welk verlanglijstje is voor deze groep?",
    })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Kies je verlanglijstje" })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Nieuw verlanglijstje" })
  ).toBeVisible()
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

test("a group with only someone else's wishlist shows it right away", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const guest = await createUser()
  const group = await createGroup(owner, {
    title: "Verjaardag Olga",
    members: [guest],
  })
  const wishlist = await createWishlist(owner, { groups: [group] })
  const item = await prisma.wishlistItem.create({
    data: { title: "Fiets", createdAt: new Date(), wishlistId: wishlist.id },
  })
  const page = await signIn(guest)

  await page.goto(`/group/${group.id}`)

  await expect(
    page.getByRole("heading", { name: "Verjaardag Olga" })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Olga", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Nodig iemand uit voor de groep" })
  ).toBeVisible()

  await page
    .locator("div.rounded-md")
    .filter({ hasText: "Fiets" })
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect
    .poll(
      async () =>
        (
          await prisma.wishlistItem.findUniqueOrThrow({
            where: { id: item.id },
          })
        ).userId
    )
    .toBe(guest.id)
})

test("a group shows cards when it has more lists or only your own", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser({ firstName: "Mo" })
  const ownGroup = await createGroup(owner, { title: "Eigen lijst" })
  await createWishlist(owner, { groups: [ownGroup] })
  const sharedGroup = await createGroup(owner, {
    title: "Twee lijsten",
    members: [member],
  })
  await createWishlist(owner, { groups: [sharedGroup] })
  await createWishlist(member, { groups: [sharedGroup] })

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/group/${ownGroup.id}`)
  await expect(
    ownerPage.getByRole("link", { name: "Mijn lijstje" })
  ).toBeVisible()
  await expect(
    ownerPage.getByRole("button", { name: "Voeg een wens toe" })
  ).toHaveCount(0)

  const memberPage = await signIn(member)
  await memberPage.goto(`/group/${sharedGroup.id}`)
  await expect(memberPage.getByRole("link", { name: "Olga" })).toBeVisible()
  await expect(
    memberPage.getByRole("link", { name: "Mijn lijstje" })
  ).toBeVisible()
})

test("choose your wishlist for a group from its page", async ({ signIn }) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, {
    title: "Familie",
    members: [member],
  })
  const christmas = await createWishlist(member, { description: "Kerst" })
  await createItem(christmas)
  await createItem(christmas)
  await createWishlist(member, { title: "Opa" })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Kies je verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Kies je verlanglijstje" })
  await expect(dialog).toContainText(
    "De anderen in Familie zien alleen het verlanglijstje dat je kiest."
  )
  await expect(dialog.getByRole("radio")).toHaveCount(1)
  await expect(dialog.getByLabel("Kerst")).toBeChecked()
  await expect(dialog).toContainText("2 wensen")
  await dialog.getByRole("button", { name: "Kies dit verlanglijstje" }).click()

  await expect(toasts(page)).toContainText(
    "Dit verlanglijstje staat nu in de groep"
  )
  await expect(
    page.getByRole("link", { name: "Mijn lijstje", exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole("heading", {
      name: "Welk verlanglijstje is voor deze groep?",
    })
  ).toBeHidden()
  await expect(
    page.getByRole("button", { name: "Ander verlanglijstje kiezen" })
  ).toHaveCount(0)

  const groups = await prisma.wishlist.findUniqueOrThrow({
    where: { id: christmas.id },
    include: { groups: true },
  })
  expect(groups.groups.map(({ id }) => id)).toEqual([group.id])
})

test("choosing another wishlist replaces yours in the group", async ({
  signIn,
}) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const birthday = await createWishlist(member, {
    description: "Verjaardag",
    groups: [group],
  })
  await createItem(birthday, { title: "Sokken", boughtBy: owner })
  const christmas = await createWishlist(member, { description: "Kerst" })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}`)
  await page
    .getByRole("button", { name: "Ander verlanglijstje kiezen" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Kies je verlanglijstje" })
  await dialog.getByLabel("Kerst").click()
  await dialog.getByRole("button", { name: "Kies dit verlanglijstje" }).click()

  await expect(toasts(page)).toContainText(
    "Dit verlanglijstje staat nu in de groep"
  )
  await expect
    .poll(async () =>
      (
        await prisma.group.findUniqueOrThrow({
          where: { id: group.id },
          include: { wishlist: true },
        })
      ).wishlist.map(({ id }) => id)
    )
    .toEqual([christmas.id])

  const replaced = await prisma.wishlist.findUniqueOrThrow({
    where: { id: birthday.id },
    include: { wishlistItem: true },
  })
  expect(replaced.removed).toBe(false)
  expect(replaced.wishlistItem).toEqual([
    expect.objectContaining({ title: "Sokken", userId: owner.id }),
  ])
})

test("someone who is in a group more than once picks one wishlist", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser({ firstName: "Peter" })
  const group = await createGroup(owner, { members: [member] })
  await createWishlist(member, { description: "Oud", groups: [group] })
  const keep = await createWishlist(member, {
    description: "Nieuw",
    groups: [group],
  })
  await createWishlist(owner, { groups: [group] })

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/group/${group.id}`)
  await expect(ownerPage.getByRole("link", { name: "Peter" })).toHaveCount(2)
  await expect(
    ownerPage.getByRole("heading", { name: /keer in deze groep/ })
  ).toBeHidden()

  const page = await signIn(member)
  await page.goto(`/group/${group.id}`)
  await expect(
    page.getByRole("heading", { name: "Je staat 2 keer in deze groep" })
  ).toBeVisible()
  await page.getByRole("button", { name: "Kies je verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Kies je verlanglijstje" })
  await expect(dialog.getByRole("radio")).toHaveCount(2)
  await dialog.getByLabel("Nieuw").click()
  await dialog.getByRole("button", { name: "Kies dit verlanglijstje" }).click()

  await expect(
    page.getByRole("heading", { name: "Je staat 2 keer in deze groep" })
  ).toBeHidden()

  await ownerPage.reload()
  await expect(ownerPage.getByRole("link", { name: "Peter" })).toHaveCount(1)
  await ownerPage.getByRole("link", { name: "Peter" }).click()
  await expect(ownerPage).toHaveURL(`/group/${group.id}/${keep.id}`)
})

test("create a wishlist for a group from its page", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Verjaardag" })
  await createGroup(user, { title: "Kerst" })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await expect(dialog.getByLabel("Voor mezelf")).toBeChecked()
  await expect(dialog.getByLabel("Verjaardag")).toBeChecked()
  await expect(dialog.getByLabel("Kerst")).not.toBeChecked()
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole("link", { name: "Mijn lijstje", exact: true })
  ).toBeVisible()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
    include: { groups: true },
  })
  expect(wishlist.groups.map(({ id }) => id)).toEqual([group.id])
})

test("wishlists for someone else can be added next to your own", async ({
  signIn,
}) => {
  const user = await createUser()
  const group = await createGroup(user)
  const own = await createWishlist(user, { groups: [group] })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}`)

  for (const name of ["Opa", "Oma"]) {
    await page
      .getByRole("button", { name: "Verlanglijstje voor iemand anders" })
      .click()

    const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
    await expect(dialog.getByLabel("Voor iemand anders")).toBeChecked()
    await dialog.getByLabel("Naam").fill(name)
    await expect(
      dialog.getByText("Vervangt je andere verlanglijstje in deze groep")
    ).toBeHidden()
    await dialog.getByRole("button", { name: "Maak aan" }).click()

    await expect(dialog).toBeHidden()
    await expect(page.getByRole("link", { name })).toBeVisible()
  }

  const inGroup = await prisma.wishlist.findMany({
    where: { groups: { some: { id: group.id } } },
  })
  expect(inGroup.map(({ id, title }) => title ?? id).sort()).toEqual(
    [own.id, "Oma", "Opa"].sort()
  )
})

test("a new wishlist of your own replaces your other one in that group", async ({
  signIn,
}) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Familie" })
  const old = await createWishlist(user, { groups: [group] })
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await expect(dialog.getByLabel("Familie")).not.toBeChecked()
  await dialog.getByLabel("Familie").click()
  await expect(
    dialog.getByText("Vervangt je andere verlanglijstje in deze groep")
  ).toBeVisible()
  await dialog.getByLabel("Beschrijving").fill("Nieuw lijstje")
  await dialog.getByRole("button", { name: "Maak aan" }).click()
  await expect(dialog).toBeHidden()

  const inGroup = await prisma.wishlist.findMany({
    where: { groups: { some: { id: group.id } } },
  })
  expect(inGroup).toEqual([
    expect.objectContaining({ description: "Nieuw lijstje" }),
  ])
  expect(
    (await prisma.wishlist.findUniqueOrThrow({ where: { id: old.id } })).removed
  ).toBe(false)
})

test("turning a wishlist into your own replaces your other one in its groups", async ({
  signIn,
}) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Familie" })
  await createWishlist(user, { groups: [group] })
  const grandpa = await createWishlist(user, { title: "Opa", groups: [group] })
  const page = await signIn(user)

  await page.goto(`/wishlist/${grandpa.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Wijzig/ })
  await dialog.getByLabel("Voor mezelf").click()
  await expect(
    dialog.getByText("Vervangt je andere verlanglijstje in deze groep")
  ).toBeVisible()
  await dialog.getByRole("button", { name: "Opslaan" }).click()
  await expect(dialog).toBeHidden()

  const inGroup = await prisma.wishlist.findMany({
    where: { groups: { some: { id: group.id } } },
  })
  expect(inGroup.map(({ id }) => id)).toEqual([grandpa.id])
})
