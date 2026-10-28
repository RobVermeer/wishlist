import {
  test,
  expect,
  createAdmin,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  createDraw,
  prisma,
} from "./fixtures"
import { Page } from "@playwright/test"

// The overview counts everything in the database, so this file runs in its
// own project after all other tests, when nothing else changes the counts.

const tiles = {
  Gebruikers: ["Totaal", "Actief in het afgelopen jaar"],
  Verlanglijstjes: ["Actief", "Verwijderd", "Voor iemand anders"],
  Groepen: ["Actief", "Verwijderd"],
  Wensen: ["Op actieve verlanglijstjes", "Afgestreept", "Verwijderd"],
  Lootjes: ["Trekkingen", "Deelnemers", "Nog niet aangemeld"],
} as const

async function readFigures(page: Page) {
  await page.goto("/admin")
  const figures: Record<string, number> = {}
  for (const [tile, labels] of Object.entries(tiles)) {
    const region = page.getByRole("region", { name: tile })
    for (const label of labels) {
      const value = await region
        .locator("dl > div")
        .filter({ has: page.getByText(label, { exact: true }) })
        .getByRole("definition")
        .textContent()
      figures[`${tile} ${label}`] = Number(value!.replace(/\D/g, ""))
    }
  }
  return figures
}

test("the admin overview counts what is active and what is removed", async ({
  signIn,
}) => {
  const admin = await createAdmin()
  const page = await signIn(admin)
  const before = await readFigures(page)

  const active = await createUser()
  const inactive = await createUser()
  await prisma.user.update({
    where: { id: active.id },
    data: { lastSeenAt: new Date(Date.now() - 30 * 86_400_000) },
  })
  await prisma.user.update({
    where: { id: inactive.id },
    data: { lastSeenAt: new Date(Date.now() - 400 * 86_400_000) },
  })

  const group = await createGroup(active, { members: [inactive] })
  await createGroup(active, { removed: true })

  const own = await createWishlist(active, { groups: [group] })
  await createWishlist(active, { title: "Baby Bo" })
  const removedList = await createWishlist(inactive)
  await prisma.wishlist.update({
    where: { id: removedList.id },
    data: { removed: true },
  })

  await createItem(own, { title: "Sokken" })
  await createItem(own, { title: "Boek", boughtBy: inactive })
  const removedItem = await createItem(own, { title: "Weg" })
  await prisma.wishlistItem.update({
    where: { id: removedItem.id },
    data: { removed: true },
  })
  await createItem(removedList, { title: "Op een verwijderd lijstje" })

  await createDraw(group, [
    active,
    inactive,
    { name: "Opa", email: "opa@voorbeeld.nl" },
  ])
  await createDraw(group, [active, inactive], { cancelled: true })

  const after = await readFigures(page)
  const difference = Object.fromEntries(
    Object.keys(after).map(key => [key, after[key] - before[key]])
  )

  expect(difference).toEqual({
    "Gebruikers Totaal": 2,
    "Gebruikers Actief in het afgelopen jaar": 1,
    "Verlanglijstjes Actief": 2,
    "Verlanglijstjes Verwijderd": 1,
    "Verlanglijstjes Voor iemand anders": 1,
    "Groepen Actief": 1,
    "Groepen Verwijderd": 1,
    "Wensen Op actieve verlanglijstjes": 2,
    "Wensen Afgestreept": 1,
    "Wensen Verwijderd": 2,
    "Lootjes Trekkingen": 1,
    "Lootjes Deelnemers": 3,
    "Lootjes Nog niet aangemeld": 1,
  })
})

test("the admin overview shows the average group size", async ({ signIn }) => {
  const admin = await createAdmin()
  const page = await signIn(admin)

  await page.goto("/admin")

  await expect(
    page
      .getByRole("region", { name: "Groepen" })
      .locator("dl > div")
      .filter({
        has: page.getByText("Gemiddeld aantal leden", { exact: true }),
      })
      .getByRole("definition")
  ).toHaveText(/^\d+(,\d)?$/)
})
