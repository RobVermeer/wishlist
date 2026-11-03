import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createCategory,
  createItem,
  prisma,
  toasts,
} from "./fixtures"
import { Locator, Page } from "@playwright/test"

const categoryToggle = (page: Page, title: string) =>
  page.getByRole("button", { name: new RegExp(`^${title} \\d+$`) })

const openCategory = async (page: Page, title: string) => {
  await categoryToggle(page, title).click()
  await expect(categoryToggle(page, title)).toHaveAttribute(
    "aria-expanded",
    "true"
  )
}

const chooseCategory = async (page: Page, dialog: Locator, name: string) => {
  await dialog.getByLabel("Categorie").click()
  await page.getByPlaceholder("Zoek of typ een nieuwe categorie").fill(name)
  await page
    .getByRole("option", {
      name: new RegExp(`^(Nieuwe categorie: )?${name}$`, "i"),
    })
    .click()
}

const itemOrder = async (page: Page, titles: string[]) => {
  const text = await page.locator("main").innerText()

  return [...titles].sort((a, b) => text.indexOf(a) - text.indexOf(b))
}

const categoriesOf = (wishlistId: string) =>
  prisma.wishlistCategory.findMany({
    where: { wishlistId },
    orderBy: { position: "asc" },
  })

test("wishes without a category are listed above the categories", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const books = await createCategory(wishlist, "Boeken", 0)
  const clothes = await createCategory(wishlist, "Kleding", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Roman", category: books })
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  await openCategory(page, "Boeken")
  await openCategory(page, "Kleding")
  expect(
    await itemOrder(page, ["Trui", "Roman", "Fiets", "Boeken", "Kleding"])
  ).toEqual(["Fiets", "Boeken", "Roman", "Kleding", "Trui"])
})

test("add a wish in a new category", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page
    .getByRole("button", { name: "Voeg een wens toe", exact: true })
    .click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Trui")
  await chooseCategory(page, dialog, "Kleding")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Kleding")).toHaveText(/Kleding\s*1/)
  await expect(categoryToggle(page, "Kleding")).toHaveAttribute(
    "aria-expanded",
    "true"
  )
  await expect(page.getByText("Trui")).toBeVisible()

  const [category] = await categoriesOf(wishlist.id)
  expect(category).toMatchObject({ title: "Kleding", position: 0 })
  const item = await prisma.wishlistItem.findFirstOrThrow({
    where: { wishlistId: wishlist.id },
  })
  expect(item.categoryId).toBe(category.id)
})

test("existing categories can be picked when adding a wish", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const books = await createCategory(wishlist, "Boeken", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Roman", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page
    .getByRole("button", { name: "Voeg een wens toe", exact: true })
    .click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await expect(dialog.getByLabel("Categorie")).toHaveText("Kies een categorie")
  await dialog.getByLabel("Categorie").click()
  await expect(page.getByRole("option")).toHaveText(["Kleding", "Boeken"])
  await page.keyboard.press("Escape")
  await expect(page.getByRole("option")).toHaveCount(0)
  await expect(dialog).toBeVisible()

  await dialog.getByLabel("Wens", { exact: true }).fill("Sokken")
  await chooseCategory(page, dialog, "kleding")
  await expect(dialog.getByLabel("Categorie")).toHaveText("Kleding")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Kleding")).toHaveText(/Kleding\s*2/)
  await expect(page.getByRole("button", { name: /^kleding/ })).toHaveCount(0)

  const categories = await categoriesOf(wishlist.id)
  expect(categories.map(({ title }) => title)).toEqual(["Kleding", "Boeken"])
})

test("move a wish between categories", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const item = await createItem(wishlist, { title: "Trui", category: clothes })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await openCategory(page, "Kleding")
  await page.getByRole("button", { name: "Wijzig wens Trui" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await expect(dialog.getByLabel("Categorie")).toHaveText("Kleding")
  await chooseCategory(page, dialog, "Winter")
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Winter")).toHaveAttribute(
    "aria-expanded",
    "true"
  )
  await expect(page.getByText("Trui")).toBeVisible()
  await expect(categoryToggle(page, "Kleding")).toHaveCount(0)

  const categories = await categoriesOf(wishlist.id)
  expect(categories.map(({ title }) => title)).toEqual(["Winter"])

  await page.getByRole("button", { name: "Wijzig wens Trui" }).click()
  await dialog.getByLabel("Categorie").click()
  await page.getByRole("option", { name: "Geen categorie" }).click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Winter")).toHaveCount(0)
  await expect(page.getByText("Trui")).toBeVisible()

  expect(await categoriesOf(wishlist.id)).toEqual([])
  expect(
    (await prisma.wishlistItem.findUniqueOrThrow({ where: { id: item.id } }))
      .categoryId
  ).toBeNull()
})

