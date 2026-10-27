import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  emailsTo,
  prisma,
  toasts,
  trackedIssues,
} from "./fixtures"
import { Page } from "@playwright/test"

const itemCard = (page: Page, title: string) =>
  page.locator("div.rounded-2xl").filter({ hasText: title })

async function setup() {
  const owner = await createUser({ firstName: "Olga" })
  const shopper = await createUser({ firstName: "Sam" })
  const group = await createGroup(owner, {
    title: "Familie",
    members: [shopper],
  })
  const wishlist = await createWishlist(owner, {
    description: "Alles is welkom",
    groups: [group],
  })

  return { owner, shopper, group, wishlist }
}

test("view a wishlist of a group member", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  await createWishlist(shopper, { groups: [group] })
  await createItem(wishlist, { title: "Sokken" })
  await createItem(wishlist, {
    title: "Koptelefoon",
    url: "https://example.com/koptelefoon",
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("link", { name: "Olga" }).click()

  await expect(page).toHaveURL(`/group/${group.id}/${wishlist.id}`)
  await expect(page).toHaveTitle("Olga - Familie - Wishlist")
  await expect(
    page.getByRole("heading", { name: "Olga in Familie" })
  ).toBeVisible()
  await expect(page.getByText("Alles is welkom")).toBeVisible()
  await expect(
    page.getByText("Olga ziet niet wat er wordt gekocht 🤫")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Wijzig verlanglijstje" })
  ).toHaveCount(0)
  await expect(itemCard(page, "Sokken")).toBeVisible()
  await expect(page.getByRole("link", { name: "Koptelefoon" })).toHaveAttribute(
    "href",
    "https://example.com/koptelefoon"
  )
  await expect(
    page.getByRole("button", { name: "Voeg een wens toe" })
  ).toBeHidden()
  await expect(
    page.getByRole("button", { name: "Wijzig", exact: true })
  ).toBeHidden()

  await page.getByRole("link", { name: "Familie" }).click()
  await expect(page).toHaveURL(`/group/${group.id}`)
})

test("empty wishlist of someone else", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expect(page.getByText("Olga heeft nog geen wensen")).toBeVisible()
  await expect(
    page.getByText("Vraag om meer wensen, dan krijgt Olga een e-mail.")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeVisible()
})

test("an empty wishlist says to look later once more wishes were asked for", async ({
  signIn,
}) => {
  const { owner, shopper, group, wishlist } = await setup()
  await prisma.reminder.create({ data: { to: owner.id, from: shopper.id } })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expect(page.getByText("Olga heeft nog geen wensen")).toBeVisible()
  await expect(page.getByText("Kijk later nog eens.")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toHaveCount(0)
})

test("an empty wishlist for someone else says who gets the e-mail", async ({
  signIn,
}) => {
  const { owner, shopper, group } = await setup()
  const wishlist = await createWishlist(owner, {
    title: "Baby Olga",
    groups: [group],
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expect(page.getByText("Baby Olga heeft nog geen wensen")).toBeVisible()
  await expect(
    page.getByText("Vraag om meer wensen, dan krijgt Olga een e-mail.")
  ).toBeVisible()
})

test("buy a wish and change your mind", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const item = await createItem(wishlist, { title: "Sokken" })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Sokken")
  await card.getByRole("button", { name: "Ik koop dit" }).click()

  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect(card).toContainText("Jij koopt dit")
  await expect(card.getByText("Sokken")).toHaveClass(/line-through/)
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(shopper.id)

  const today = new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "long",
    timeZone: "Europe/Amsterdam",
  }).format(new Date())
  await page.goto("/profile/bought")
  await expect(itemCard(page, "Sokken")).toHaveText(
    `Sokken Gekocht voor Olga op ${today}`
  )

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await card.getByRole("button", { name: "Toch niet" }).click()

  await expect(toasts(page)).toContainText("Je koopt dit toch niet")
  await expect(card.getByRole("button", { name: "Ik koop dit" })).toBeVisible()
  await expect(card).not.toContainText("Jij koopt dit")
  const unbought = await prisma.wishlistItem.findUniqueOrThrow({
    where: { id: item.id },
  })
  expect(unbought.userId).toBeNull()
  expect(unbought.boughtAt).toBeNull()

  await page.goto("/profile/bought")
  await expect(page.getByText("Je hebt nog niets afgestreept")).toBeVisible()
  await expect(
    page.getByText("Druk bij een wens op ‘Ik koop dit’, dan zie je hier terug")
  ).toBeVisible()
})

test("undo buying a wish from the toast", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const item = await createItem(wishlist, { title: "Sokken" })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Sokken")
  await card.getByRole("button", { name: "Ik koop dit" }).click()
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await toasts(page).getByRole("button", { name: "Ongedaan maken" }).click()

  await expect(toasts(page)).toContainText("Je koopt dit toch niet")
  await expect(
    toasts(page).getByRole("button", { name: "Ongedaan maken" })
  ).toHaveCount(0)
  await expect(card.getByRole("button", { name: "Ik koop dit" })).toBeVisible()
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBeNull()
})

