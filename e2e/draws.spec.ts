import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createDraw,
  emailsTo,
  prisma,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"

const lot = (page: Page) => page.getByRole("region", { name: "Jouw lootje" })

const drawnName = (html: string) =>
  html.match(/Je hebt <strong>([^<]+)<\/strong> getrokken/)?.[1]

test("the creator draws lots for the group", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const members = [
    await createUser({ firstName: "Bert" }),
    await createUser({ firstName: "Carla" }),
  ]
  const skipped = await createUser({ firstName: "Dirk" })
  const group = await createGroup(owner, {
    title: "Sinterklaas",
    members: [...members, skipped],
  })
  const participants = [owner, ...members]
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()

  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await expect(dialog.getByRole("checkbox")).toHaveCount(4)
  await dialog.getByLabel("Dirk").uncheck()
  await dialog.getByLabel("Budget").fill("25")
  await dialog.getByLabel("Datum").fill("2026-12-05")
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("De lootjes zijn getrokken")
  await expect(dialog).toBeHidden()

  for (const participant of participants) {
    await expect
      .poll(async () => (await emailsTo(participant.email!)).length)
      .toBe(1)
  }
  expect(await emailsTo(skipped.email!)).toHaveLength(0)

  const drawn = []
  for (const participant of participants) {
    const [email] = await emailsTo(participant.email!)
    expect(email.subject).toBe(
      `${participant.firstName}, je hebt een lootje getrokken voor Sinterklaas`
    )
    expect(email.html).toMatch(/€\s25/)
    expect(email.html).toContain("5 december 2026")
    const name = drawnName(email.html)
    expect(name).not.toBe(participant.firstName)
    drawn.push(name)

    const participantPage = await signIn(participant)
    await participantPage.goto(`/group/${group.id}`)
    await expect(lot(participantPage)).toContainText(
      `Je hebt ${name} getrokken`
    )
    await expect(lot(participantPage)).toContainText(/€\s25/)
    await expect(lot(participantPage)).toContainText("5 december 2026")
  }
  expect(drawn.sort()).toEqual(["Anna", "Bert", "Carla"])

  const skippedPage = await signIn(skipped)
  await skippedPage.goto(`/group/${group.id}`)
  await expect(skippedPage.getByText("Sinterklaas").first()).toBeVisible()
  await expect(lot(skippedPage)).toHaveCount(0)
})

test("a participant only sees their own lootje", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: "Carla" })
  const group = await createGroup(owner, { members: [bert, carla] })
  const carlasList = await createWishlist(carla, { groups: [group] })
  await createDraw(group, [owner, bert, carla])
  const page = await signIn(bert)

  await page.goto(`/group/${group.id}`)

  await expect(lot(page)).toContainText("Je hebt Carla getrokken")
  await expect(page.getByText(/getrokken/)).toHaveCount(1)
  await expect(page.getByText("Je hebt Anna getrokken")).toHaveCount(0)
  await lot(page)
    .getByRole("link", { name: "Bekijk het verlanglijstje van Carla" })
    .click()
  await expect(page).toHaveURL(`/group/${group.id}/${carlasList.id}`)
})

test("a lootje says when someone has no wishlist yet", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  await createDraw(group, [owner, bert])
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)

  await expect(lot(page)).toContainText("Je hebt Bert getrokken")
  await expect(lot(page)).toContainText(
    "Bert heeft nog geen verlanglijstje in deze groep"
  )
})

test("drawing lots needs at least two participants", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await dialog.getByLabel("Bert").uncheck()
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText(
    "Kies minimaal twee deelnemers voor de loting"
  )
  await expect(dialog).toBeVisible()
  expect(await prisma.draw.count({ where: { groupId: group.id } })).toBe(0)
})

test("only the creator of a group sees the button to draw lots", async ({
  signIn,
}) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}`)

  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Lootjes trekken" })
  ).toHaveCount(0)
})