test("a wish moved to another category goes to the end of it", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const winter = await createCategory(wishlist, "Winter", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Muts", category: winter })
  await createItem(wishlist, { title: "Sjaal", category: winter })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await openCategory(page, "Kleding")
  await openCategory(page, "Winter")
  await page
    .locator("div.rounded-2xl")
    .filter({ hasText: "Trui" })
    .getByRole("button", { name: "Wijzig wens Trui" })
    .click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await chooseCategory(page, dialog, "Winter")
  await dialog.getByRole("button", { name: "Opslaan" }).click()
  await expect(dialog).toBeHidden()

  await expect(page.locator("main div.rounded-2xl")).toHaveText([
    /Muts/,
    /Sjaal/,
    /Trui/,
  ])
})

test("removing the last wish of a category removes the category", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  await createItem(wishlist, { title: "Trui", category: clothes })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await openCategory(page, "Kleding")
  await page.getByRole("button", { name: "Wijzig wens Trui" }).click()
  await page
    .getByRole("dialog", { name: "Wijzig wens" })
    .getByRole("button", { name: "Verwijder" })
    .click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Verwijder" })
    .click()

  await expect(categoryToggle(page, "Kleding")).toHaveCount(0)
  await expect(page.getByText("Je verlanglijstje is nog leeg")).toBeVisible()
  expect(await categoriesOf(wishlist.id)).toEqual([])
})

test("add a wish straight to a category", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const books = await createCategory(wishlist, "Boeken", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Roman", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page
    .getByRole("button", { name: "Voeg een wens toe aan Boeken" })
    .click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await expect(dialog.getByLabel("Categorie")).toHaveText("Boeken")
  await dialog.getByLabel("Wens", { exact: true }).fill("Strip")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Boeken")).toHaveText(/Boeken\s*2/)
  await expect(categoryToggle(page, "Boeken")).toHaveAttribute(
    "aria-expanded",
    "true"
  )
  await expect(page.getByText("Strip")).toBeVisible()
  await expect(categoryToggle(page, "Kleding")).toHaveText(/Kleding\s*1/)

  const item = await prisma.wishlistItem.findFirstOrThrow({
    where: { wishlistId: wishlist.id, title: "Strip" },
  })
  expect(item.categoryId).toBe(books.id)

  await page
    .getByRole("button", { name: "Voeg een wens toe", exact: true })
    .click()
  await expect(dialog.getByLabel("Categorie")).toHaveText("Kies een categorie")
})

test("rename a category", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Muts", category: clothes })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig categorie Kleding" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig categorie" })
  await expect(dialog.getByLabel("Naam van de categorie")).toHaveValue(
    "Kleding"
  )
  await dialog.getByLabel("Naam van de categorie").fill("Winterkleding")
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Winterkleding")).toHaveText(
    /Winterkleding\s*2/
  )
  await expect(categoryToggle(page, "Kleding")).toHaveCount(0)
  expect(await categoriesOf(wishlist.id)).toMatchObject([
    { id: clothes.id, title: "Winterkleding" },
  ])
})

test("a category can't get the name of another one", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const winter = await createCategory(wishlist, "Winter", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Muts", category: winter })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig categorie Kleding" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig categorie" })
  await dialog.getByLabel("Naam van de categorie").fill("winter")
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(toasts(page)).toContainText("Er is al een categorie die zo heet")
  await expect(dialog.getByLabel("Naam van de categorie")).toHaveValue("winter")

  await dialog.getByLabel("Naam van de categorie").fill("")
  await dialog.getByRole("button", { name: "Opslaan" }).click()
  await expect(dialog).toBeVisible()

  await dialog.getByLabel("Naam van de categorie").fill("K".repeat(41))
  await dialog.getByRole("button", { name: "Opslaan" }).click()
  await expect(toasts(page)).toContainText(
    "De naam van de categorie mag maximaal uit 40 tekens bestaan."
  )

  expect((await categoriesOf(wishlist.id)).map(({ title }) => title)).toEqual([
    "Kleding",
    "Winter",
  ])
})

