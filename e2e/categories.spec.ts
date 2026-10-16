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

  await expect(categoryToggle(page, "Boeken")).toBeVisible()
  await expect(categoryToggle(page, "Kleding")).toBeVisible()
  expect(
    await itemOrder(page, ["Trui", "Roman", "Fiets", "Boeken", "Kleding"])
  ).toEqual(["Fiets", "Boeken", "Roman", "Kleding", "Trui"])
})

test("add a wish in a new category", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Trui")
  await chooseCategory(page, dialog, "Kleding")
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Kleding")).toHaveText(/Kleding\s*1/)

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
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

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
  await page.getByRole("button", { name: "Wijzig" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })
  await expect(dialog.getByLabel("Categorie")).toHaveText("Kleding")
  await chooseCategory(page, dialog, "Winter")
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(categoryToggle(page, "Winter")).toBeVisible()
  await expect(categoryToggle(page, "Kleding")).toHaveCount(0)

  const categories = await categoriesOf(wishlist.id)
  expect(categories.map(({ title }) => title)).toEqual(["Winter"])

  await page.getByRole("button", { name: "Wijzig" }).click()
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

test("removing the last wish of a category removes the category", async ({
  signIn,
}) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const clothes = await createCategory(wishlist, "Kleding", 0)
  await createItem(wishlist, { title: "Trui", category: clothes })
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig" }).click()
  await page
    .getByRole("dialog", { name: "Wijzig wens" })
    .getByRole("button", { name: "Verwijder" })
    .click()
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Verwijder" })
    .click()

  await expect(categoryToggle(page, "Kleding")).toHaveCount(0)
  await expect(
    page.getByText("Dit lijstje is nog helemaal leeg 🫣")
  ).toBeVisible()
  expect(await categoriesOf(wishlist.id)).toEqual([])
})

test("category names can be at most 40 characters", async ({ signIn }) => {
  const user = await createUser()
  const wishlist = await createWishlist(user)
  const page = await signIn(user)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Voeg een wens toe" }).click()

  const dialog = page.getByRole("dialog", { name: /Voeg wens toe/ })
  await dialog.getByLabel("Wens", { exact: true }).fill("Trui")
  await chooseCategory(page, dialog, "K".repeat(41))
  await dialog.getByRole("button", { name: "Voeg wens toe" }).click()

  await expect(toasts(page)).toContainText(
    "Categorie mag maximaal uit 40 tekens bestaan"
  )
  expect(
    await prisma.wishlistItem.count({ where: { wishlistId: wishlist.id } })
  ).toBe(0)
})

test("categories can be closed and stay closed after a reload", async ({
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
  await expect(clothesToggle).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("Trui")).toBeVisible()

  await clothesToggle.click()

  await expect(clothesToggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByText("Trui")).toBeHidden()
  await expect(page.getByText("Roman")).toBeVisible()

  await page.reload()

  await expect(clothesToggle).toHaveAttribute("aria-expanded", "false")
  await expect(page.getByText("Trui")).toBeHidden()

  await clothesToggle.click()

  await expect(page.getByText("Trui")).toBeVisible()
  await page.reload()
  await expect(page.getByText("Trui")).toBeVisible()
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

  const handle = page.getByRole("button", {
    name: "Verplaats categorie Boeken",
  })
  const announcement = page.locator('[role="status"][id^="DndLiveRegion"]')

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

  await expect(categoryToggle(page, "Kleding")).toBeVisible()
  await expect(
    page.getByRole("button", { name: /Verplaats categorie/ })
  ).toHaveCount(0)
  expect(await itemOrder(page, ["Trui", "Fiets"])).toEqual(["Fiets", "Trui"])

  const card = page.locator("div.rounded-md").filter({ hasText: "Trui" })
  await card.getByRole("button", { name: "Ik koop dit" }).click()
  await expect(toasts(page)).toContainText("Leuk, jij koopt dit! 🎁")
  await expect(card).toContainText("Jij koopt dit")

  await categoryToggle(page, "Kleding").click()
  await expect(page.getByText("Trui")).toBeHidden()
})
