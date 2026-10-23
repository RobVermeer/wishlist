import {
  test,
  expect,
  createUser,
  createWishlist,
  createCategory,
  createGroup,
  createItem,
  prisma,
  toasts,
} from "./fixtures"
import { Locator, Page } from "@playwright/test"

const itemCard = (page: Page, title: string) =>
  page.locator("div.rounded-2xl").filter({ hasText: title })

async function expectAllFields(dialog: Locator) {
  await expect(dialog.getByLabel("Wens", { exact: true })).toBeVisible()
  await expect(dialog.getByLabel("Linkje")).toBeVisible()
  await expect(dialog.getByLabel("Categorie")).toBeVisible()
  await expect(
    dialog.getByLabel("Deze wens mag onbeperkt vervuld worden")
  ).toBeVisible()
}

test("empty wishlist invites you to add wishes", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  await expect(
    page.getByRole("heading", { name: "Mijn lijstje" })
  ).toBeVisible()
  await expect(
    page.getByText(
      "Je ziet niet wat anderen van dit verlanglijstje kopen, zo blijft het een verrassing 🎁"
    )
  ).toBeVisible()
  await expect(
    page.getByText("Dit lijstje is nog helemaal leeg 🫣")
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toBeHidden()
})

test("all fields of a wish show right away", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  await createItem(wishlist, { title: "Sokken" })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  await page.getByRole("button", { name: "Voeg een wens toe" }).click()
  const newDialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await expectAllFields(newDialog)
  await page.keyboard.press("Escape")

  await itemCard(page, "Sokken").getByRole("button", { name: "Wijzig" }).click()
  await expectAllFields(page.getByRole("dialog", { name: "Wijzig wens" }))
  await expect(page.getByRole("button", { name: "Meer opties" })).toHaveCount(0)
})

test("add a wish with a link", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Lego kasteel")
  await dialog.getByLabel("Linkje").fill("https://example.com/lego")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()

  const link = page.getByRole("link", { name: "Lego kasteel" })
  await expect(link).toHaveAttribute("href", "https://example.com/lego")
  await expect(link).toHaveAttribute("target", "_blank")

  const item = await prisma.wishlistItem.findFirstOrThrow({
    where: { wishlistId: wishlist.id },
  })
  expect(item).toMatchObject({
    title: "Lego kasteel",
    url: "https://example.com/lego",
    unlimited: false,
  })
})

test("wishes are listed in their order and new ones go last", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const first = await createItem(wishlist, { title: "Fiets" })
  await createItem(wishlist, { title: "Boek" })
  await prisma.wishlistItem.update({
    where: { id: first.id },
    data: { position: 5 },
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Puzzel")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()
  await expect(dialog).toBeHidden()

  await expect(page.locator("main div.rounded-2xl")).toHaveText([
    /Boek/,
    /Fiets/,
    /Puzzel/,
  ])
})

test("add an unlimited wish without a link", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Boeken")
  await dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()

  const card = itemCard(page, "Boeken")
  await expect(card).toBeVisible()
  await expect(card.locator("svg.lucide-infinity")).toBeVisible()
  await expect(card.getByRole("link")).toHaveCount(0)

  const item = await prisma.wishlistItem.findFirstOrThrow({
    where: { wishlistId: wishlist.id },
  })
  expect(item).toMatchObject({ title: "Boeken", url: null, unlimited: true })
})

