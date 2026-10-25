import { Locator, Page } from "@playwright/test"
import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createItem,
  prisma,
  toasts,
} from "./fixtures"

const notFound = "Oeps, we konden deze pagina niet vinden! 🤯"
const managersLabel = "Wie beheert dit verlanglijstje nog meer?"

const chosenManagers = (dialog: Locator) =>
  dialog.getByRole("group", { name: managersLabel }).getByRole("listitem")

async function chooseManager(page: Page, dialog: Locator, name: string) {
  await dialog.getByRole("button", { name: "Kies iemand" }).click()
  await page.getByRole("option", { name }).click()
}

const ownWishlists = (page: Page) =>
  page.locator("div.grid").filter({
    has: page.getByRole("button", { name: "Nieuw verlanglijstje" }),
  })

const following = (page: Page) =>
  page.locator("div.grid").filter({
    has: page.getByRole("button", { name: "Nieuwe groep" }),
  })

const findWishlist = (wishlist: { id: string }) =>
  prisma.wishlist.findUniqueOrThrow({
    where: { id: wishlist.id },
    include: { groups: true, managers: true },
  })

const ids = (records: { id: string }[]) => records.map(({ id }) => id).sort()

const itemCard = (page: Page, title: string) =>
  page.locator("div.rounded-2xl").filter({ hasText: title })

const wishesOf = async (wishlist: { id: string }) =>
  (
    await prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id, removed: false },
      orderBy: { position: "asc" },
    })
  ).map(({ title }) => title)

test("make a wishlist for someone else and manage it together", async ({
  signIn,
}) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const grandma = await createUser({ firstName: "Ria" })
  const formerMember = await createUser({ firstName: "Xander" })
  await createUser({ firstName: "Yara" })
  await createGroup(mother, { title: "Familie", members: [father, grandma] })
  await createGroup(mother, { members: [formerMember], removed: true })
  const page = await signIn(mother)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  const managers = dialog.getByRole("group", { name: managersLabel })
  await expect(managers).toBeHidden()

  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam", { exact: true }).fill("Emma")
  await expect(managers).toContainText(
    "Die kan ook wensen toevoegen en wijzigen."
  )
  await expect(chosenManagers(dialog)).toHaveCount(0)
  await dialog.getByRole("button", { name: "Kies iemand" }).click()
  await expect(page.getByRole("option")).toHaveText(["Ria", "Rob"])
  await page.getByRole("option", { name: "Rob" }).click()
  await expect(chosenManagers(dialog)).toHaveText(["Rob"])
  await dialog.getByRole("button", { name: "Maak aan" }).click()
  await expect(dialog).toBeHidden()

  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: mother.id },
    include: { managers: true },
  })
  expect(wishlist.title).toBe("Emma")
  expect(ids(wishlist.managers)).toEqual([father.id])

  const fatherPage = await signIn(father)
  await fatherPage.goto("/")
  await expect(ownWishlists(fatherPage).getByRole("link")).toHaveText(["Emma"])
  await ownWishlists(fatherPage).getByRole("link", { name: "Emma" }).click()
  await expect(fatherPage).toHaveURL(`/wishlist/${wishlist.id}`)
  await expect(
    fatherPage.getByText("Je beheert dit verlanglijstje samen met Sanne.")
  ).toBeVisible()

  await fatherPage.getByRole("button", { name: "Voeg een wens toe" }).click()
  const newItem = fatherPage.getByRole("dialog", { name: /Voeg wens toe/ })
  await newItem.getByLabel("Wens", { exact: true }).fill("Knuffel")
  await newItem.getByRole("button", { name: "Voeg wens toe" }).click()
  await expect(newItem).toBeHidden()

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(
    page.getByText("Je beheert dit verlanglijstje samen met Rob.")
  ).toBeVisible()
  await expect(page.getByText("Knuffel")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Stop met beheren" })
  ).toHaveCount(0)
})

