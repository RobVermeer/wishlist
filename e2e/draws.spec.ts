import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  createDraw,
  dateInAmsterdam,
  emailsTo,
  prisma,
  toasts,
} from "./fixtures"
import { Page } from "@playwright/test"

const lot = (page: Page) => page.getByRole("region", { name: "Jouw lootje" })

const reveal = (scope: Page | ReturnType<Page["getByRole"]>) =>
  scope.getByRole("button", { name: "Laat zien", exact: true }).click()

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
  await expect(
    page
      .getByRole("region", { name: "Wie koopt voor wie?" })
      .getByText("Lootjes trekken")
  ).toHaveCount(1)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()

  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await expect(dialog.getByRole("checkbox")).toHaveCount(4)
  await dialog.getByLabel("Dirk").uncheck()
  await dialog.getByLabel("Budget").fill("25")
  await dialog.getByLabel("Datum van het feest").fill("2026-12-05")
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
    expect(email.html).toContain(
      "Je krijgt deze e-mail omdat je meedoet aan de lootjes voor Sinterklaas."
    )
    const name = drawnName(email.html)
    expect(name).not.toBe(participant.firstName)
    drawn.push(name)

    const participantPage = await signIn(participant)
    await participantPage.goto(`/group/${group.id}`)
    await reveal(lot(participantPage))
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
  await createWishlist(carla, { groups: [group] })
  await createDraw(group, [owner, bert, carla])
  const page = await signIn(bert)

  await page.goto(`/group/${group.id}`)
  await reveal(lot(page))

  await expect(lot(page)).toContainText("Je hebt Carla getrokken")
  await expect(page.getByText(/getrokken/)).toHaveCount(1)
  await expect(page.getByText("Je hebt Anna getrokken")).toHaveCount(0)
  await expect(lot(page).getByRole("link")).toHaveCount(0)
})

test("a lootje says when someone has no wishlist yet", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  await createDraw(group, [owner, bert])
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await reveal(lot(page))

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
  await dialog.getByLabel("Datum van het feest").fill(dateInAmsterdam(30))
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText(
    "Kies minimaal twee deelnemers voor de loting"
  )
  await expect(dialog).toBeVisible()
  expect(await prisma.draw.count({ where: { groupId: group.id } })).toBe(0)
})

test("drawing lots needs the date of the party", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  const date = dialog.getByLabel("Datum van het feest")
  await expect(date).toHaveAttribute("required")
  await date.evaluate(input => {
    input.removeAttribute("required")
    input.removeAttribute("min")
  })
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("Kies de datum van het feest")
  await expect(dialog).toBeVisible()

  await date.fill(dateInAmsterdam(-1))
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("Kies een datum vanaf vandaag")

  const budget = dialog.getByLabel("Budget")
  await date.fill(dateInAmsterdam())
  await budget.fill("10001")
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText(
    "Het budget mag maximaal 10.000 euro zijn."
  )
  expect(await prisma.draw.count({ where: { groupId: group.id } })).toBe(0)
  expect(await emailsTo(bert.email!)).toHaveLength(0)

  await budget.fill("")
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("De lootjes zijn getrokken")
  await expect(dialog).toBeHidden()
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

const addPerson = async (
  dialog: ReturnType<Page["getByRole"]>,
  name: string,
  email: string
) => {
  await dialog.getByLabel("Naam van de deelnemer").fill(name)
  await dialog.getByLabel("E-mailadres").fill(email)
  await dialog.getByRole("button", { name: "Voeg toe" }).click()
}

test("people who aren't in the group yet can take part", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const opa = await createUser({ firstName: "Opa" })
  const group = await createGroup(owner, {
    title: "Sinterklaas",
    members: [bert],
  })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await addPerson(dialog, "Opa", opa.email!.toUpperCase())
  await expect(dialog.getByRole("listitem")).toHaveText([/Opa/])
  await dialog.getByLabel("Datum van het feest").fill(dateInAmsterdam(30))
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()
  await expect(toasts(page)).toContainText("De lootjes zijn getrokken")

  await expect.poll(async () => (await emailsTo(opa.email!)).length).toBe(1)
  const [email] = await emailsTo(opa.email!)
  expect(email.subject).toBe(
    "Opa, je hebt een lootje getrokken voor Sinterklaas"
  )
  expect(email.html).toContain("Doe mee met de groep")
  expect(email.html).toContain(`/group/${group.id}`)
  expect(email.html).toContain(
    "Je krijgt deze e-mail omdat Anna je e-mailadres heeft ingevuld bij de lootjes voor Sinterklaas."
  )
  const drawn = drawnName(email.html)

  const opaPage = await signIn(opa)
  await opaPage.goto(`/group/${group.id}`)
  await opaPage.getByRole("button", { name: "Volg de groep" }).click()
  await reveal(lot(opaPage))
  await expect(lot(opaPage)).toContainText(`Je hebt ${drawn} getrokken`)
})