test("removing a category keeps its wishes", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const books = await createCategory(wishlist, "Boeken", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Fiets" })
  await createItem(wishlist, { title: "Muts", category: clothes })
  await createItem(wishlist, { title: "Roman", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig categorie Kleding" }).click()
  await page
    .getByRole("dialog", { name: "Wijzig categorie" })
    .getByRole("button", { name: "Verwijder" })
    .click()

  const confirm = page.getByRole("alertdialog")
  await expect(confirm).toContainText(
    "De categorie verdwijnt. De wensen erin blijven op je verlanglijstje staan, zonder categorie."
  )
  await confirm.getByRole("button", { name: "Verwijder" }).click()

  await expect(categoryToggle(page, "Kleding")).toHaveCount(0)
  await expect(categoryToggle(page, "Boeken")).toBeVisible()
  expect(await itemOrder(page, ["Trui", "Fiets", "Muts", "Boeken"])).toEqual([
    "Fiets",
    "Trui",
    "Muts",
    "Boeken",
  ])
  await expect(page.getByText("Trui")).toBeVisible()
  await expect(page.getByText("Muts")).toBeVisible()

  expect((await categoriesOf(wishlist.id)).map(({ title }) => title)).toEqual([
    "Boeken",
  ])
  const items = await prisma.wishlistItem.findMany({
    where: { wishlistId: wishlist.id, title: { in: ["Trui", "Muts"] } },
  })
  expect(items).toHaveLength(2)
  expect(items.map(({ categoryId, removed }) => [categoryId, removed])).toEqual(
    [
      [null, false],
      [null, false],
    ]
  )
})

test("category names can be at most 40 characters", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page
    .getByRole("button", { name: "Voeg een wens toe", exact: true })
    .click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Trui")
  await chooseCategory(page, dialog, "K".repeat(41))
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText(
    "De naam van de categorie mag maximaal uit 40 tekens bestaan."
  )
  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("categories are closed until opened and stay open after a reload", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const books = await createCategory(wishlist, "Boeken", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Roman", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  const clothesToggle = categoryToggle(page, "Kleding")
  await expect(clothesToggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByText("Trui")).toBeHidden()
  await expect(page.getByText("Roman")).toBeHidden()

  await clothesToggle.click()

  await expect(clothesToggle).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("Trui")).toBeVisible()
  await expect(page.getByText("Roman")).toBeHidden()

  await page.reload()

  await expect(clothesToggle).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("Trui")).toBeVisible()
  await expect(page.getByText("Roman")).toBeHidden()

  await clothesToggle.click()

  await expect(page.getByText("Trui")).toBeHidden()
  await page.reload()
  await expect(clothesToggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByText("Trui")).toBeHidden()
})

test("opened categories are open before the page has loaded", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  const books = await createCategory(wishlist, "Boeken", 1)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Roman", category: books })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await categoryToggle(page, "Kleding").click()
  await expect(page.getByText("Trui")).toBeVisible()

  await page.route("**/_next/static/**/*.js", route => route.abort())
  await page.reload()

  await expect(page.getByText("Trui")).toBeVisible()
  await expect(page.getByText("Roman")).toBeHidden()
})

