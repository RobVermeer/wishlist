import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  createInterest,
  emailsTo,
  prisma,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"
import { baseURL } from "./support/env"

const notFound = "We kunnen deze pagina niet vinden"

const itemCard = (page: Page, title: string) =>
  page.locator("div.rounded-2xl").filter({ hasText: title })

test("share your wishlist with a link", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Olga" })
  const wishlist = await createWishlist(owner)
  const page = await signIn(owner)

  await page.context().grantPermissions(["clipboard-read", "clipboard-write"])
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", { value: undefined })
  })
  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Deel dit verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Deel je verlanglijstje" })
  const link = dialog.getByLabel("Link naar je verlanglijstje")
  await expect(link).toHaveValue(/\/lijstje\/[\w-]{22}$/)

  const { shareToken } = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
  })
  await expect(link).toHaveValue(`http://localhost:3100/lijstje/${shareToken}`)

  await dialog.getByRole("button", { name: "Deel de link" }).click()
  await expect(toasts(page)).toContainText("Link van verlanglijstje gekopieerd")
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `Bekijk mijn verlanglijstje op Niet Weer Sokken.\nhttp://localhost:3100/lijstje/${shareToken}`
  )

  await page.reload()
  await page.getByRole("button", { name: "Deel dit verlanglijstje" }).click()
  await expect(link).toHaveValue(`http://localhost:3100/lijstje/${shareToken}`)
})

test("only the owner can share a wishlist", async ({ signIn }) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Deel dit verlanglijstje" })
  ).toHaveCount(0)
})

test("a shared wishlist asks to log in before showing anything", async ({
  page,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const buyer = await createUser({ firstName: "Bob" })
  const wishlist = await createWishlist(owner, {
    shareToken: `token-${owner.id}`,
  })
  const secretWish = `Geheime wens ${owner.id}`
  const boughtWish = `Gekochte wens ${owner.id}`
  await createItem(wishlist, {
    title: secretWish,
    links: [`https://example.com/${owner.id}`],
  })
  await createItem(wishlist, { title: boughtWish, boughtBy: buyer })
  const interest = `Geheime interesse ${owner.id}`
  await createInterest(wishlist, interest)

  await page.goto(`/lijstje/token-${owner.id}`)

  await expect(page).toHaveTitle("Olga - Niet Weer Sokken")
  await expect(
    page.getByRole("heading", { name: "Olga", level: 2 })
  ).toBeVisible()
  await expect(
    page.getByText("Olga heeft een verlanglijstje met je gedeeld.")
  ).toBeVisible()

  await expect(
    page.getByRole("heading", { name: "Bekijk de wensen en streep af" })
  ).toBeVisible()

  const html = await page.content()
  for (const hidden of [
    secretWish,
    boughtWish,
    interest,
    `example.com/${owner.id}`,
    buyer.id,
    buyer.email!,
    owner.email!,
  ]) {
    expect(html).not.toContain(hidden)
  }

  await page.getByRole("link", { name: "Log in om te bekijken" }).click()
  await expect(page).toHaveURL(
    `/login?callbackUrl=${encodeURIComponent(`/lijstje/token-${owner.id}`)}`
  )
})

test("log in from a shared wishlist, follow it and check off a wish", async ({
  page,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const wishlist = await createWishlist(owner, {
    shareToken: `token-${owner.id}`,
  })
  const item = await createItem(wishlist, { title: "Fiets" })
  const email = `guest-${Date.now()}@e2e.test`

  await page.goto(`/lijstje/token-${owner.id}`)
  await page.getByRole("link", { name: "Log in om te bekijken" }).click()
  await page.getByRole("button", { name: "Inloggen met e-mail" }).click()
  await page.getByRole("dialog").getByLabel("E-mail").fill(email)
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Inloggen" })
    .click()

  await expect.poll(async () => (await emailsTo(email)).length).toBe(1)
  const [loginEmail] = await emailsTo(email)
  const link = loginEmail.html
    .match(/href="([^"]*\/api\/auth\/callback\/email[^"]*)"/)?.[1]
    ?.replaceAll("&amp;", "&")
  await page.goto(link!)

  await expect(page).toHaveURL(`/lijstje/token-${owner.id}`)
  await page
    .getByRole("dialog", { name: "Vul je naam in" })
    .getByLabel("Voornaam")
    .fill("Gast")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Opslaan" })
    .click()

  await expect(page.getByText("Fiets")).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Bekijk de wensen en streep af" })
  ).toBeVisible()
  await expect(page.getByText("Volg dit verlanglijstje")).toHaveCount(1)
  await page.getByRole("button", { name: "Volg dit verlanglijstje" }).click()

  await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
  await itemCard(page, "Fiets")
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")

  const guest = await prisma.user.findUniqueOrThrow({ where: { email } })
  const followed = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
    include: { followers: true },
  })
  expect(followed.followers.map(({ id }) => id)).toEqual([guest.id])
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(guest.id)
})

test("followers of a shared wishlist see every link on a wish", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const visitor = await createUser()
  const wishlist = await createWishlist(owner, {
    shareToken: `token-${owner.id}`,
  })
  await createItem(wishlist, {
    title: "Lego kasteel",
    links: ["https://www.bol.com/lego", "https://www.coolblue.nl/lego"],
  })
  const page = await signIn(visitor)

  await page.goto(`/lijstje/token-${owner.id}`)
  await page.getByRole("button", { name: "Volg dit verlanglijstje" }).click()

  await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
  await expect(itemCard(page, "Lego kasteel").getByRole("link")).toHaveText([
    "bol.com",
    "coolblue.nl",
  ])
})

