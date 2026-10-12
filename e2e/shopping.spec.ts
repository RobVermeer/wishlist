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
import { Page } from "@playwright/test"

const itemCard = (page: Page, title: string) =>
  page.locator("div.rounded-md").filter({ hasText: title })

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
    page.getByRole("heading", { name: "Olga In Familie" })
  ).toBeVisible()
  await expect(page.getByText("Alles is welkom")).toBeVisible()
  await expect(itemCard(page, "Sokken")).toBeVisible()
  await expect(page.getByRole("link", { name: "Koptelefoon" })).toHaveAttribute(
    "href",
    "https://example.com/koptelefoon"
  )
  await expect(
    page.getByRole("button", { name: "Voeg een wens toe" })
  ).toBeHidden()
  await expect(page.getByRole("button", { name: "Wijzig" })).toBeHidden()

  await page.getByRole("link", { name: "Familie" }).click()
  await expect(page).toHaveURL(`/group/${group.id}`)
})

test("empty wishlist of someone else", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expect(
    page.getByText("Dit lijstje is nog helemaal leeg 🫣")
  ).toBeVisible()
})

test("check off a wish and undo it", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  const item = await createItem(wishlist, { title: "Sokken" })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Sokken")
  await expect(card).not.toHaveClass(/line-through/)
  await card.getByRole("button").click()

  await expect(toasts(page)).toContainText("Je hebt deze wens afgestreept")
  await expect(card).toHaveClass(/line-through/)
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(shopper.id)

  await page.goto("/profile/bought")
  await expect(page.getByText("Sokken")).toBeVisible()
  await expect(page.getByText("Gekocht voor Olga")).toBeVisible()

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await card.getByRole("button").click()

  await expect(toasts(page)).toContainText(
    "Je hebt het afstrepen ongedaan gemaakt"
  )
  await expect(card).not.toHaveClass(/line-through/)
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBeNull()

  await page.goto("/profile/bought")
  await expect(
    page.getByText(
      "Het ziet er naar uit dat je nog geen cadeaus hebt afgestreept 😲"
    )
  ).toBeVisible()
})

test("a wish bought by someone else cannot be checked off again", async ({
  signIn,
}) => {
  const { shopper, group, wishlist } = await setup()
  const otherShopper = await createUser()
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { connect: { id: otherShopper.id } } },
  })
  const item = await createItem(wishlist, {
    title: "Sokken",
    boughtBy: shopper,
  })
  const page = await signIn(otherShopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Sokken")
  await expect(card).toHaveClass(/line-through/)
  await card.getByRole("button").click()

  await expect(toasts(page)).toContainText(
    "Deze wens is al door iemand anders gekocht"
  )
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .userId
  ).toBe(shopper.id)
})

test("unlimited wishes cannot be checked off", async ({ signIn }) => {
  const { shopper, group, wishlist } = await setup()
  await createItem(wishlist, { title: "Boeken", unlimited: true })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Boeken")
  await card.getByRole("button").click()

  await expect(page.getByRole("dialog")).toContainText(
    "Deze wens kan onbeperkt vervuld worden."
  )
  await expect(card).not.toHaveClass(/line-through/)
})

test("ask the owner to add more wishes", async ({ signIn }) => {
  const { owner, shopper, group, wishlist } = await setup()
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)
  await page
    .getByRole("button", { name: "Vraag om meer cadeaus op de lijst" })
    .click()

  await expect(toasts(page)).toContainText("We hebben het gevraagd!")

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
    page.getByRole("button", { name: "Vraag om meer cadeaus op de lijst" })
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
    page.getByRole("button", { name: "Vraag om meer cadeaus op de lijst" })
  ).toBeHidden()

  await prisma.reminder.updateMany({
    where: { to: owner.id },
    data: { createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
  })
  await page.reload()
  await expect(
    page.getByRole("button", { name: "Vraag om meer cadeaus op de lijst" })
  ).toBeVisible()
})

test("bought presents page lists what you bought for whom", async ({
  signIn,
}) => {
  const { shopper, wishlist } = await setup()
  const other = await createUser({ firstName: "Piet" })
  const managedList = await createWishlist(other, { title: "Baby Bo" })
  await createItem(wishlist, { title: "Sokken", boughtBy: shopper })
  await createItem(managedList, { title: "Rammelaar", boughtBy: shopper })
  await createItem(managedList, { title: "Knuffel", boughtBy: other })
  const page = await signIn(shopper)

  await page.goto("/profile/bought")

  await expect(page).toHaveTitle("Mijn gekochte cadeaus - Profiel - Wishlist")
  await expect(itemCard(page, "Sokken")).toContainText("Gekocht voor Olga")
  await expect(itemCard(page, "Rammelaar")).toContainText(
    "Gekocht voor Baby Bo"
  )
  await expect(page.getByText("Knuffel")).toBeHidden()
})

test("bought presents page leaves out removed wishes and wishlists", async ({
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

  await expect(itemCard(page, "Sokken")).toBeVisible()
  await expect(page.getByText("Weggehaald")).toBeHidden()
  await expect(page.getByText("Van oud lijstje")).toBeHidden()
})
