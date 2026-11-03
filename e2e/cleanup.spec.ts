import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  createDraw,
  dateInAmsterdam,
  prisma,
} from "./fixtures"
import { Page } from "@playwright/test"

const itemCard = (page: Page, title: string) =>
  page.locator("div.rounded-2xl").filter({ hasText: title })

const daysFromToday = (days: number) => new Date(dateInAmsterdam(days))

// Olga's wishlist in a group per party, with Sam in every group.
async function setup(parties: (number | null)[]) {
  const owner = await createUser({ firstName: "Olga" })
  const shopper = await createUser({ firstName: "Sam" })
  const groups = []

  for (const [index, party] of parties.entries()) {
    const group = await createGroup(owner, {
      title: `Feest ${index + 1}`,
      members: [shopper],
    })
    await createDraw(group, [owner, shopper], {
      date: party === null ? null : daysFromToday(party),
    })
    groups.push(group)
  }

  const wishlist = await createWishlist(owner, { groups })
  const items = {
    bought: await createItem(wishlist, {
      title: "Sokken",
      boughtBy: shopper,
      boughtAt: daysFromToday(-30),
    }),
    open: await createItem(wishlist, { title: "Boek" }),
    unlimited: await createItem(wishlist, {
      title: "Cadeaubon",
      unlimited: true,
    }),
  }

  return { owner, shopper, groups, wishlist, items }
}

const isRemoved = async (id: string) =>
  (await prisma.wishlistItem.findUniqueOrThrow({ where: { id } })).removed

test("bought wishes go two days after the party", async ({ signIn }) => {
  const { owner, shopper, groups, wishlist, items } = await setup([-2])
  const page = await signIn(shopper)

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)

  await expect(itemCard(page, "Boek")).toBeVisible()
  await expect(itemCard(page, "Cadeaubon")).toBeVisible()
  await expect(itemCard(page, "Sokken")).toHaveCount(0)
  expect(await isRemoved(items.bought.id)).toBe(true)
  expect(await isRemoved(items.open.id)).toBe(false)
  expect(await isRemoved(items.unlimited.id)).toBe(false)

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(itemCard(ownerPage, "Boek")).toBeVisible()
  await expect(itemCard(ownerPage, "Sokken")).toHaveCount(0)
})

test("bought wishes stay until two days after the party", async ({
  signIn,
}) => {
  const { shopper, groups, wishlist, items } = await setup([-1])
  const page = await signIn(shopper)

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)

  await expect(itemCard(page, "Sokken")).toBeVisible()
  expect(await isRemoved(items.bought.id)).toBe(false)
})

test("the latest party of the groups a wishlist is in counts", async ({
  signIn,
}) => {
  const { shopper, groups, wishlist, items } = await setup([-30, -1, null])
  const page = await signIn(shopper)

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)

  await expect(itemCard(page, "Sokken")).toBeVisible()
  expect(await isRemoved(items.bought.id)).toBe(false)
})

test("a party without a date leaves bought wishes alone", async ({
  signIn,
}) => {
  const { shopper, groups, wishlist, items } = await setup([null])
  const page = await signIn(shopper)

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)

  await expect(itemCard(page, "Sokken")).toBeVisible()
  expect(await isRemoved(items.bought.id)).toBe(false)
})

test("wishes bought after the clean-up stay for the next party", async ({
  signIn,
}) => {
  const { shopper, groups, wishlist } = await setup([-20])
  const later = await createItem(wishlist, {
    title: "Puzzel",
    boughtBy: shopper,
    boughtAt: new Date(),
  })
  const page = await signIn(shopper)

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)

  await expect(itemCard(page, "Puzzel")).toBeVisible()
  await expect(itemCard(page, "Sokken")).toHaveCount(0)
  expect(await isRemoved(later.id)).toBe(false)
})

test("the buyer still sees a cleaned up gift under their bought presents", async ({
  signIn,
}) => {
  const { shopper, groups, wishlist } = await setup([-2])
  const page = await signIn(shopper)

  await page.goto(`/group/${groups[0].id}/${wishlist.id}`)
  await expect(itemCard(page, "Boek")).toBeVisible()
  await page.goto("/profile/bought")

  await expect(itemCard(page, "Sokken")).toHaveText(
    /^Sokken\s*Voor Olga · .+\s*Deze wens is verwijderd\.$/
  )
})