test("wish validation errors are shown", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("X")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText(
    "Je wens moet minimaal uit 2 tekens bestaan"
  )

  await dialog.getByLabel("Wens", { exact: true }).fill("Xbox")
  await dialog.getByLabel("Linkje").fill("geen-url")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText("Vul een geldige URL in")
  await expect(dialog.getByLabel("Wens", { exact: true })).toHaveValue("Xbox")
  await expect(dialog.getByLabel("Linkje")).toHaveValue("geen-url")
  await expect(dialog).toBeVisible()
  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("edit a wish", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const item = await createItem(wishlist, {
    title: "Fiets",
    url: "https://example.com/fiets",
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await itemCard(page, "Fiets").getByRole("button", { name: "Wijzig" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await expect(dialog.getByLabel("Wens", { exact: true })).toHaveValue("Fiets")
  await expect(dialog.getByLabel("Linkje")).toHaveValue(
    "https://example.com/fiets"
  )

  await dialog.getByLabel("Wens", { exact: true }).fill("Elektrische fiets")
  await dialog.getByLabel("Linkje").clear()
  await dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(itemCard(page, "Elektrische fiets")).toBeVisible()
  await expect(
    page.getByRole("link", { name: "Elektrische fiets" })
  ).toBeHidden()

  const updated = await prisma.wishlistItem.findUniqueOrThrow({
    where: { id: item.id },
  })
  expect(updated).toMatchObject({
    title: "Elektrische fiets",
    url: null,
    unlimited: true,
  })
})

test("removing a wish asks for confirmation", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const item = await createItem(wishlist, { title: "Puzzel" })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await itemCard(page, "Puzzel").getByRole("button", { name: "Wijzig" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  const confirm = page.getByRole("alertdialog", { name: "Weet je het zeker?" })

  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await expect(confirm).toContainText("Je wens wordt definitief verwijderd.")
  await confirm.getByRole("button", { name: "Toch niet" }).click()
  await expect(confirm).toBeHidden()
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .removed
  ).toBe(false)

  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await confirm.getByRole("button", { name: "Verwijder" }).click()

  await expect(itemCard(page, "Puzzel")).toBeHidden()
  await expect(
    page.getByText("Dit lijstje is nog helemaal leeg 🫣")
  ).toBeVisible()
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .removed
  ).toBe(true)
})

test("owner does not see which wishes have been bought", async ({ signIn }) => {
  const owner = await createUser()
  const buyer = await createUser()
  const wishlist = await createWishlist(owner)
  await createItem(wishlist, { title: "Verrassing", boughtBy: buyer })
  const page = await signIn(owner)

  await page.goto(`/wishlist/${wishlist.id}`)

  const card = itemCard(page, "Verrassing")
  await expect(card).toBeVisible()
  await expect(card).not.toHaveClass(/line-through/)
  await expect(card.getByRole("button")).toHaveText(/Wijzig/)
})

const positionsOf = async (wishlistId: string) =>
  (
    await prisma.wishlistItem.findMany({
      where: { wishlistId },
      orderBy: { position: "asc" },
    })
  ).map(({ title }) => title)

test("owner can reorder wishes by dragging", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Olga" })
  const shopper = await createUser()
  const group = await createGroup(owner, { members: [shopper] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  await createItem(wishlist, { title: "Fiets" })
  await createItem(wishlist, { title: "Boek" })
  await createItem(wishlist, { title: "Puzzel" })
  const page = await signIn(owner)

  await page.goto(`/wishlist/${wishlist.id}`)

  const handle = page.getByRole("button", { name: "Verplaats wens Puzzel" })
  const target = itemCard(page, "Fiets")
  const from = (await handle.boundingBox())!
  const to = (await target.boundingBox())!

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2, to.y, { steps: 10 })
  await page.mouse.move(from.x + from.width / 2, to.y - 10, { steps: 5 })
  await page.mouse.up()

  await expect
    .poll(() => positionsOf(wishlist.id))
    .toEqual(["Puzzel", "Fiets", "Boek"])

  const shopperPage = await signIn(shopper)
  await shopperPage.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(shopperPage.locator("main div.rounded-2xl")).toHaveText([
    /Puzzel/,
    /Fiets/,
    /Boek/,
  ])
  await expect(
    shopperPage.getByRole("button", { name: /Verplaats wens/ })
  ).toHaveCount(0)
})

test("owner can reorder wishes in a category with the keyboard", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const books = await createCategory(wishlist, "Boeken", 0)
  await createItem(wishlist, { title: "Fiets" })
  await createItem(wishlist, { title: "Roman", category: books })
  await createItem(wishlist, { title: "Strip", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: /^Boeken \d+$/ }).click()

  const handle = page.getByRole("button", { name: "Verplaats wens Roman" })
  const announcement = page
    .locator('[role="status"][id^="DndLiveRegion"]')
    .filter({ hasText: /./ })

  await handle.focus()
  await page.keyboard.press("Space")
  await expect(announcement).toHaveText("Wens Roman opgepakt, positie 1 van 2.")
  await expect(async () => {
    await page.keyboard.press("ArrowDown")
    await expect(announcement).toHaveText(
      "Wens Roman verplaatst naar positie 2 van 2.",
      { timeout: 500 }
    )
  }).toPass()
  await page.keyboard.press("Space")
  await expect(announcement).toHaveText(
    "Wens Roman neergezet op positie 2 van 2."
  )

  await expect
    .poll(() => positionsOf(wishlist.id))
    .toEqual(["Fiets", "Strip", "Roman"])

  await page.reload()
  await expect(page.locator("main div.rounded-2xl")).toHaveText([
    /Fiets/,
    /Strip/,
    /Roman/,
  ])
})
