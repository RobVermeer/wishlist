import { Page } from "@playwright/test"
import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
} from "./fixtures"

const breadcrumb = (page: Page) =>
  page.getByRole("navigation", { name: "Kruimelpad" })

const expectBreadcrumb = async (page: Page, items: string[]) => {
  const nav = breadcrumb(page)
  const links = items.slice(0, -1)
  const current = items[items.length - 1]

  await expect(nav.getByRole("listitem")).toHaveText(items)
  await expect(nav.getByRole("link")).toHaveText(links)
  await expect(nav.locator('[aria-current="page"]')).toHaveText(current)
}

test("a group page shows where you are", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { title: "Familie" })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}`)

  await expectBreadcrumb(page, ["Home", "Familie"])
  await expect(
    breadcrumb(page).getByRole("link", { name: "Home" })
  ).toHaveAttribute("href", "/")
  await expect(page.getByRole("heading", { name: "Familie" })).toBeVisible()
})

test("a verlanglijstje in a group links back to the group", async ({
  signIn,
}) => {
  const user = await createUser()
  const sanne = await createUser({ firstName: "Sanne" })
  const group = await createGroup(user, { title: "Familie", members: [sanne] })
  const wishlist = await createWishlist(sanne, { groups: [group] })
  const page = await signIn(user)

  await page.goto(`/group/${group.id}/${wishlist.id}`)

  await expectBreadcrumb(page, ["Home", "Familie", "Verlanglijstje van Sanne"])
  await expect(
    page.getByRole("heading", { name: "Sanne", exact: true })
  ).toBeVisible()
  await expect(page.getByRole("link", { name: "Familie" })).toHaveCount(1)

  await breadcrumb(page).getByRole("link", { name: "Familie" }).click()
  await expect(page).toHaveURL(`/group/${group.id}`)
  await expectBreadcrumb(page, ["Home", "Familie"])

  await breadcrumb(page).getByRole("link", { name: "Home" }).click()
  await expect(page).toHaveURL("/")
  await expect(breadcrumb(page)).toHaveCount(0)
})

test("your own verlanglijstje is named like everywhere else", async ({
  signIn,
}) => {
  const user = await createUser()
  const own = await createWishlist(user)
  const forGrandpa = await createWishlist(user, { title: "Opa" })
  const page = await signIn(user)

  await page.goto(`/wishlist/${own.id}`)
  await expectBreadcrumb(page, ["Home", "Mijn lijstje"])

  await page.goto(`/wishlist/${forGrandpa.id}`)
  await expectBreadcrumb(page, ["Home", "Verlanglijstje van Opa"])
})

test("profile pages show the way back", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile/bought")
  await expectBreadcrumb(page, ["Home", "Profiel", "Gekochte cadeaus"])

  await breadcrumb(page).getByRole("link", { name: "Profiel" }).click()
  await expect(page).toHaveURL("/profile")
  await expectBreadcrumb(page, ["Home", "Profiel"])
})

test("pages at the top have no breadcrumb", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  for (const path of ["/", "/vragen", "/privacy"]) {
    await page.goto(path)
    await expect(page.locator("main")).toBeVisible()
    await expect(breadcrumb(page)).toHaveCount(0)
  }
})
