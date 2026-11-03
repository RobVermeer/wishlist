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
} from "./fixtures"
import { baseURL } from "./support/env"
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
  const wishlist = await createWishlist(owner, { groups: [group] })

  return { owner, shopper, group, wishlist }
}

test("view a wishlist of a group member", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  await createWishlist(shopper, { groups: [group] })
  await createItem(wishlist, { title: "Sokken" })
  await createItem(wishlist, {
    title: "Koptelefoon",
    links: ["https://example.com/koptelefoon"],
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("link", { name: "Olga" }).click()

  await expect(page).toHaveURL(`/group/${group.id}/${wishlist.id}`)
  await expect(page).toHaveTitle("Olga - Familie - Niet Weer Sokken")
  await expect(
    page.getByRole("heading", { name: "Olga", exact: true })
  ).toBeVisible()
  await expect(
    page.getByText("Olga ziet niet wat er wordt gekocht.")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Wijzig verlanglijstje" })
  ).toHaveCount(0)
  await expect(itemCard(page, "Sokken")).toBeVisible()
  await expect(
    itemCard(page, "Koptelefoon").getByRole("link", { name: "example.com" })
  ).toHaveAttribute("href", "https://example.com/koptelefoon")
  await expect(
    page.getByRole("button", { name: "Voeg een wens toe" })
  ).toBeHidden()
  await expect(page.getByRole("button", { name: /^Wijzig/ })).toHaveCount(0)

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
  await prisma.reminder.create({
    data: { to: owner.id, from: shopper.id, wishlistId: wishlist.id },
  })
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

test("an empty wishlist with managers says they get the e-mail too", async ({
  signIn,
}) => {
  const { owner, shopper, group } = await setup()
  const manager = await createUser({ firstName: "Mark" })
  const wishlist = await createWishlist(owner, {
    title: "Emma",
    groups: [group],
    managers: [manager],
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expect(
    page.getByText(
      "Vraag om meer wensen, dan krijgen Olga en wie het verlanglijstje mee beheert een e-mail."
    )
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
    `Sokken Voor Olga · ${today}`
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
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(shopper.id)
})

test("only one of the people buying a wish at the same time gets it", async ({
  signIn,
}) => {
  const { shopper, group, wishlist } = await setup()
  const others = await Promise.all([1, 2, 3].map(() => createUser()))
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { connect: others.map(({ id }) => ({ id })) } },
  })
  const item = await createItem(wishlist, { title: "Sokken" })
  const shoppers = [shopper, ...others]
  const pages = await Promise.all(shoppers.map(user => signIn(user)))
  const path = `/group/${group.id}/${wishlist.id}`

  // Stop the request of the button and send it for every shopper at once.
  // The requests only overlap now and then, so it tries a number of times.
  const buy = new Promise<{
    url: string
    headers: Record<string, string>
    body: string
  }>(resolve =>
    pages[0].route(`**${path}`, async route => {
      const request = route.request()
      if (request.method() === "POST" && request.headers()["next-action"]) {
        resolve({
          url: request.url(),
          headers: request.headers(),
          body: request.postData()!,
        })
        return route.abort()
      }
      return route.continue()
    })
  )
  await pages[0].goto(path)
  await itemCard(pages[0], "Sokken")
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  const { url, headers, body } = await buy

  for (let attempt = 0; attempt < 10; attempt++) {
    await prisma.wishlistItem.update({
      where: { id: item.id },
      data: { userId: null, boughtAt: null },
    })
    const bought = await Promise.all(
      pages.map(async page => {
        const response = await page.request.post(url, {
          headers: {
            "next-action": headers["next-action"],
            "next-router-state-tree": headers["next-router-state-tree"],
            "content-type": headers["content-type"],
            accept: headers["accept"],
            origin: new URL(url).origin,
          },
          data: body,
        })
        return (await response.text()).includes('{"type":"success"}')
      })
    )

    expect(bought.filter(Boolean)).toHaveLength(1)
    expect(
      (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
        .userId
    ).toBe(shoppers[bought.indexOf(true)].id)
  }
})

test("tapping twice on 'Ik koop dit' buys the wish once", async ({
  signIn,
}) => {
  const { shopper, group, wishlist } = await setup()
  const item = await createItem(wishlist, { title: "Sokken" })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  const card = itemCard(page, "Sokken")
  await card.getByRole("button", { name: "Ik koop dit" }).dblclick()

  await expect(card).toContainText("Jij koopt dit")
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect(toasts(page)).not.toContainText("Je koopt dit toch niet")
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
  expect(reminder.html).toContain(
    "Iemand vraagt of je nog wat extra wensen op je verlanglijstje kunt zetten."
  )
  expect(reminder.html).toContain(
    "Je krijgt deze e-mail omdat iemand met wie je je verlanglijstje deelt om meer wensen vraagt."
  )
  expect(reminder.html).toContain(`href="${baseURL}/wishlist/${wishlist.id}"`)

  const reminders = await prisma.reminder.findMany({ where: { to: owner.id } })
  expect(reminders).toEqual([
    expect.objectContaining({
      from: shopper.id,
      to: owner.id,
      wishlistId: wishlist.id,
    }),
  ])

  await page.reload()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeHidden()
})

test("ask for more wishes on a verlanglijstje for someone else", async ({
  signIn,
}) => {
  const { owner, shopper, group, wishlist } = await setup()
  const manager = await createUser({ firstName: "Mark" })
  const emma = await createWishlist(owner, {
    title: "Emma",
    groups: [group],
    managers: [manager],
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${emma.id}`)
  await page.getByRole("button", { name: "Vraag om meer wensen" }).click()

  await expect(toasts(page)).toContainText("We hebben om meer wensen gevraagd!")

  for (const [user, name] of [
    [owner, "Olga"],
    [manager, "Mark"],
  ] as const) {
    await expect.poll(async () => (await emailsTo(user.email!)).length).toBe(1)
    const [reminder] = await emailsTo(user.email!)
    expect(reminder.subject).toBe("Heeft Emma nog wensen?")
    expect(reminder.html).toContain(name)
    expect(reminder.html).toContain(
      "Iemand vraagt of je nog wat extra wensen op het verlanglijstje voor Emma kunt zetten."
    )
    expect(reminder.html).toContain(
      "Je krijgt deze e-mail omdat je het verlanglijstje voor Emma beheert en iemand met wie je het deelt om meer wensen vraagt."
    )
    expect(reminder.html).toContain(`/wishlist/${emma.id}"`)
  }
  expect(await emailsTo(shopper.email!)).toHaveLength(0)

  await page.reload()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeHidden()

  // Olga's own verlanglijstje is a different one, so it can still be asked.
  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeVisible()
})

test("a reminder can only be sent once per 24 hours", async ({ signIn }) => {
  const { owner, shopper, group, wishlist } = await setup()
  const page = await signIn(shopper)

  await prisma.reminder.create({
    data: {
      to: owner.id,
      from: shopper.id,
      wishlistId: wishlist.id,
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

  await expect(page).toHaveTitle(
    "Gekochte cadeaus - Profiel - Niet Weer Sokken"
  )
  await expect(itemCard(page, "Sokken")).toHaveText(
    /^Sokken\s*Voor Olga · 5 december 2025$/
  )
  await expect(itemCard(page, "Rammelaar")).toHaveText(
    /^Rammelaar\s*Voor Baby Bo$/
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

  await expect(itemCard(page, "Sokken")).toHaveText(/^Sokken\s*Voor Olga$/)
  await expect(itemCard(page, "Weggehaald")).toHaveText(
    /^Weggehaald\s*Voor Olga\s*Deze wens is verwijderd\.$/
  )
  await expect(itemCard(page, "Van oud lijstje")).toHaveText(
    /^Van oud lijstje\s*Voor Oud lijstje\s*Dit verlanglijstje is verwijderd\.$/
  )
})

const daysAgo = (days: number) => new Date(Date.now() - days * 86_400_000)

const visibleCards = (page: Page) =>
  page.locator("div.rounded-2xl").filter({ visible: true })

test("bought presents page shows the newest first and keeps older ones behind a button", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
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

  await expect(visibleCards(page)).toHaveText([
    /^Gisteren/,
    /^Vorige week/,
    /^Zonder datum/,
  ])
  await expect(page.getByText("Vorig jaar")).toBeHidden()

  await page.getByRole("button", { name: "Toon eerdere cadeaus (1)" }).click()

  await expect(visibleCards(page)).toHaveText([
    /^Gisteren/,
    /^Vorige week/,
    /^Zonder datum/,
    /^Vorig jaar/,
  ])
  await expect(
    page.getByRole("button", { name: /Toon eerdere cadeaus/ })
  ).toBeHidden()
})

test("bought presents page shows at most 15 gifts at first", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
  for (let day = 1; day <= 17; day++) {
    await createItem(wishlist, {
      title: `Cadeau van dag ${day}.`,
      boughtBy: shopper,
      boughtAt: daysAgo(day),
    })
  }
  await createItem(wishlist, {
    title: "Vorig jaar",
    boughtBy: shopper,
    boughtAt: daysAgo(400),
  })
  const page = await signIn(shopper)

  await page.goto("/profile/bought")

  await expect(visibleCards(page)).toHaveText(
    Array.from(
      { length: 15 },
      (_, i) => new RegExp(`^Cadeau van dag ${i + 1}\\.`)
    )
  )
  await expect(page.getByText("Vorig jaar")).toBeHidden()

  await page.getByRole("button", { name: "Toon eerdere cadeaus (3)" }).click()

  await expect(visibleCards(page)).toHaveText([
    ...Array.from(
      { length: 17 },
      (_, i) => new RegExp(`^Cadeau van dag ${i + 1}\\.`)
    ),
    /^Vorig jaar/,
  ])
})

test("bought presents page has no button when everything is shown", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
  for (let day = 1; day <= 15; day++) {
    await createItem(wishlist, {
      title: `Cadeau van dag ${day}.`,
      boughtBy: shopper,
      boughtAt: daysAgo(day),
    })
  }
  const page = await signIn(shopper)

  await page.goto("/profile/bought")

  await expect(visibleCards(page)).toHaveCount(15)
  await expect(
    page.getByRole("button", { name: /Toon eerdere cadeaus/ })
  ).toHaveCount(0)
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