test("someone added to the draw must have a valid e-mail address", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await addPerson(dialog, "Opa", "geen-adres")
  await dialog.getByLabel("Datum van het feest").fill(dateInAmsterdam(30))
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("Vul een geldig e-mailadres in")
  expect(await prisma.draw.count({ where: { groupId: group.id } })).toBe(0)
})

test("everyone in the draw needs their own e-mail address", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await addPerson(dialog, "Opa", "opa@e2e.test")
  await addPerson(dialog, "Oma", "opa@e2e.test")
  await dialog.getByLabel("Datum van het feest").fill(dateInAmsterdam(30))
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText(
    "Iedereen in de loting heeft een eigen e-mailadres nodig"
  )
  expect(await prisma.draw.count({ where: { groupId: group.id } })).toBe(0)
})

const status = (page: Page) =>
  page.getByRole("list", { name: "Wie doen er mee" })

test("the creator sees who joined, but not who drew whom", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: "Carla" })
  const group = await createGroup(owner, { members: [bert, carla] })
  await createDraw(group, [
    owner,
    bert,
    carla,
    { name: "Opa", email: "opa@e2e.test" },
  ])
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { disconnect: { id: carla.id } } },
  })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)

  await expect(status(page).getByRole("listitem")).toHaveText([
    /Anna\s*In de groep/,
    /Bert\s*In de groep/,
    /Carla\s*Niet meer in de groep/,
    /Opa\s*Nog niet aangemeld/,
  ])
  await reveal(lot(page))
  await expect(page.getByText(/Je hebt .+ getrokken/)).toHaveCount(1)
  await expect(lot(page)).toContainText("Je hebt Bert getrokken")

  const bertPage = await signIn(bert)
  await bertPage.goto(`/group/${group.id}`)
  await expect(lot(bertPage)).toBeVisible()
  await expect(status(bertPage)).toHaveCount(0)
})

test("the creator sees who left the group in one sentence", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: "Carla" })
  const dirk = await createUser({ firstName: "Dirk" })
  const group = await createGroup(owner, { members: [bert, carla, dirk] })
  await createDraw(group, [owner, bert, carla, dirk])
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { disconnect: [{ id: bert.id }, { id: carla.id }] } },
  })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)

  await expect(
    page.getByText(
      "Bert en Carla zitten niet meer in de groep. Trek de lootjes opnieuw als zij niet meer meedoen."
    )
  ).toBeVisible()
})

const drawSummary = (page: Page) =>
  page.getByRole("button", { name: /De lootjes zijn getrokken/ })

test("the draw folds into one line once everyone joined", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: "Carla" })
  const group = await createGroup(owner, { members: [bert, carla] })
  await createDraw(group, [owner, bert, carla])
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)

  await expect(drawSummary(page)).toHaveText(
    /De lootjes zijn getrokken\s*3 van 3 in de groep/
  )
  await expect(drawSummary(page)).toHaveAttribute("aria-expanded", "false")
  await expect(status(page)).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Opnieuw lootjes trekken" })
  ).toHaveCount(0)

  await drawSummary(page).click()

  await expect(drawSummary(page)).toHaveAttribute("aria-expanded", "true")
  await expect(status(page).getByRole("listitem")).toHaveText([
    /Anna\s*In de groep/,
    /Bert\s*In de groep/,
    /Carla\s*In de groep/,
  ])
  await expect(
    page.getByRole("button", { name: "Opnieuw lootjes trekken" })
  ).toBeVisible()
})

