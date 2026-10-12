import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  prisma,
  toasts,
} from "./fixtures"

test("pages don't contain the email addresses of other users", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser({ firstName: "Mo" })
  const visitor = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const ownerList = await createWishlist(owner, { groups: [group] })
  await createWishlist(member, { groups: [group] })
  const otherEmails = [owner.email!, visitor.email!]

  const memberPage = await signIn(member)

  for (const path of [
    "/",
    `/group/${group.id}`,
    `/group/${group.id}/${ownerList.id}`,
    "/profile/wishlists",
    "/profile/groups",
  ]) {
    await memberPage.goto(path)
    const html = await memberPage.content()

    for (const email of otherEmails) {
      expect(html, `${email} on ${path}`).not.toContain(email)
    }
  }

  const visitorPage = await signIn(visitor)
  await visitorPage.goto(`/group/${group.id}`)
  await expect(
    visitorPage.getByText("Je volgt deze groep nog niet 😵")
  ).toBeVisible()
  const html = await visitorPage.content()

  for (const email of [owner.email!, member.email!]) {
    expect(html).not.toContain(email)
  }
})

test("wishlists are only visible to their owner and the members of their groups", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser()
  const otherGroupMember = await createUser()
  const outsider = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const otherGroup = await createGroup(owner, { members: [otherGroupMember] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  const notFound = "Oeps, we konden deze pagina niet vinden! 🤯"

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(
    ownerPage.getByRole("heading", { name: "Mijn lijstje" })
  ).toBeVisible()

  const memberPage = await signIn(member)
  await memberPage.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(memberPage.getByRole("heading", { name: /Olga/ })).toBeVisible()

  for (const [user, path] of [
    [outsider, `/wishlist/${wishlist.id}`],
    [outsider, `/group/${group.id}/${wishlist.id}`],
    [otherGroupMember, `/wishlist/${wishlist.id}`],
    [otherGroupMember, `/group/${otherGroup.id}/${wishlist.id}`],
  ] as const) {
    const page = await signIn(user)
    await page.goto(path)
    await expect(page.getByText(notFound), path).toBeVisible()
  }

  await prisma.group.update({
    where: { id: group.id },
    data: { members: { disconnect: { id: member.id } } },
  })
  await memberPage.reload()
  await expect(memberPage.getByText(notFound)).toBeVisible()
})

test("wishlists can only be added to groups you are a member of", async ({
  signIn,
}) => {
  const user = await createUser()
  const stranger = await createUser()
  const ownGroup = await createGroup(user, { title: "Eigen groep" })
  const foreignGroup = await createGroup(stranger, { title: "Andere groep" })
  const page = await signIn(user)

  await page.goto("/profile/wishlists")
  await page
    .getByRole("button", { name: "Maak een nieuw verlanglijstje aan" })
    .click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog
    .locator(`input[name="groups"][value="${ownGroup.id}"]`)
    .evaluate((input, id) => input.setAttribute("value", id), foreignGroup.id)
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(toasts(page)).toContainText("Groep niet gevonden")
  expect(await prisma.wishlist.count({ where: { userId: user.id } })).toBe(0)
})