test("managers change, order, remove and share the wishes", async ({
  signIn,
}) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    managers: [father],
  })
  await createItem(wishlist, { title: "Fiets" })
  await createItem(wishlist, { title: "Puzzel" })
  await createItem(wishlist, { title: "Boek" })
  const page = await signIn(father)

  await page.goto(`/wishlist/${wishlist.id}`)
  const dialog = page.getByRole("dialog", { name: "Wijzig wens" })

  await itemCard(page, "Fiets").getByRole("button", { name: "Wijzig" }).click()
  await dialog.getByLabel("Wens", { exact: true }).fill("Loopfiets")
  await dialog.getByRole("button", { name: "Opslaan" }).click()
  await expect(itemCard(page, "Loopfiets")).toBeVisible()

  await itemCard(page, "Boek").getByRole("button", { name: "Wijzig" }).click()
  await dialog.getByRole("button", { name: "Verwijder" }).click()
  await page
    .getByRole("alertdialog", { name: "Weet je het zeker?" })
    .getByRole("button", { name: "Verwijder" })
    .click()
  await expect(itemCard(page, "Boek")).toBeHidden()

  const announcement = page
    .locator('[role="status"][id^="DndLiveRegion"]')
    .filter({ hasText: /./ })
  await page.getByRole("button", { name: "Verplaats wens Puzzel" }).focus()
  await page.keyboard.press("Space")
  await expect(async () => {
    await page.keyboard.press("ArrowUp")
    await expect(announcement).toHaveText(
      "Wens Puzzel verplaatst naar positie 1 van 2.",
      { timeout: 500 }
    )
  }).toPass()
  await page.keyboard.press("Space")
  await expect.poll(() => wishesOf(wishlist)).toEqual(["Puzzel", "Loopfiets"])

  await page.getByRole("button", { name: "Deel dit verlanglijstje" }).click()
  await expect(page.getByLabel("Link naar je verlanglijstje")).toHaveValue(
    /\/lijstje\/[\w-]{22}$/
  )
})

test("without anyone in your groups the dialog says who you can choose", async ({
  signIn,
}) => {
  const user = await createUser()
  await createGroup(user)
  const page = await signIn(user)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Voor iemand anders").click()

  const managers = dialog.getByRole("group", { name: managersLabel })
  await expect(managers).toContainText(
    "Zit je met iemand in een groep, dan kun je diegene hier kiezen."
  )
  await expect(
    managers.getByRole("button", { name: "Kies iemand" })
  ).toHaveCount(0)
})

test("managers change the wishlist but not who manages it", async ({
  signIn,
}) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const grandpa = await createUser({ firstName: "Jan" })
  const family = await createGroup(mother, {
    title: "Familie",
    members: [father],
  })
  const work = await createGroup(mother, { title: "Werk" })
  const fathersFamily = await createGroup(father, {
    title: "Familie Vermeer",
    members: [grandpa],
  })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    groups: [family, work],
    managers: [father],
  })
  const page = await signIn(father)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  await expect(dialog.getByLabel("Naam", { exact: true })).toHaveValue("Emma")
  await expect(dialog.getByLabel("Voor mezelf")).toHaveCount(0)
  await expect(dialog.getByRole("group", { name: managersLabel })).toHaveCount(
    0
  )
  await expect(dialog.getByRole("button", { name: "Verwijder" })).toHaveCount(0)
  await expect(dialog.getByLabel("Familie", { exact: true })).toBeChecked()
  await expect(dialog.getByLabel("Familie Vermeer")).not.toBeChecked()
  await expect(dialog.getByLabel("Werk")).toHaveCount(0)

  await dialog.getByLabel("Naam", { exact: true }).fill("Emma 🎂")
  await dialog.getByLabel("Beschrijving").fill("Voor haar verjaardag")
  await dialog.getByLabel("Familie Vermeer").click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(page.getByRole("heading", { name: /Emma 🎂/ })).toBeVisible()
  await expect(page.getByText("Voor haar verjaardag")).toBeVisible()

  const updated = await findWishlist(wishlist)
  expect(ids(updated.groups)).toEqual(ids([family, work, fathersFamily]))
  expect(ids(updated.managers)).toEqual([father.id])

  const grandpaPage = await signIn(grandpa)
  await grandpaPage.goto(`/group/${fathersFamily.id}`)
  await expect(
    grandpaPage.getByRole("heading", { name: "Emma 🎂", exact: true })
  ).toBeVisible()
})

