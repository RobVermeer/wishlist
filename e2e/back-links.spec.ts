import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
} from "./fixtures"

test("a verlanglijstje in a group links back to the group", async ({
  signIn,
}) => {
  const user = await createUser()
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  const wishlist = await createWishlist(sanne, { groups: [group] })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expect(
    page.getByRole("heading", { name: "Sanne", exact: true })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: /Familie/ })).toHaveCount(1)

  await page.getByRole("link", { name: "Terug naar Familie" }).click()
  await expect(page).toHaveURL(`/group/${group.id}`)
})

test("a group page links back to the overview", async ({ signIn }) => {
  const user = await createUser()
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  await createWishlist(sanne, { groups: [group] })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}`)

  // The only verlanglijstje is shown on the group page itself, without a
  // second link back.
  await expect(
    page.getByText("Sanne ziet niet wat er wordt gekocht")
  ).toBeVisible()
  await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(1)

  await page.getByRole("link", { name: "Terug naar Overzicht" }).click()
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(0)
})

test("a verlanglijstje from the overview links back to the overview", async ({
  signIn,
}) => {
  const user = await createUser()
  const sanne = await createUser({ firstName: "Sanne" })
  const own = await createWishlist(user)
  const followed = await createWishlist(sanne, { followers: [user] })
  const page = await signIn(user)

  for (const [wishlist, title] of [
    [own, "Mijn verlanglijstje"],
    [followed, "Sanne"],
  ] as const) {
    await page.goto("/")
    await page.getByRole("link", { name: title, exact: true }).click()
    await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
    await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(1)

    await page.getByRole("link", { name: "Terug naar Overzicht" }).click()
    await expect(page).toHaveURL("/")
  }
})

test("the profile has no back link", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  for (const path of ["/profile", "/profile/bought"]) {
    await page.goto(path)
    await expect(page.getByRole("heading").first()).toBeVisible()
    await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(0)
  }
})

test("a shared link links back to the overview", async ({ signIn }) => {
  const sanne = await createUser({ firstName: "Sanne" })
  const wishlist = await createWishlist(sanne, {
    shareToken: `back-${sanne.id}`,
  })
  const page = await signIn(await createUser())

  await page.goto(`/lijstje/${wishlist.shareToken}`)
  await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(1)

  await page.getByRole("link", { name: "Terug naar Overzicht" }).click()
  await expect(page).toHaveURL("/")
})

test("invitations link back to the home page before logging in", async ({
  page,
}) => {
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(sanne, { title: "Familie" })
  const wishlist = await createWishlist(sanne, {
    shareToken: `back-${sanne.id}`,
  })

  for (const path of [
    `/group/${group.id}`,
    `/lijstje/${wishlist.shareToken}`,
  ]) {
    await page.goto(path)
    await expect(page.getByRole("link", { name: /^Terug naar/ })).toHaveCount(1)

    await page
      .getByRole("link", { name: "Terug naar Niet Weer Sokken" })
      .click()
    await expect(page).toHaveURL("/")
  }
})

test("a page opened after scrolling a bit starts with its back link below the header", async ({
  signIn,
}) => {
  const user = await createUser()
  const members = await Promise.all(
    Array.from({ length: 12 }, (_, i) => createUser({ firstName: `Lid ${i}` }))
  )
  const group = await createGroup(user, { title: "Familie", members })
  for (const member of members) {
    const wishlist = await createWishlist(member, {
      groups: [group],
      followers: [user],
    })
    for (let i = 0; i < 12; i++) await createItem(wishlist)
  }
  const page = await signIn(user)
  await page.setViewportSize({ width: 375, height: 667 })
  const header = page.getByRole("banner")

  for (const [from, link, back] of [
    [`/group/${group.id}`, "Lid 0", "Familie"],
    ["/", "Lid 0", "Overzicht"],
    ["/", "Familie 13 leden", "Overzicht"],
  ]) {
    await page.goto(from)
    await page.mouse.wheel(0, 60)
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(60)

    await page.getByRole("link", { name: link, exact: true }).click()
    const backLink = page.getByRole("link", { name: `Terug naar ${back}` })
    await expect(backLink).toBeVisible()

    // Not hidden behind the header, which stays at the top.
    const headerBox = await header.boundingBox()
    const backLinkBox = await backLink.boundingBox()
    expect(backLinkBox!.y).toBeGreaterThanOrEqual(
      headerBox!.y + headerBox!.height
    )

    // Going back still returns to where you were.
    await page.goBack()
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(60)
  }
})