test("the draw stays open while someone hasn't joined or left", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: "Carla" })
  const invited = await createGroup(owner, { members: [bert] })
  await createDraw(invited, [
    owner,
    bert,
    { name: "Opa", email: `opa-${bert.id}@e2e.test` },
  ])
  const left = await createGroup(owner, { members: [bert, carla] })
  await createDraw(left, [owner, bert, carla])
  await prisma.group.update({
    where: { id: left.id },
    data: { members: { disconnect: { id: carla.id } } },
  })
  const page = await signIn(owner)

  for (const group of [invited, left]) {
    await page.goto(`/group/${group.id}`)

    await expect(drawSummary(page)).toHaveText(
      /De lootjes zijn getrokken\s*2 van 3 in de groep/
    )
    await expect(drawSummary(page)).toHaveAttribute("aria-expanded", "true")
    await expect(status(page).getByRole("listitem")).toHaveCount(3)
    await expect(
      page.getByRole("button", { name: "Opnieuw lootjes trekken" })
    ).toBeVisible()

    await drawSummary(page).click()

    await expect(status(page)).toHaveCount(0)
  }
})

test("send the lootje again to someone who hasn't joined yet", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, {
    title: "Kerst",
    members: [bert],
  })
  const opa = `opa-${bert.id}@e2e.test`
  await createDraw(group, [owner, bert, { name: "Opa", email: opa }], {
    lastSentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  const row = status(page).getByRole("listitem").filter({ hasText: "Opa" })
  await expect(
    status(page).getByRole("button", { name: "Stuur opnieuw" })
  ).toHaveCount(1)
  await row.getByRole("button", { name: "Stuur opnieuw" }).click()

  await expect(toasts(page)).toContainText("De e-mail is opnieuw verstuurd")
  await expect.poll(async () => (await emailsTo(opa)).length).toBe(1)
  const [email] = await emailsTo(opa)
  expect(email.subject).toBe("Opa, je hebt een lootje getrokken voor Kerst")
  expect(drawnName(email.html)).toBe("Anna")
  expect(email.html).toContain("Doe mee met de groep")
  await expect(
    row.getByRole("button", { name: "Stuur opnieuw" })
  ).toBeDisabled()
})

test("drawing lots again replaces the previous draw", async ({ signIn }) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, {
    title: "Kerst",
    members: [bert],
  })
  const opa = `opa-${bert.id}@e2e.test`
  const { draw } = await createDraw(group, [
    owner,
    bert,
    { name: "Opa", email: opa },
  ])
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Opnieuw lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Opnieuw lootjes trekken" })
  await expect(dialog).toContainText("De vorige loting telt dan niet meer")
  await expect(dialog.getByLabel("Opa")).toBeChecked()
  await dialog.getByLabel("Datum van het feest").fill(dateInAmsterdam(30))
  await dialog.getByRole("button", { name: "Trek lootjes" }).click()

  await expect(toasts(page)).toContainText("De lootjes zijn getrokken")
  await expect
    .poll(
      async () =>
        (await prisma.draw.findUniqueOrThrow({ where: { id: draw.id } }))
          .cancelledAt
    )
    .not.toBeNull()
  for (const [address, name] of [
    [owner.email!, "Anna"],
    [bert.email!, "Bert"],
    [opa, "Opa"],
  ]) {
    await expect.poll(async () => (await emailsTo(address)).length).toBe(1)
    const [email] = await emailsTo(address)
    expect(email.subject).toBe(
      `${name}, de lootjes voor Kerst zijn opnieuw getrokken`
    )
  }
  await expect(lot(page)).toBeVisible()
})

