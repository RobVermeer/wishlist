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

const linkField = (dialog: Locator, number: number) =>
  dialog.getByRole("textbox", { name: `Linkje ${number}`, exact: true })

async function expectAllFields(dialog: Locator) {
  await expect(dialog.getByLabel("Wens", { exact: true })).toBeVisible()
  await expect(linkField(dialog, 1)).toBeVisible()
  await expect(dialog.getByLabel("Categorie")).toBeVisible()
  await expect(
    dialog.getByLabel("Deze wens mag onbeperkt vervuld worden")
  ).toBeVisible()
}

test("the button to add a wish comes after the wishes", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  for (const title of ["Fiets", "Boek", "Trui"]) {
    await createItem(wishlist, { title })
  }
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  const button = await page
    .getByRole("button", { name: "Voeg een wens toe" })
    .boundingBox()
  const lastWish = await itemCard(page, "Trui").boundingBox()
  expect(button!.y).toBeGreaterThan(lastWish!.y)
})

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
  await expect(page.getByText("Je verlanglijstje is nog leeg")).toBeVisible()
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
  await linkField(dialog, 1).fill("https://example.com/lego")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()

  const card = itemCard(page, "Lego kasteel")
  await expect(card.getByRole("link")).toHaveText(["example.com"])
  const link = card.getByRole("link", { name: "example.com" })
  await expect(link).toHaveAttribute("href", "https://example.com/lego")
  await expect(link).toHaveAttribute("target", "_blank")
  await expect(link).toHaveAttribute("rel", "ugc nofollow noopener noreferrer")

  const item = await prisma.wishlistItem.findFirstOrThrow({
    where: { wishlistId: wishlist.id },
    include: { links: true },
  })
  expect(item).toMatchObject({
    title: "Lego kasteel",
    links: [{ url: "https://example.com/lego", position: 0 }],
    unlimited: false,
  })
})

test("group members see a link on a wish as a link from a user", async ({
  signIn,
}) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  await createItem(wishlist, {
    title: "Lego kasteel",
    links: ["https://example.com/lego"],
  })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Lego kasteel")
  await expect(card.getByRole("link")).toHaveText(["example.com"])
  const link = card.getByRole("link", { name: "example.com" })
  await expect(link).toHaveAttribute("href", "https://example.com/lego")
  await expect(link).toHaveAttribute("rel", "ugc nofollow noopener noreferrer")
})

test("add a wish with several links", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Lego kasteel")
  await expect(
    dialog.getByRole("button", { name: /Verwijder linkje/ })
  ).toHaveCount(0)
  await expect(
    dialog.getByRole("button", { name: "Nog een linkje" })
  ).toHaveCount(0)
  await linkField(dialog, 1).fill("https://www.bol.com/lego")
  await dialog.getByRole("button", { name: "Nog een linkje" }).click()
  await expect(linkField(dialog, 2)).toBeFocused()
  await expect(
    dialog.getByRole("button", { name: "Nog een linkje" })
  ).toHaveCount(0)
  await linkField(dialog, 2).fill("https://www.coolblue.nl/lego")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()

  const card = itemCard(page, "Lego kasteel")
  await expect(card.getByRole("link")).toHaveText(["bol.com", "coolblue.nl"])
  for (const [name, href] of [
    ["bol.com", "https://www.bol.com/lego"],
    ["coolblue.nl", "https://www.coolblue.nl/lego"],
  ]) {
    const link = card.getByRole("link", { name })
    await expect(link).toHaveAttribute("href", href)
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute(
      "rel",
      "ugc nofollow noopener noreferrer"
    )
  }

  const item = await prisma.wishlistItem.findFirstOrThrow({
    where: { wishlistId: wishlist.id },
    include: { links: { orderBy: { position: "asc" } } },
  })
  expect(item.links).toMatchObject([
    { url: "https://www.bol.com/lego", position: 0 },
    { url: "https://www.coolblue.nl/lego", position: 1 },
  ])
})