test("people who can already see a wishlist go straight to it", async ({
  signIn,
}) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, {
    groups: [group],
    shareToken: `token-${owner.id}`,
  })

  for (const user of [owner, member]) {
    const page = await signIn(user)
    await page.goto(`/lijstje/token-${owner.id}`)
    await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)
  }
})

test("unknown or removed shared wishlists are not found", async ({ page }) => {
  const owner = await createUser()
  await createWishlist(owner, { shareToken: `removed-${owner.id}` })
  await prisma.wishlist.updateMany({
    where: { shareToken: `removed-${owner.id}` },
    data: { removed: true },
  })

  for (const token of ["does-not-exist", `removed-${owner.id}`]) {
    await page.goto(`/lijstje/${token}`)
    await expect(page.getByText(notFound)).toBeVisible()
  }
})

test("followed wishlists are on the dashboard and can be unfollowed", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const follower = await createUser()
  const wishlist = await createWishlist(owner, { followers: [follower] })
  const page = await signIn(follower)

  await page.goto("/")
  await page.getByRole("link", { name: "Olga" }).click()
  await expect(page).toHaveURL(`/wishlist/${wishlist.id}`)

  await page.getByRole("button", { name: "Stop met volgen" }).click()

  await expect(toasts(page)).toContainText(
    "Je volgt dit verlanglijstje niet meer"
  )
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Olga" })).toHaveCount(0)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page.getByText(notFound)).toBeVisible()
})

test("only followers can unfollow a wishlist", async ({ signIn }) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, { groups: [group] })

  for (const user of [owner, member]) {
    const page = await signIn(user)
    await page.goto(`/wishlist/${wishlist.id}`)
    await expect(page.getByRole("heading", { level: 2 })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Stop met volgen" })
    ).toHaveCount(0)
  }
})

test("making a new link stops the old one, followers keep access", async ({
  signIn,
  browser,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const follower = await createUser()
  const wishlist = await createWishlist(owner, {
    followers: [follower],
    shareToken: `old-${owner.id}`,
  })
  const page = await signIn(owner)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Deel dit verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Deel je verlanglijstje" })
  const link = dialog.getByLabel("Link naar je verlanglijstje")
  await expect(link).toHaveValue(
    `http://localhost:3100/lijstje/old-${owner.id}`
  )
  await expect(dialog).toContainText(
    "Maak je een nieuwe link, dan werkt de oude niet meer."
  )

  await dialog.getByRole("button", { name: "Maak een nieuwe link" }).click()

  await expect(toasts(page)).toContainText("Er is een nieuwe link gemaakt")
  await expect(link).not.toHaveValue(/old-/)
  const { shareToken } = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
  })
  await expect(link).toHaveValue(`http://localhost:3100/lijstje/${shareToken}`)

  const visitor = await browser.newPage({ baseURL: "http://localhost:3100" })
  await visitor.goto(`/lijstje/old-${owner.id}`)
  await expect(visitor.getByText(notFound)).toBeVisible()
  await visitor.goto(`/lijstje/${shareToken}`)
  await expect(
    visitor.getByRole("heading", { name: "Olga", level: 2 })
  ).toBeVisible()
  await visitor.close()

  const followerPage = await signIn(follower)
  await followerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(
    followerPage.getByRole("heading", { name: "Olga", level: 2 })
  ).toBeVisible()
})

// The link goes in the text, on its own line: some share targets, like copying
// on macOS, glue a separate url to the text, which broke the link.
async function stubShare(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "share", {
      value: async (data: ShareData) => {
        ;(window as unknown as { shared: ShareData }).shared = data
      },
    })
  })
}

async function shared(page: Page) {
  await page.waitForFunction(
    () => (window as unknown as { shared?: ShareData }).shared
  )
  return page.evaluate(
    () => (window as unknown as { shared: ShareData }).shared
  )
}

async function shareWishlist(page: Page, wishlistId: string) {
  await page.goto(`/wishlist/${wishlistId}`)
  await page.getByRole("button", { name: "Deel dit verlanglijstje" }).click()
  await expect(page.getByLabel("Link naar je verlanglijstje")).toHaveValue(
    /lijstje/
  )
  await page.getByRole("button", { name: "Deel de link" }).click()
}

test("sharing your wishlist starts with a short intro", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Olga" })
  const wishlist = await createWishlist(owner)
  const page = await signIn(owner)

  await stubShare(page)
  await shareWishlist(page, wishlist.id)

  const { shareToken } = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
  })
  expect(await shared(page)).toEqual({
    title: "Olga",
    text: `Bekijk mijn verlanglijstje op Niet Weer Sokken.\n${baseURL}/lijstje/${shareToken}`,
  })
})

test("sharing a wishlist for someone else names them in the intro", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const wishlist = await createWishlist(owner, { title: "Sam" })
  const page = await signIn(owner)

  await stubShare(page)
  await shareWishlist(page, wishlist.id)

  const { shareToken } = await prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
  })
  expect(await shared(page)).toEqual({
    title: "Sam",
    text: `Bekijk het verlanglijstje van Sam op Niet Weer Sokken.\n${baseURL}/lijstje/${shareToken}`,
  })
})

test("sharing a group invites with a short intro", async ({ signIn }) => {
  const owner = await createUser()
  const group = await createGroup(owner, { title: "Familie" })
  const page = await signIn(owner)

  await stubShare(page)
  await page.goto(`/group/${group.id}`)
  await page
    .getByRole("button", { name: "Nodig iemand uit voor de groep" })
    .click()

  expect(await shared(page)).toEqual({
    title: "Familie",
    text: `Ik nodig je uit voor de groep Familie op Niet Weer Sokken, zodat we elkaars verlanglijstjes kunnen zien.\n${baseURL}/group/${group.id}`,
  })
})