test("owner can reorder categories with the keyboard", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const books = await createCategory(wishlist, "Boeken", 0)
  const clothes = await createCategory(wishlist, "Kleding", 1)
  const games = await createCategory(wishlist, "Spellen", 2)
  await createItem(wishlist, { title: "Roman", category: books })
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Schaakbord", category: games })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  await page.getByRole("button", { name: "Volgorde aanpassen" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("button", { name: "Klaar" })).toBeFocused()
  await expect(
    page.getByText("Sleep de wensen en categorieën naar de goede plek.")
  ).toBeVisible()
  await page.keyboard.press("Tab")
  const handle = page.getByRole("button", {
    name: "Verplaats categorie Boeken",
  })
  await expect(handle).toBeFocused()
  const announcement = page
    .locator('[role="status"][id^="DndLiveRegion"]')
    .filter({ hasText: /./ })

  await handle.focus()
  await page.keyboard.press("Space")
  await expect(announcement).toHaveText(
    "Categorie Boeken opgepakt, positie 1 van 3."
  )
  await expect(async () => {
    await page.keyboard.press("ArrowDown")
    await expect(announcement).toHaveText(
      "Categorie Boeken verplaatst naar positie 2 van 3.",
      { timeout: 500 }
    )
  }).toPass()
  await page.keyboard.press("ArrowDown")
  await expect(announcement).toHaveText(
    "Categorie Boeken verplaatst naar positie 3 van 3."
  )
  await page.keyboard.press("Space")
  await expect(announcement).toHaveText(
    "Categorie Boeken neergezet op positie 3 van 3."
  )

  await expect
    .poll(async () =>
      (await categoriesOf(wishlist.id)).map(({ title }) => title)
    )
    .toEqual(["Kleding", "Spellen", "Boeken"])

  await page.reload()
  expect(await itemOrder(page, ["Boeken", "Kleding", "Spellen"])).toEqual([
    "Kleding",
    "Spellen",
    "Boeken",
  ])
})

test("owner can reorder categories by dragging", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const books = await createCategory(wishlist, "Boeken", 0)
  const clothes = await createCategory(wishlist, "Kleding", 1)
  await createItem(wishlist, { title: "Roman", category: books })
  await createItem(wishlist, { title: "Trui", category: clothes })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)

  await page.getByRole("button", { name: "Volgorde aanpassen" }).click()
  const handle = page.getByRole("button", {
    name: "Verplaats categorie Kleding",
  })
  const target = categoryToggle(page, "Boeken")
  const from = (await handle.boundingBox())!
  const to = (await target.boundingBox())!

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2, to.y, { steps: 10 })
  await page.mouse.move(from.x + from.width / 2, to.y - 10, { steps: 5 })
  await page.mouse.up()

  await expect
    .poll(async () =>
      (await categoriesOf(wishlist.id)).map(({ title }) => title)
    )
    .toEqual(["Kleding", "Boeken"])
})

test("group members see categories but cannot reorder them", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const shopper = await createUser()
  const group = await createGroup(owner, { members: [shopper] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  const clothes = await createCategory(wishlist, "Kleding", 0)
  await createItem(wishlist, { title: "Trui", category: clothes })
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(shopper)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await openCategory(page, "Kleding")
  await expect(
    page.getByRole("button", { name: /Verplaats categorie/ })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: /Wijzig categorie/ })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: /Voeg een wens toe aan/ })
  ).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Volgorde aanpassen" })
  ).toHaveCount(0)
  expect(await itemOrder(page, ["Trui", "Fiets"])).toEqual(["Fiets", "Trui"])

  const card = page.locator("div.rounded-2xl").filter({ hasText: "Trui" })
  await card.getByRole("button", { name: "Ik koop dit" }).click()
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect(card).toContainText("Jij koopt dit")

  await categoryToggle(page, "Kleding").click()
  await expect(page.getByText("Trui")).toBeHidden()
})

test("closing a renamed category asks first", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  await createItem(wishlist, { title: "Trui", category: clothes })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig categorie Kleding" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig categorie" })
  const field = dialog.getByLabel("Naam van de categorie")
  const confirm = page.getByRole("alertdialog", {
    name: "Wijzigingen niet opslaan?",
  })
  await field.fill("Kleren")
  await field.fill("Kleding")
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(confirm).toHaveCount(0)

  await page.getByRole("button", { name: "Wijzig categorie Kleding" }).click()
  await field.fill("Winterkleding")
  await page.keyboard.press("Escape")
  await confirm.getByRole("button", { name: "Verder bewerken" }).click()
  await expect(confirm).toBeHidden()
  await expect(field).toHaveValue("Winterkleding")

  await page.keyboard.press("Escape")
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()
  await expect(dialog).toBeHidden()
  expect(await categoriesOf(wishlist.id)).toMatchObject([
    { id: clothes.id, title: "Kleding" },
  ])
})
