import { Page } from "@playwright/test"
import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createInterest,
  createItem,
  prisma,
  toasts,
} from "./fixtures"

const interests = (page: Page, title: string) =>
  page.getByRole("region", { name: title }).getByRole("listitem")

const interestsOf = async (wishlist: { id: string }) =>
  (
    await prisma.wishlistInterest.findMany({
      where: { wishlistId: wishlist.id },
      orderBy: { createdAt: "asc" },
    })
  ).map(({ title }) => title)

async function addInterest(page: Page, title: string) {
  await page.getByLabel("Nieuwe interesse").fill(title)
  await page.getByRole("button", { name: "Voeg toe", exact: true }).click()
}

test("share what makes you happy on your wishlist", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Olga" })
  const wishlist = await createWishlist(owner)
  const page = await signIn(owner)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(
    page.getByRole("heading", { name: "Je verlanglijstje is nog leeg" })
  ).toBeVisible()
  await expect(
    page.getByText(
      "Voeg je eerste wens toe, of vul hieronder in waar je blij van wordt."
    )
  ).toBeVisible()
  const empty = await page
    .getByRole("heading", { name: "Je verlanglijstje is nog leeg" })
    .boundingBox()
  const block = await page
    .getByRole("region", { name: "Waar ik blij van word" })
    .boundingBox()
  expect(empty!.y).toBeLessThan(block!.y)
  await expect(
    page.getByRole("region", { name: "Waar ik blij van word" })
  ).toContainText(
    "Hou je niet zo van wensen? Zet hier wat je graag doet of leuk vindt, dan bedenken de anderen zelf iets."
  )

  await addInterest(page, "lezen")
  await expect(interests(page, "Waar ik blij van word")).toHaveText(["lezen"])
  await expect(page.getByLabel("Nieuwe interesse")).toHaveValue("")
  await addInterest(page, "  sudoku ")
  await addInterest(page, "wandelen")

  await expect(interests(page, "Waar ik blij van word")).toHaveText([
    "lezen",
    "sudoku",
    "wandelen",
  ])
  expect(await interestsOf(wishlist)).toEqual(["lezen", "sudoku", "wandelen"])

  await page.getByRole("button", { name: "Verwijder sudoku" }).click()
  const confirm = page.getByRole("alertdialog", { name: "Weet je het zeker?" })
  await expect(confirm).toContainText(
    "sudoku verdwijnt van dit verlanglijstje."
  )
  await confirm.getByRole("button", { name: "Verwijder" }).click()

  await expect(interests(page, "Waar ik blij van word")).toHaveText([
    "lezen",
    "wandelen",
  ])
  expect(await interestsOf(wishlist)).toEqual(["lezen", "wandelen"])
})

test("a wishlist with only interests doesn't ask for wishes", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, { groups: [group] })
  await createInterest(wishlist, "lezen")

  const ownerPage = await signIn(owner)
  await ownerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(
    ownerPage.getByRole("region", { name: "Waar ik blij van word" })
  ).toContainText(
    "Er staan geen wensen op je verlanglijstje, en dat is goed. De anderen bedenken hiermee zelf een cadeau. Wil je toch iets specifieks, voeg dan een wens toe."
  )
  await expect(ownerPage.getByText("nog leeg")).toHaveCount(0)

  const memberPage = await signIn(member)
  await memberPage.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(interests(memberPage, "Waar Olga blij van wordt")).toHaveText([
    "lezen",
  ])
  await expect(
    memberPage.getByRole("region", { name: "Waar Olga blij van wordt" })
  ).toContainText(
    "Er staan geen wensen op dit verlanglijstje, maar hiermee bedenk je vast een cadeau om Olga mee te verrassen."
  )
  await expect(memberPage.getByText("nog geen wensen")).toHaveCount(0)
  await expect(
    memberPage.getByRole("button", { name: "Vraag om meer wensen" })
  ).toHaveCount(0)
})

test("interests stay next to the wishes", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Olga" })
  const wishlist = await createWishlist(owner)
  await createInterest(wishlist, "lezen")
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(owner)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(interests(page, "Waar ik blij van word")).toHaveText(["lezen"])
  await expect(
    page.getByRole("region", { name: "Waar ik blij van word" })
  ).toContainText(
    "Hiermee kunnen de anderen je ook verrassen, naast je wensen hieronder."
  )
  await expect(page.getByText("Fiets")).toBeVisible()
  await expect(page.getByText("Er staan geen wensen op")).toHaveCount(0)
})

