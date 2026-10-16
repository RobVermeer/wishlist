import { existsSync } from "node:fs"
import { rm } from "node:fs/promises"
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
  await memberPage.goto(`/wishlist/${wishlist.id}`)
  await expect(memberPage).toHaveTitle("Olga - Wishlist")
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

test("wish links must be http or https", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Verrassing")

  for (const url of [
    "javascript:alert(document.cookie)",
    "data:text/html,hoi",
  ]) {
    await dialog.getByLabel("Linkje").fill(url)
    await dialog.getByRole("button", { name: "Voeg wens toe" }).click()
    await expect(toasts(page)).toContainText("Vul een geldige URL in")
  }

  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("login only redirects to paths within the app", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.route(
    url => url.hostname === "example.com",
    route => route.fulfill({ body: "Extern" })
  )

  for (const callbackUrl of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
  ]) {
    await page.goto(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
    await expect(page, callbackUrl).toHaveURL("/")
  }

  await page.goto(`/login?callbackUrl=${encodeURIComponent("/profile")}`)
  await expect(page).toHaveURL("/profile")
})

test("avatar file names can't escape the avatar folder", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)
  const escaped = ".next/standalone/public/avatars/evil.png"

  try {
    await page.goto("/profile")
    await page.getByLabel("Profielfoto").setInputFiles({
      name: "../../../evil.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        "base64"
      ),
    })
    await page.getByRole("button", { name: "Opslaan" }).click()
    await expect(toasts(page)).toContainText("Je gegevens zijn opgeslagen")

    const { image } = await prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    })
    expect(image).toMatch(
      new RegExp(`/avatars/${user.id}/[0-9a-f-]{36}\\.png$`)
    )
    expect(existsSync(escaped)).toBe(false)
  } finally {
    await rm(escaped, { force: true })
    await rm(`.next/standalone/public/avatars/${user.id}`, {
      recursive: true,
      force: true,
    })
  }
})

test("responses include security headers", async ({ request }) => {
  const response = await request.get("/login")
  const headers = response.headers()

  expect(headers).toMatchObject({
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
  })
  expect(headers["x-powered-by"]).toBeUndefined()
})

test("followers of a wishlist can see it and check off its wishes", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const follower = await createUser()
  const wishlist = await createWishlist(owner, { followers: [follower] })
  const page = await signIn(follower)
  const { id } = await prisma.wishlistItem.create({
    data: { title: "Fiets", createdAt: new Date(), wishlistId: wishlist.id },
  })

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page.getByRole("heading", { name: "Olga" })).toBeVisible()

  await page
    .locator("div.rounded-md")
    .filter({ hasText: "Fiets" })
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect
    .poll(
      async () =>
        (await prisma.wishlistItem.findUniqueOrThrow({ where: { id } })).userId
    )
    .toBe(follower.id)
})