test("undo changing your mind from the toast", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const item = await createItem(wishlist, {
    title: "Sokken",
    boughtBy: shopper,
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Sokken")
  await card.getByRole("button", { name: "Toch niet" }).click()
  await expect(toasts(page)).toContainText("Je koopt dit toch niet")
  await toasts(page).getByRole("button", { name: "Ongedaan maken" }).click()

  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect(card).toContainText("Jij koopt dit")
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(shopper.id)
})

test("a wish someone else buys shows as already bought", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const otherShopper = await createUser()
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { connect: { id: otherShopper.id } } },
  })
  await createItem(wishlist, { title: "Sokken", boughtBy: shopper })
  const page = await signIn(otherShopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Sokken")
  await expect(card).toContainText("Wordt al gekocht")
  await expect(card.getByText("Sokken")).toHaveClass(/line-through/)
  await expect(card.getByRole("button")).toHaveCount(0)
})

test("a wish bought in one group shows as bought everywhere the wishlist is shared", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const shopper = await createUser({ firstName: "Sam" })
  const friend = await createUser({ firstName: "Pia" })
  const follower = await createUser({ firstName: "Fien" })
  const group = await createGroup(owner, {
    title: "Familie",
    members: [shopper],
  })
  const friends = await createGroup(friend, {
    title: "Vrienden",
    members: [owner],
  })
  const wishlist = await createWishlist(owner, {
    groups: [group, friends],
    followers: [follower],
  })
  await createItem(wishlist, { title: "Sokken" })
  await createItem(wishlist, { title: "Boek" })

  const shopperPage = await signIn(shopper)
  await shopperPage.goto(`/group/${group.id}/${wishlist.id}`)
  await itemCard(shopperPage, "Sokken")
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  await expect(itemCard(shopperPage, "Sokken")).toContainText("Jij koopt dit")

  const followerPage = await signIn(follower)
  await followerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(itemCard(followerPage, "Sokken")).toContainText(
    "Wordt al gekocht"
  )
  await itemCard(followerPage, "Boek")
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  await expect(itemCard(followerPage, "Boek")).toContainText("Jij koopt dit")

  const friendPage = await signIn(friend)
  await friendPage.goto(`/group/${friends.id}/${wishlist.id}`)
  for (const title of ["Sokken", "Boek"]) {
    const card = itemCard(friendPage, title)
    await expect(card).toContainText("Wordt al gekocht")
    await expect(card.getByRole("button")).toHaveCount(0)
  }

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/wishlist/${wishlist.id}`)
  for (const title of ["Sokken", "Boek"]) {
    await expect(itemCard(ownerPage, title)).toBeVisible()
    await expect(itemCard(ownerPage, title)).not.toContainText("gekocht")
  }
})

test("buying a wish someone else just bought shows an error", async ({
  signIn,
}) => {
  const { shopper, group, wishlist } = await setup()
  const otherShopper = await createUser()
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { connect: { id: otherShopper.id } } },
  })
  const item = await createItem(wishlist, { title: "Sokken" })
  const page = await signIn(otherShopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await prisma.wishlistItem.update({
    where: { id: item.id },
    data: { userId: shopper.id },
  })
  await itemCard(page, "Sokken")
    .getByRole("button", { name: "Ik koop dit" })
    .click()

  await expect(toasts(page)).toContainText(
    "Deze wens is al door iemand anders gekocht"
  )
  await expect
    .poll(async () =>
      (await trackedIssues()).some(
        ({ message, extra }) =>
          message === "Toggle wishlist item by ID" &&
          (extra.error as { message?: string })?.message ===
            "Deze wens is al door iemand anders gekocht"
      )
    )
    .toBe(true)
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(shopper.id)
})

test("unlimited wishes can't be bought exclusively", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  await createItem(wishlist, { title: "Boeken", unlimited: true })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Boeken")
  await expect(card.getByRole("button", { name: "Ik koop dit" })).toHaveCount(0)
  await card.getByRole("button", { name: "Onbeperkt" }).click()

  await expect(page.getByRole("dialog")).toContainText(
    "Deze wens kan door meer mensen gekocht worden, hij blijft altijd open."
  )
})

test("ask the owner to add more wishes", async ({ signIn }) => {
  const { owner, shopper, group, wishlist } = await setup()
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await page.getByRole("button", { name: "Vraag om meer wensen" }).click()

  await expect(toasts(page)).toContainText("We hebben om meer wensen gevraagd!")

  await expect.poll(async () => (await emailsTo(owner.email!)).length).toBe(1)
  const [reminder] = await emailsTo(owner.email!)
  expect(reminder.subject).toBe("Heb je nog wensen?")
  expect(reminder.html).toContain("Olga")

  const reminders = await prisma.reminder.findMany({ where: { to: owner.id } })
  expect(reminders).toEqual([
    expect.objectContaining({ from: shopper.id, to: owner.id }),
  ])

  await page.reload()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeHidden()
})

test("a reminder can only be sent once per 24 hours", async ({ signIn }) => {
  const { owner, shopper, group, wishlist } = await setup()
  const page = await signIn(shopper)

  await prisma.reminder.create({
    data: {
      to: owner.id,
      from: shopper.id,
      createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
    },
  })
  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeHidden()

  await prisma.reminder.updateMany({
    where: { to: owner.id },
    data: { createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
  })
  await page.reload()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeVisible()
})

test("bought presents page lists what you bought for whom", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
  const other = await createUser({ firstName: "Piet" })
  const managedList = await createWishlist(other, { title: "Baby Bo" })
  await createItem(wishlist, {
    title: "Sokken",
    boughtBy: shopper,
    boughtAt: new Date("2025-12-04T23:30:00Z"),
  })
  await createItem(managedList, { title: "Rammelaar", boughtBy: shopper })
  await createItem(managedList, { title: "Knuffel", boughtBy: other })
  const page = await signIn(shopper)

  await page.goto("/profile/bought")

  await expect(page).toHaveTitle("Mijn gekochte cadeaus - Profiel - Wishlist")
  await expect(itemCard(page, "Sokken")).toHaveText(
    /^Sokken\s*Gekocht voor Olga op 5 december 2025$/
  )
  await expect(itemCard(page, "Rammelaar")).toHaveText(
    /^Rammelaar\s*Gekocht voor Baby Bo$/
  )
  await expect(page.getByText("Knuffel")).toBeHidden()
})

test("bought presents page keeps removed wishes and wishlists", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
  const other = await createUser({ firstName: "Piet" })
  const removedList = await createWishlist(other, { title: "Oud lijstje" })
  await createItem(wishlist, { title: "Sokken", boughtBy: shopper })
  const removedItem = await createItem(wishlist, {
    title: "Weggehaald",
    boughtBy: shopper,
  })
  await createItem(removedList, { title: "Van oud lijstje", boughtBy: shopper })
  await prisma.wishlistItem.update({
    where: { id: removedItem.id },
    data: { removed: true },
  })
  await prisma.wishlist.update({
    where: { id: removedList.id },
    data: { removed: true },
  })
  const page = await signIn(shopper)

  await page.goto("/profile/bought")

  await expect(itemCard(page, "Sokken")).toHaveText(
    /^Sokken\s*Gekocht voor Olga$/
  )
  await expect(itemCard(page, "Weggehaald")).toHaveText(
    /^Weggehaald\s*Gekocht voor Olga\s*Deze wens is verwijderd\.$/
  )
  await expect(itemCard(page, "Van oud lijstje")).toHaveText(
    /^Van oud lijstje\s*Gekocht voor Oud lijstje\s*Dit verlanglijstje is verwijderd\.$/
  )
})

test("bought presents page shows the newest first and folds away older ones", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
  const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000)
  await createItem(wishlist, {
    title: "Zonder datum",
    boughtBy: shopper,
  })
  await createItem(wishlist, {
    title: "Vorige week",
    boughtBy: shopper,
    boughtAt: daysAgo(7),
  })
  await createItem(wishlist, {
    title: "Vorig jaar",
    boughtBy: shopper,
    boughtAt: daysAgo(400),
  })
  await createItem(wishlist, {
    title: "Gisteren",
    boughtBy: shopper,
    boughtAt: daysAgo(1),
  })
  const page = await signIn(shopper)

  await page.goto("/profile/bought")

  const earlier = page.getByRole("group").filter({
    has: page.getByText("Eerdere cadeaus"),
  })
  await expect(
    page.locator("div.rounded-2xl").filter({ visible: true })
  ).toHaveText([/^Gisteren/, /^Vorige week/, /^Zonder datum/])
  await expect(earlier.getByText("Vorig jaar")).toBeHidden()

  await earlier.getByText("Eerdere cadeaus").click()

  await expect(itemCard(page, "Vorig jaar")).toBeVisible()
  await expect(earlier).toContainText(
    "Wat je meer dan een jaar geleden hebt gekocht."
  )
})

test("the buttons of a wish fit on a small phone", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  await createItem(wishlist, {
    title: "Koptelefoon met noise cancelling",
    boughtBy: shopper,
  })
  const page = await signIn(shopper)
  await page.setViewportSize({ width: 320, height: 640 })

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = (await itemCard(page, "Koptelefoon").boundingBox())!
  const button = (await page
    .getByRole("button", { name: "Toch niet" })
    .boundingBox())!
  expect(button.x + button.width).toBeLessThanOrEqual(card.x + card.width)
})