test("interest validation errors are shown", async ({ signIn }) => {
  const owner = await createUser()
  const wishlist = await createWishlist(owner)
  await createInterest(wishlist, "Lezen")
  const page = await signIn(owner)

  await page.goto(`/wishlist/${wishlist.id}`)

  await addInterest(page, "a")
  await expect(toasts(page)).toContainText(
    "Een interesse moet minimaal uit 2 tekens bestaan"
  )
  await expect(page.getByLabel("Nieuwe interesse")).toHaveValue("a")

  await addInterest(page, "a".repeat(31))
  await expect(toasts(page)).toContainText(
    "Een interesse mag maximaal uit 30 tekens bestaan"
  )

  await addInterest(page, "lezen")
  await expect(toasts(page)).toContainText("lezen staat er al op")

  for (let index = 2; index <= 20; index++) {
    await createInterest(wishlist, `Interesse ${index}`)
  }
  await addInterest(page, "Sudoku")
  await expect(toasts(page)).toContainText(
    "Je kunt maximaal 20 interesses toevoegen"
  )

  expect(await interestsOf(wishlist)).toHaveLength(20)
  expect(await interestsOf(wishlist)).not.toContain("Sudoku")
})

test("managers can add and remove interests", async ({ signIn }) => {
  const owner = await createUser()
  const manager = await createUser()
  const wishlist = await createWishlist(owner, {
    title: "Emma",
    managers: [manager],
  })
  await createInterest(wishlist, "dino's")
  const page = await signIn(manager)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(
    page.getByRole("region", { name: "Waar Emma blij van wordt" })
  ).toContainText(
    "Er staan geen wensen op dit verlanglijstje, en dat is goed. De anderen bedenken hiermee zelf een cadeau voor Emma. Wil je toch iets specifieks, voeg dan een wens toe."
  )

  await addInterest(page, "tekenen")
  await expect(interests(page, "Waar Emma blij van wordt")).toHaveText([
    "dino's",
    "tekenen",
  ])

  await page.getByRole("button", { name: "Verwijder dino's" }).click()
  await page
    .getByRole("alertdialog", { name: "Weet je het zeker?" })
    .getByRole("button", { name: "Verwijder" })
    .click()

  await expect(interests(page, "Waar Emma blij van wordt")).toHaveText([
    "tekenen",
  ])
  expect(await interestsOf(wishlist)).toEqual(["tekenen"])
})

test("group members, followers and shared links see the interests", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const member = await createUser()
  const follower = await createUser()
  const visitor = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const wishlist = await createWishlist(owner, {
    groups: [group],
    followers: [follower],
    shareToken: `token-${owner.id}`,
  })
  await createInterest(wishlist, "lezen")
  await createInterest(wishlist, "sudoku")
  await createItem(wishlist, { title: "Fiets" })

  const memberPage = await signIn(member)
  await memberPage.goto(`/group/${group.id}/${wishlist.id}`)
  await expect(interests(memberPage, "Waar Olga blij van wordt")).toHaveText([
    "lezen",
    "sudoku",
  ])
  await expect(
    memberPage.getByRole("region", { name: "Waar Olga blij van wordt" })
  ).toContainText(
    "Naast de wensen hieronder kun je Olga ook verrassen met iets wat hierbij past."
  )

  const followerPage = await signIn(follower)
  await followerPage.goto(`/wishlist/${wishlist.id}`)
  await expect(interests(followerPage, "Waar Olga blij van wordt")).toHaveText([
    "lezen",
    "sudoku",
  ])

  const visitorPage = await signIn(visitor)
  await visitorPage.goto(`/lijstje/token-${owner.id}`)
  await expect(interests(visitorPage, "Waar Olga blij van wordt")).toHaveText([
    "lezen",
    "sudoku",
  ])
  await expect(visitorPage.getByText("Fiets")).toHaveCount(0)
  await expect(visitorPage.getByText("Naast de wensen hieronder")).toHaveCount(
    0
  )

  for (const page of [memberPage, followerPage, visitorPage]) {
    await expect(page.getByLabel("Nieuwe interesse")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /^Verwijder/ })).toHaveCount(
      0
    )
    await expect(
      page
        .getByRole("region", { name: "Waar Olga blij van wordt" })
        .getByRole("button", { name: "Ik koop dit" })
    ).toHaveCount(0)
  }
})

test("a wishlist without interests shows no block to others", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Olga" })
  const follower = await createUser()
  const wishlist = await createWishlist(owner, { followers: [follower] })
  await createItem(wishlist, { title: "Fiets" })
  const page = await signIn(follower)

  await page.goto(`/wishlist/${wishlist.id}`)
  await expect(page.getByText("Fiets")).toBeVisible()
  await expect(page.getByText("Waar Olga blij van wordt")).toHaveCount(0)
})