test("the overview shows your lootjes from all your groups", async ({
  signIn,
}) => {
  const bert = await createUser({ firstName: "Bert" })
  const anna = await createUser({ firstName: "Anna" })
  const carla = await createUser({ firstName: "Carla" })
  const family = await createGroup(anna, {
    title: `Familie ${bert.id}`,
    members: [bert],
  })
  const friends = await createGroup(carla, {
    title: `Vrienden ${bert.id}`,
    members: [bert],
  })
  const removed = await createGroup(anna, {
    title: `Weg ${bert.id}`,
    members: [bert],
    removed: true,
  })
  const left = await createGroup(anna, { title: `Verlaten ${bert.id}` })
  await createDraw(family, [anna, bert], { cancelled: true })
  await createDraw(family, [bert, anna], {
    budget: 25,
    date: new Date("2026-12-05"),
  })
  await createDraw(friends, [bert, carla])
  await createDraw(removed, [bert, anna])
  await createDraw(left, [bert, anna])
  const page = await signIn(bert)

  await page.goto("/")

  const lots = page.getByRole("list", { name: "Je lootjes" })
  await expect(lots.getByRole("listitem")).toHaveText([
    new RegExp(`Familie ${bert.id}\\s*Budget: €\\s25 · Datum: 5 december 2026`),
    new RegExp(`^Vrienden ${bert.id}$`),
  ])
  await lots
    .getByRole("link", { name: new RegExp(`Vrienden ${bert.id}`) })
    .click()
  await expect(page).toHaveURL(`/group/${friends.id}`)
})

test("a lootje no longer shows after the date of the party", async ({
  signIn,
}) => {
  const anna = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const past = await createGroup(anna, {
    title: `Voorbij ${bert.id}`,
    members: [bert],
  })
  const current = await createGroup(anna, {
    title: `Vandaag ${bert.id}`,
    members: [bert],
  })
  const undated = await createGroup(anna, {
    title: `Zonder datum ${bert.id}`,
    members: [bert],
  })
  await createDraw(past, [bert, anna], {
    date: new Date(dateInAmsterdam(-1)),
  })
  await createDraw(current, [bert, anna], {
    date: new Date(dateInAmsterdam()),
  })
  await createDraw(undated, [bert, anna])
  const page = await signIn(bert)

  await page.goto("/")

  await expect(
    page.getByRole("list", { name: "Je lootjes" }).getByRole("listitem")
  ).toHaveText([
    new RegExp(`Vandaag ${bert.id}`),
    new RegExp(`Zonder datum ${bert.id}`),
  ])

  await page.goto(`/group/${past.id}`)
  await expect(page.getByRole("heading", { level: 2 }).first()).toBeVisible()
  await expect(lot(page)).toHaveCount(0)

  for (const group of [current, undated]) {
    await page.goto(`/group/${group.id}`)
    await expect(lot(page)).toBeVisible()
  }

  const annaPage = await signIn(anna)
  await annaPage.goto(`/group/${past.id}`)
  await expect(
    annaPage.getByRole("button", { name: "Lootjes trekken" })
  ).toBeVisible()
  await expect(lot(annaPage)).toHaveCount(0)
})

