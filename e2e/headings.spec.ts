import {
  test,
  expect,
  createUser,
  createAdmin,
  createGroup,
  createWishlist,
} from "./fixtures"

// Screen reader users jump to the h1 to hear where they are, so every page
// has exactly one.
test("every page has one h1 with its title", async ({ signIn }) => {
  const user = await createUser({ firstName: "Tom" })
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  const lonely = await createGroup(sanne, { title: "Alleen" })
  const own = await createWishlist(user, { groups: [group] })
  const other = await createWishlist(sanne, { groups: [group] })
  const page = await signIn(user)

  for (const [path, title] of [
    ["/", "Hoi Tom"],
    [`/group/${group.id}`, "Familie"],
    [`/group/${lonely.id}`, "Je volgt deze groep nog niet"],
    [`/group/${group.id}/${other.id}`, "Sanne"],
    [`/wishlist/${own.id}`, "Mijn verlanglijstje"],
    ["/profile", "Profiel"],
    ["/profile/bought", "Profiel"],
    ["/group/bestaat-niet", "We kunnen deze pagina niet vinden"],
  ] as const) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveText(
      title
    )
  }
})

test("a group with one verlanglijstje shows it below the h1 of the group", async ({
  signIn,
}) => {
  const user = await createUser()
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  await createWishlist(sanne, { groups: [group] })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}`)

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Familie")
  await expect(
    page.getByRole("heading", { level: 2, name: "Sanne", exact: true })
  ).toBeVisible()
})

test("the admin pages have one h1", async ({ signIn }) => {
  const page = await signIn(await createAdmin())

  for (const path of ["/admin", "/admin/groups", "/admin/users"]) {
    await page.goto(path)
    await expect(page.getByRole("heading", { level: 1 }), path).toHaveText(
      "Admin"
    )
  }
})

test("shared links have one h1", async ({ page, signIn }) => {
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(sanne, { title: "Familie" })
  const wishlist = await createWishlist(sanne, {
    shareToken: `headings-${sanne.id}`,
  })

  await page.goto(`/group/${group.id}`)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Familie")

  for (const visitor of [page, await signIn(await createUser())]) {
    await visitor.goto(`/lijstje/${wishlist.shareToken}`)
    await expect(visitor.getByRole("heading", { level: 1 })).toHaveText("Sanne")
  }
})