test("a wish has at most 5 links", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Fiets")
  for (let number = 1; number <= 5; number++) {
    if (number > 1) {
      await dialog.getByRole("button", { name: "Nog een linkje" }).click()
    }
    await linkField(dialog, number).fill(`https://example.com/fiets-${number}`)
  }
  await expect(
    dialog.getByRole("button", { name: "Nog een linkje" })
  ).toBeHidden()

  await dialog.locator("form").evaluate(form => {
    const input = document.createElement("input")
    input.name = "url"
    input.value = "https://example.com/fiets-6"
    form.append(input)
  })
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText(
    "Een wens kan maximaal 5 linkjes hebben"
  )
  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("a wrong extra link shows an error", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Xbox")
  await linkField(dialog, 1).fill("https://example.com/xbox")
  await dialog.getByRole("button", { name: "Nog een linkje" }).click()
  await linkField(dialog, 2).fill("geen-url")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText("Vul een geldige URL in")
  await expect(linkField(dialog, 1)).toHaveValue("https://example.com/xbox")
  await expect(linkField(dialog, 2)).toHaveValue("geen-url")
  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("edit the links of a wish", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const item = await createItem(wishlist, {
    title: "Lego kasteel",
    links: ["https://www.bol.com/lego", "https://www.coolblue.nl/lego"],
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await itemCard(page, "Lego kasteel")
    .getByRole("button", { name: "Wijzig" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await expect(linkField(dialog, 1)).toHaveValue("https://www.bol.com/lego")
  await expect(linkField(dialog, 2)).toHaveValue("https://www.coolblue.nl/lego")

  await dialog.getByRole("button", { name: "Verwijder linkje 1" }).click()
  await expect(linkField(dialog, 1)).toHaveValue("https://www.coolblue.nl/lego")
  await expect(linkField(dialog, 2)).toHaveCount(0)
  await dialog.getByRole("button", { name: "Nog een linkje" }).click()
  await linkField(dialog, 2).fill("https://www.amazon.nl/lego")
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(itemCard(page, "Lego kasteel").getByRole("link")).toHaveText([
    "coolblue.nl",
    "amazon.nl",
  ])

  const updated = await prisma.wishlistItem.findUniqueOrThrow({
    where: { id: item.id },
    include: { links: { orderBy: { position: "asc" } } },
  })
  expect(updated.links).toMatchObject([
    { url: "https://www.coolblue.nl/lego", position: 0 },
    { url: "https://www.amazon.nl/lego", position: 1 },
  ])
})

test("group members see every link on a wish", async ({ signIn }) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  await createItem(wishlist, {
    title: "Lego kasteel",
    links: ["https://www.bol.com/lego", "https://www.coolblue.nl/lego"],
  })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  const card = itemCard(page, "Lego kasteel")
  await expect(card.getByRole("link")).toHaveText(["bol.com", "coolblue.nl"])
  await expect(card.getByRole("link", { name: "coolblue.nl" })).toHaveAttribute(
    "href",
    "https://www.coolblue.nl/lego"
  )
  await expect(card.getByRole("link", { name: "coolblue.nl" })).toHaveAttribute(
    "rel",
    "ugc nofollow noopener noreferrer"
  )
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
    include: { links: true },
  })
  expect(item).toMatchObject({ title: "Boeken", links: [], unlimited: true })
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
  await linkField(dialog, 1).fill("geen-url")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText("Vul een geldige URL in")
  await expect(dialog.getByLabel("Wens", { exact: true })).toHaveValue("Xbox")
  await expect(linkField(dialog, 1)).toHaveValue("geen-url")
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
    links: ["https://example.com/fiets"],
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await itemCard(page, "Fiets").getByRole("button", { name: "Wijzig" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await expect(dialog.getByLabel("Wens", { exact: true })).toHaveValue("Fiets")
  await expect(linkField(dialog, 1)).toHaveValue("https://example.com/fiets")

  await dialog.getByLabel("Wens", { exact: true }).fill("Elektrische fiets")
  await linkField(dialog, 1).clear()
  await dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(itemCard(page, "Elektrische fiets")).toBeVisible()
  await expect(
    itemCard(page, "Elektrische fiets").getByRole("link")
  ).toHaveCount(0)

  const updated = await prisma.wishlistItem.findUniqueOrThrow({
    where: { id: item.id },
    include: { links: true },
  })
  expect(updated).toMatchObject({
    title: "Elektrische fiets",
    links: [],
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
  await expect(page.getByText("Je verlanglijstje is nog leeg")).toBeVisible()
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
  await expect(
    page.getByRole("button", { name: /Verplaats wens/ })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Volgorde aanpassen" }).click()
  await expect(
    page.getByText("Sleep de wensen naar de goede plek.")
  ).toBeVisible()

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

  await page.getByRole("button", { name: "Klaar" }).click()
  await expect(
    page.getByRole("button", { name: /Verplaats wens/ })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Volgorde aanpassen" })
  ).toBeVisible()

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
  await expect(
    shopperPage.getByRole("button", { name: "Volgorde aanpassen" })
  ).toHaveCount(0)
})

test("the order can only be changed when there is something to move", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const books = await createCategory(wishlist, "Boeken", 0)
  await createItem(wishlist, { title: "Fiets" })
  await createItem(wishlist, { title: "Roman", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page.getByText("Fiets")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Volgorde aanpassen" })
  ).toHaveCount(0)

  await createItem(wishlist, { title: "Strip", category: books })
  await page.reload()
  await expect(
    page.getByRole("button", { name: "Volgorde aanpassen" })
  ).toBeVisible()
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
  await page.getByRole("button", { name: "Volgorde aanpassen" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("button", { name: "Klaar" })).toBeFocused()

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

const unsavedChanges = (page: Page) =>
  page.getByRole("alertdialog", { name: "Wijzigingen niet opslaan?" })

test("closing a half-typed wish asks first", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Lego kasteel")
  await page.keyboard.press("Escape")

  const confirm = unsavedChanges(page)
  await expect(confirm).toHaveAccessibleDescription(
    "Je hebt iets veranderd dat nog niet is opgeslagen."
  )
  await confirm.getByRole("button", { name: "Verder bewerken" }).click()
  await expect(confirm).toBeHidden()
  await expect(dialog.getByLabel("Wens", { exact: true })).toHaveValue(
    "Lego kasteel"
  )

  await dialog.getByRole("button", { name: "Close" }).click()
  await expect(confirm).toBeVisible()
  await confirm.getByRole("button", { name: "Verder bewerken" }).click()
  await expect(confirm).toBeHidden()

  await page.mouse.click(5, 5)
  await expect(confirm).toBeVisible()
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()
  await expect(confirm).toBeHidden()
  await expect(dialog).toBeHidden()

  await page.getByRole("button", { name: "Voeg een wens toe" }).click()
  await expect(dialog.getByLabel("Wens", { exact: true })).toHaveValue("")
  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("a link, the category or unlimited count as changes to a new wish", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  await createCategory(wishlist, "Kleding", 0)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  const confirm = unsavedChanges(page)

  async function expectToAsk(change: () => Promise<void>) {
    await page.getByRole("button", { name: "Voeg een wens toe" }).click()
    await change()
    await page.keyboard.press("Escape")
    await confirm.getByRole("button", { name: "Niet opslaan" }).click()
    await expect(dialog).toBeHidden()
  }

  await expectToAsk(() => linkField(dialog, 1).fill("https://example.com"))
  await expectToAsk(() =>
    dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  )
  await expectToAsk(async () => {
    await dialog.getByLabel("Categorie").click()
    await page.getByRole("option", { name: "Kleding" }).click()
    await expect(page.getByRole("listbox")).toHaveCount(0)
  })
})

test("closing a new wish without changes doesn't ask", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Lego")
  await dialog.getByLabel("Wens", { exact: true }).clear()
  await page.keyboard.press("Escape")

  await expect(dialog).toBeHidden()
  await expect(unsavedChanges(page)).toHaveCount(0)
})

test("saving a new wish doesn't ask", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Lego")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()
  await expect(unsavedChanges(page)).toHaveCount(0)
  await expect(itemCard(page, "Lego")).toBeVisible()
})

test("closing an edited wish asks first", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  await createCategory(wishlist, "Boeken", 1)
  const item = await createItem(wishlist, {
    title: "Trui",
    links: ["https://example.com/trui"],
    category: clothes,
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: /^Kleding \d+$/ }).click()
  await page.getByRole("button", { name: "Wijzig", exact: true }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  const confirm = unsavedChanges(page)
  await dialog.getByLabel("Categorie").click()
  await page.getByRole("option", { name: "Boeken" }).click()
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  await page.keyboard.press("Escape")

  await confirm.getByRole("button", { name: "Verder bewerken" }).click()
  await expect(confirm).toBeHidden()
  await expect(dialog.getByLabel("Categorie")).toHaveText("Boeken")
  await expect(
    dialog.getByLabel("Deze wens mag onbeperkt vervuld worden")
  ).toBeChecked()

  await page.keyboard.press("Escape")
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole("button", { name: "Wijzig", exact: true }).click()
  await expect(dialog.getByLabel("Categorie")).toHaveText("Kleding")
  expect(
    await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } })
  ).toMatchObject({ categoryId: clothes.id, unlimited: false })
})

test("closing an edited wish without changes doesn't ask", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  await createItem(wishlist, {
    title: "Fiets",
    links: ["https://example.com/fiets"],
  })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await itemCard(page, "Fiets").getByRole("button", { name: "Wijzig" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await dialog.getByLabel("Wens", { exact: true }).fill("Fietsje")
  await dialog.getByLabel("Wens", { exact: true }).fill("Fiets")
  await dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  await dialog.getByLabel("Deze wens mag onbeperkt vervuld worden").click()
  await dialog.getByRole("button", { name: "Close" }).click()

  await expect(dialog).toBeHidden()
  await expect(unsavedChanges(page)).toHaveCount(0)

  await itemCard(page, "Fiets").getByRole("button", { name: "Wijzig" }).click()
  await dialog.getByLabel("Wens", { exact: true }).fill("Elektrische fiets")
  await dialog.getByRole("button", { name: "Opslaan" }).click()
  await expect(dialog).toBeHidden()
  await expect(unsavedChanges(page)).toHaveCount(0)
  await expect(itemCard(page, "Elektrische fiets")).toBeVisible()
})
