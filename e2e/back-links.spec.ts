import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
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