test("the owner chooses who manages the wishlist", async ({ signIn }) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const grandma = await createUser({ firstName: "Ria" })
  const aunt = await createUser({ firstName: "Tess" })
  const family = await createGroup(mother, {
    title: "Familie",
    members: [grandma, aunt],
  })
  const fathersFamily = await createGroup(father, { title: "Familie Vermeer" })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    groups: [family, fathersFamily],
    managers: [father, aunt],
  })
  const page = await signIn(mother)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(
    page.getByText("Je beheert dit verlanglijstje samen met Rob en Tess.")
  ).toBeVisible()
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  const managers = dialog.getByRole("group", { name: managersLabel })
  await expect(chosenManagers(dialog)).toHaveText(["Rob", "Tess"])

  await managers.getByRole("button", { name: "Haal Tess weg" }).click()
  await chooseManager(page, dialog, "Ria")
  await expect(chosenManagers(dialog)).toHaveText(["Ria", "Rob"])
  await dialog.getByLabel("Familie", { exact: true }).click()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(
    page.getByText("Je beheert dit verlanglijstje samen met Ria en Rob.")
  ).toBeVisible()

  const updated = await findWishlist(wishlist)
  expect(ids(updated.managers)).toEqual(ids([father, grandma]))
  expect(ids(updated.groups)).toEqual([fathersFamily.id])

  const auntPage = await signIn(aunt)
  await auntPage.goto(`/wishlist/${wishlist.id}`)
  await expect(auntPage.getByText(notFound)).toBeVisible()
})

test("a manager can stop managing a wishlist", async ({ signIn }) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    managers: [father],
  })
  const page = await signIn(father)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Stop met beheren" }).click()

  await expect(toasts(page)).toContainText(
    "Je beheert dit verlanglijstje niet meer"
  )
  await expect(page).toHaveURL("/")
  await expect(page.getByRole("link", { name: "Emma" })).toHaveCount(0)
  expect((await findWishlist(wishlist)).managers).toEqual([])

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page.getByText(notFound)).toBeVisible()
})

test("turning the wishlist into your own stops managing it together", async ({
  signIn,
}) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    managers: [father],
  })
  const page = await signIn(mother)

  await page.goto(`/wishlist/${wishlist.id}`)
  await page.getByRole("button", { name: "Wijzig verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: "Wijzig verlanglijstje" })
  const warning = dialog.getByText(
    "Dan beheer je dit verlanglijstje niet meer samen."
  )
  await expect(warning).toBeHidden()
  await dialog.getByLabel("Voor mezelf").click()
  await expect(warning).toBeVisible()
  await dialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole("heading", { name: "Mijn lijstje" })
  ).toBeVisible()

  const updated = await findWishlist(wishlist)
  expect(updated.title).toBeNull()
  expect(updated.managers).toEqual([])

  const fatherPage = await signIn(father)
  await fatherPage.goto(`/wishlist/${wishlist.id}`)
  await expect(fatherPage.getByText(notFound)).toBeVisible()
})

test("managers don't see what is bought", async ({ signIn }) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const grandma = await createUser()
  const family = await createGroup(mother, { members: [father, grandma] })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    groups: [family],
    managers: [father],
  })
  await createItem(wishlist, { title: "Fiets", boughtBy: grandma })
  await createItem(wishlist, { title: "Puzzel" })
  const page = await signIn(father)

  await page.goto(`/group/${family.id}/${wishlist.id}`)

  await expect(
    page.getByText(
      "Je ziet niet wat anderen van dit verlanglijstje kopen, zo blijft het een verrassing 🎁"
    )
  ).toBeVisible()
  await expect(page.getByText("Fiets")).toBeVisible()
  await expect(page.getByText("Wordt al gekocht")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Ik koop dit" })).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Vraag om meer wensen" })
  ).toHaveCount(0)
})

test("a wishlist you follow and manage shows up once", async ({ signIn }) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  await createWishlist(mother, {
    title: "Emma",
    followers: [father],
    managers: [father],
  })
  const page = await signIn(father)

  await page.goto("/")
  await expect(page.getByRole("link", { name: "Emma" })).toHaveCount(1)
  await ownWishlists(page).getByRole("link", { name: "Emma" }).click()

  await expect(
    page.getByRole("button", { name: "Stop met volgen" })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Stop met beheren" }).click()

  await expect(page).toHaveURL("/")
  await expect(
    following(page).getByRole("link", { name: "Emma" })
  ).toBeVisible()
  await expect(
    ownWishlists(page).getByRole("link", { name: "Emma" })
  ).toHaveCount(0)
})