test("a lootje stays hidden until you show it", async ({ signIn }) => {
  const anna = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: `Carla ${bert.id}` })
  const group = await createGroup(anna, {
    title: `Familie ${bert.id}`,
    members: [bert, carla],
  })
  await createWishlist(carla, { groups: [group] })
  await createDraw(group, [anna, bert, carla])
  const page = await signIn(bert)
  const drawn = `Je hebt Carla ${bert.id} getrokken`

  await page.goto(`/group/${group.id}`)

  await expect(lot(page)).toContainText("Je hebt iemand getrokken")
  await expect(lot(page)).not.toContainText("Carla")
  expect(await lot(page).ariaSnapshot()).not.toContain("Carla")
  await expect(lot(page).getByRole("link")).toHaveCount(0)

  await reveal(lot(page))
  await expect(lot(page)).toContainText(drawn)
  await expect(lot(page).getByRole("link")).toHaveCount(0)

  await lot(page).getByRole("button", { name: "Verberg" }).click()
  await expect(lot(page)).not.toContainText("Carla")

  await reveal(lot(page))
  await page.reload()
  await expect(lot(page)).toContainText("Je hebt iemand getrokken")
  await expect(lot(page)).not.toContainText("Carla")

  await page.goto("/")
  const lots = page.getByRole("list", { name: "Je lootjes" })
  await expect(lots).toContainText(`Familie ${bert.id}`)
  await expect(lots.getByRole("button")).toHaveCount(0)
  await expect(page.getByRole("main")).not.toContainText(`Carla ${bert.id}`)
  expect(await page.getByRole("main").ariaSnapshot()).not.toContain(
    `Carla ${bert.id}`
  )

  await lots
    .getByRole("link", { name: new RegExp(`Familie ${bert.id}`) })
    .click()
  await expect(page).toHaveURL(`/group/${group.id}`)
  await expect(lot(page)).toContainText("Je hebt iemand getrokken")
})

test("clicking the hidden name shows the lootje", async ({ signIn }) => {
  const anna = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const carla = await createUser({ firstName: `Carla ${bert.id}` })
  const group = await createGroup(anna, { members: [bert, carla] })
  await createDraw(group, [anna, bert, carla])
  const page = await signIn(bert)
  const drawn = `Je hebt Carla ${bert.id} getrokken`
  const hiddenName = lot(page).getByRole("button", {
    name: "Laat zien wie je hebt getrokken",
  })

  await page.goto(`/group/${group.id}`)

  await hiddenName.click()
  await expect(lot(page)).toContainText(drawn)
  await expect(hiddenName).toHaveCount(0)
  await expect(lot(page).getByRole("button", { name: "Verberg" })).toBeFocused()

  await lot(page).getByRole("button", { name: "Verberg" }).click()
  await expect(lot(page)).not.toContainText("Carla")

  await hiddenName.focus()
  await page.keyboard.press("Enter")
  await expect(lot(page)).toContainText(drawn)
})

test("the overview has no lootjes without a draw", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")

  await expect(page.getByText("Wat je volgt")).toBeVisible()
  await expect(page.getByRole("list", { name: "Je lootjes" })).toHaveCount(0)
})

test("drawing lots shows once there's someone to draw with", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const group = await createGroup(owner)
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await expect(page.locator("main section").first()).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Lootjes trekken" })
  ).toHaveCount(0)

  const bert = await createUser({ firstName: "Bert" })
  await prisma.group.update({
    where: { id: group.id },
    data: { members: { connect: { id: bert.id } } },
  })
  await page.reload()
  await page.getByRole("button", { name: "Lootjes trekken" }).click()

  await expect(
    page.getByRole("dialog", { name: "Lootjes trekken" })
  ).toContainText("Niemand ziet wie wie heeft getrokken, ook jij niet.")
})

test("closing the draw after changing something asks first", async ({
  signIn,
}) => {
  const owner = await createUser({ firstName: "Anna" })
  const bert = await createUser({ firstName: "Bert" })
  const group = await createGroup(owner, { members: [bert] })
  const page = await signIn(owner)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  const dialog = page.getByRole("dialog", { name: "Lootjes trekken" })
  await dialog.getByLabel("Budget").fill("25")
  await page.keyboard.press("Escape")

  const confirm = page.getByRole("alertdialog", {
    name: "Wijzigingen niet opslaan?",
  })
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  await addPerson(dialog, "Carla", "carla@example.com")
  await page.keyboard.press("Escape")
  await confirm.getByRole("button", { name: "Niet opslaan" }).click()
  await expect(dialog).toBeHidden()

  await page.getByRole("button", { name: "Lootjes trekken" }).click()
  await expect(dialog.getByText("carla@example.com")).toHaveCount(0)
  expect(await prisma.draw.count({ where: { groupId: group.id } })).toBe(0)
})
