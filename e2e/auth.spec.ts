import { test, expect, createUser, emailsTo, prisma, toasts } from "./fixtures"
import { testEnv } from "./support/env"

test.describe("unauthenticated visitor", () => {
  test("sees the landing page instead of the dashboard", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveURL("/")
    await expect(
      page.getByRole("heading", {
        name: "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
      })
    ).toBeVisible()
  })

  for (const path of [
    "/profile",
    "/profile/bought",
    "/group/some-group",
    "/group/some-group/some-wishlist",
    "/wishlist/some-wishlist",
  ]) {
    test(`is sent to login with a callback from ${path}`, async ({ page }) => {
      await page.goto(path)

      await expect(page).toHaveURL(
        `/login?callbackUrl=${encodeURIComponent(path)}`
      )
    })
  }
})

test("logged in user visiting login is redirected to the callback url", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto(`/login?callbackUrl=${encodeURIComponent("/profile/bought")}`)

  await expect(page).toHaveURL("/profile/bought")
})

test("login ignores callback urls pointing to other sites", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto(
    `/login?callbackUrl=${encodeURIComponent("https://example.com")}`
  )

  await expect(page).toHaveURL("/")
})

test("login with e-mail sends a magic link that signs a new user in", async ({
  page,
}) => {
  const email = `magic-${Date.now()}@e2e.test`

  await page.goto("/login")
  await page.getByRole("button", { name: "Inloggen met e-mail" }).click()

  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("E-mail").fill(email)
  await dialog.getByRole("button", { name: "Inloggen" }).click()

  await expect(dialog.getByText("Check je inbox")).toBeVisible()
  await expect(dialog.getByText(email)).toBeVisible()

  await expect.poll(async () => (await emailsTo(email)).length).toBe(1)

  const [loginEmail] = await emailsTo(email)
  expect(loginEmail.subject).toBe("Inloggen Niet Weer Sokken")
  expect(loginEmail.from).toBe("Niet Weer Sokken <no-reply@nietweersokken.nl>")

  const link = loginEmail.html
    .match(/href="([^"]*\/api\/auth\/callback\/email[^"]*)"/)?.[1]
    ?.replaceAll("&amp;", "&")
  expect(link).toContain(testEnv.NEXTAUTH_URL)

  await page.goto(link!)

  await expect(page).toHaveURL("/")

  const nameDialog = page.getByRole("dialog", { name: "Vul je naam in" })
  await expect(nameDialog).toBeVisible()
  await nameDialog.getByLabel("Voornaam").fill("Magda")
  await nameDialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(nameDialog).toBeHidden()
  await expect(toasts(page)).toContainText("Je gegevens zijn opgeslagen")

  const user = await prisma.user.findUniqueOrThrow({ where: { email } })
  expect(user.firstName).toBe("Magda")
  expect(user.emailVerified).not.toBeNull()
})

test("the login link only holds the page to come back to", async ({ page }) => {
  const email = `callback-${Date.now()}@e2e.test`

  await page.goto(`/login?callbackUrl=${encodeURIComponent("/profile/bought")}`)
  await page.getByRole("button", { name: "Inloggen met e-mail" }).click()

  const dialog = page.getByRole("dialog")
  await dialog.getByLabel("E-mail").fill(email)
  await dialog.getByRole("button", { name: "Inloggen" }).click()

  await expect.poll(async () => (await emailsTo(email)).length).toBe(1)

  const [loginEmail] = await emailsTo(email)
  const link = new URL(
    loginEmail.html
      .match(/href="([^"]*\/api\/auth\/callback\/email[^"]*)"/)![1]
      .replaceAll("&amp;", "&")
  )
  expect(link.searchParams.get("callbackUrl")).toBe(
    `${testEnv.NEXTAUTH_URL}/profile/bought`
  )

  await page.goto(link.href)

  await expect(page).toHaveURL("/profile/bought")
})

test("an address gets at most three login e-mails in ten minutes", async ({
  page,
}) => {
  const email = `flood-${Date.now()}@e2e.test`

  for (let attempt = 0; attempt < 4; attempt++) {
    await page.goto("/login")
    await page.getByRole("button", { name: "Inloggen met e-mail" }).click()

    const dialog = page.getByRole("dialog")
    await dialog.getByLabel("E-mail").fill(email)
    await dialog.getByRole("button", { name: "Inloggen" }).click()
    await expect(dialog.getByText("Check je inbox")).toBeVisible()
  }

  expect(await emailsTo(email)).toHaveLength(3)
})