test("managers add the wishlist to their own groups", async ({ signIn }) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const grandpa = await createUser({ firstName: "Jan" })
  const fathersFamily = await createGroup(father, {
    title: "Familie Vermeer",
    members: [grandpa],
  })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    managers: [father],
  })
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(father)

  await page.goto(`/group/${fathersFamily.id}`)
  await page.getByRole("button", { name: "Verlanglijstje toevoegen" }).click()

  const dialog = page.getByRole("dialog", { name: "Verlanglijstje toevoegen" })
  await dialog
    .getByRole("group", { name: "Voor iemand anders" })
    .getByLabel("Emma")
    .click()
  await dialog.getByRole("button", { name: "Voeg toe" }).click()

  await expect(toasts(page)).toContainText(
    "Het verlanglijstje staat nu in de groep"
  )
  await expect(page.getByRole("link", { name: "Emma" })).toHaveAttribute(
    "href",
    `/group/${fathersFamily.id}/${wishlist.id}`
  )

  const grandpaPage = await signIn(grandpa)
  await grandpaPage.goto(`/group/${fathersFamily.id}`)
  await grandpaPage
    .locator("div.rounded-2xl")
    .filter({ hasText: "Fiets" })
    .getByRole("button", { name: "Ik koop dit" })
    .click()
  await expect(toasts(grandpaPage)).toContainText("Leuk, jij koopt dit! 🎁")
})

test("a wishlist stays in a group while one of its managers is in it", async ({
  signIn,
}) => {
  const mother = await createUser({ firstName: "Sanne" })
  const father = await createUser({ firstName: "Rob" })
  const grandma = await createUser({ firstName: "Ria" })
  const family = await createGroup(grandma, { members: [mother, father] })
  const wishlist = await createWishlist(mother, {
    title: "Emma",
    groups: [family],
    managers: [father],
  })
  const grandmaPage = await signIn(grandma)

  for (const user of [mother, father]) {
    const page = await signIn(user)
    await page.goto(`/group/${family.id}`)
    await page.getByRole("button", { name: "Verlaat" }).click()
    await page
      .getByRole("dialog", { name: "Verlaat groep 🥺" })
      .getByRole("button", { name: "Stap uit de groep" })
      .click()
    await expect(page).toHaveURL("/")

    await grandmaPage.goto(`/group/${family.id}`)

    if (user === mother) {
      await expect(
        grandmaPage.getByRole("heading", { name: "Emma", exact: true })
      ).toBeVisible()
    }
  }

  await expect(
    grandmaPage.getByText("Er zijn nog geen lijstjes! 😵‍💫")
  ).toBeVisible()
  expect((await findWishlist(wishlist)).groups).toEqual([])
})

test("find who manages a wishlist by name on a small phone", async ({
  signIn,
}) => {
  const user = await createUser()
  const family = await Promise.all(
    ["Anna", "Bas", "Cor", "Daan", "Eva", "Fien", "Gijs", "Hugo"].map(
      firstName => createUser({ firstName })
    )
  )
  await createGroup(user, { members: family })
  const page = await signIn(user)
  await page.setViewportSize({ width: 320, height: 640 })

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuw verlanglijstje" }).click()

  const dialog = page.getByRole("dialog", { name: /Nieuw verlanglijstje/ })
  await dialog.getByLabel("Voor iemand anders").click()
  await dialog.getByLabel("Naam", { exact: true }).fill("Baby")
  await dialog.getByRole("button", { name: "Kies iemand" }).click()
  const search = page.getByPlaceholder("Zoek op naam")
  await search.fill("xyz")
  await expect(page.getByText("Niemand gevonden")).toBeVisible()
  await search.fill("hu")
  await expect(page.getByRole("option")).toHaveText(["Hugo"])
  await page.getByRole("option", { name: "Hugo" }).click()
  await expect(chosenManagers(dialog)).toHaveText(["Hugo"])
  await dialog.getByRole("button", { name: "Maak aan" }).click()

  await expect(dialog).toBeHidden()
  const wishlist = await prisma.wishlist.findFirstOrThrow({
    where: { userId: user.id },
    include: { managers: true },
  })
  expect(ids(wishlist.managers)).toEqual([family.at(-1)!.id])
})

test("an empty wishlist you manage asks for the first wish", async ({
  signIn,
}) => {
  const owner = await createUser()
  const manager = await createUser()
  const wishlist = await createWishlist(owner, {
    title: "Emma",
    managers: [manager],
  })
  const page = await signIn(manager)

  await page.goto(`/wishlist/${wishlist.id}`)

  await expect(page.getByText("Dit verlanglijstje is nog leeg")).toBeVisible()
  await expect(
    page.getByText(
      "Voeg de eerste wens toe, dan zien de anderen wat Emma graag wil."
    )
  ).toBeVisible()
})