test("login with Google redirects to the Google consent screen", async ({
  page,
}) => {
  await page.route("https://accounts.google.com/**", route =>
    route.fulfill({ body: "Google" })
  )

  await page.goto(`/login?callbackUrl=${encodeURIComponent("/profile")}`)
  await page.getByRole("button", { name: "Inloggen met Google" }).click()

  await page.waitForURL(/accounts\.google\.com/)
  expect(
    (await page.context().cookies()).find(
      ({ name }) => name === "next-auth.callback-url"
    )?.value
  ).toBe(encodeURIComponent(`${testEnv.NEXTAUTH_URL}/profile`))

  const url = new URL(page.url())
  expect(url.searchParams.get("client_id")).toBe(testEnv.GOOGLE_CLIENT_ID)
  expect(url.searchParams.get("redirect_uri")).toBe(
    `${testEnv.NEXTAUTH_URL}/api/auth/callback/google`
  )
})

test("user without a first name is asked for it", async ({ signIn }) => {
  const user = await createUser({ firstName: null })
  const page = await signIn(user)

  await page.goto("/")

  const nameDialog = page.getByRole("dialog", { name: "Vul je naam in" })
  await expect(nameDialog).toBeVisible()
  await nameDialog.getByLabel("Voornaam").fill("Nina")
  await nameDialog.getByRole("button", { name: "Opslaan" }).click()

  await expect(nameDialog).toBeHidden()
  await expect
    .poll(async () => {
      const { firstName } = await prisma.user.findUniqueOrThrow({
        where: { id: user.id },
      })
      return firstName
    })
    .toBe("Nina")

  await page.reload()
  await expect(page.getByText("Wat je volgt")).toBeVisible()
  await expect(nameDialog).toBeHidden()
})

test("logging out ends the session", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile")
  await page.getByRole("button", { name: "Uitloggen" }).click()

  await expect(page).toHaveURL(/\/login/)
  await expect
    .poll(() =>
      prisma.session.count({ where: { sessionToken: user.sessionToken } })
    )
    .toBe(0)
})

test("the header links to the dashboard and your profile", async ({
  signIn,
}) => {
  const user = await createUser({ name: "Pieter Post" })
  const page = await signIn(user)
  const header = page.locator("header")

  await page.goto("/profile/bought")
  await expect(header.getByRole("button")).toHaveCount(0)
  await expect(header.getByText("PP")).toBeVisible()

  await header.getByRole("link", { name: "Niet Weer Sokken" }).click()
  await expect(page).toHaveURL("/")

  await header.getByRole("link", { name: "Je profiel" }).click()
  await expect(page).toHaveURL("/profile")
  await page.getByRole("link", { name: "Gekochte cadeaus" }).click()
  await expect(page).toHaveURL("/profile/bought")
})

test("only admins see the link to the admin on their profile", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/profile")

  await expect(page.getByRole("button", { name: "Uitloggen" })).toBeVisible()
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0)
})

test("the old profile pages for wishlists and groups go to the dashboard", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  for (const path of ["/profile/wishlists", "/profile/groups"]) {
    await page.goto(path)
    await expect(page).toHaveURL("/")
  }
})

test("using the app remembers when you were last seen, once a day", async ({
  signIn,
}) => {
  const user = await createUser()
  const lastSeenAt = async () =>
    (await prisma.user.findUniqueOrThrow({ where: { id: user.id } })).lastSeenAt
  const page = await signIn(user)

  await page.goto("/")
  await expect.poll(lastSeenAt).not.toBeNull()

  const anHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: anHourAgo },
  })
  await page.goto("/profile")
  await expect(page.getByRole("heading", { name: "Profiel" })).toBeVisible()
  expect(await lastSeenAt()).toEqual(anHourAgo)

  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenAt: twoDaysAgo },
  })
  await page.goto("/")
  await expect
    .poll(async () => (await lastSeenAt())!.getTime())
    .toBeGreaterThan(Date.now() - 60 * 1000)
})
