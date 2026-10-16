import {
  test,
  expect,
  createUser,
  createGroup,
  createWishlist,
  emailsTo,
  prisma,
  toasts,
} from "./fixtures"
import { testEnv } from "./support/env"

test.describe("unauthenticated visitor", () => {
  test("is sent to the login page from the dashboard", async ({ page }) => {
    await page.goto("/")

    await expect(page).toHaveURL("/login")
    await expect(
      page.getByRole("heading", { name: "Welkom bij Wishlist" })
    ).toBeVisible()
  })

  for (const path of [
    "/profile",
    "/presents",
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

  await page.goto(`/login?callbackUrl=${encodeURIComponent("/presents")}`)

  await expect(page).toHaveURL("/presents")
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

  await expect(dialog.getByText("Check je inbox 📨")).toBeVisible()
  await expect(dialog.getByText(email)).toBeVisible()

  await expect.poll(async () => (await emailsTo(email)).length).toBe(1)

  const [loginEmail] = await emailsTo(email)
  expect(loginEmail.subject).toBe("Inloggen Wishlist")

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

test("login with Google redirects to the Google consent screen", async ({
  page,
}) => {
  await page.route("https://accounts.google.com/**", route =>
    route.fulfill({ body: "Google" })
  )

  await page.goto("/login")
  await page.getByRole("button", { name: "Inloggen met Google" }).click()

  await page.waitForURL(/accounts\.google\.com/)

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
  await expect(page.getByText("Groepen die je volgt")).toBeVisible()
  await expect(nameDialog).toBeHidden()
})

test("logging out ends the session", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)

  await page.goto("/")
  await page.locator("header").getByRole("button").click()
  await page.getByRole("button", { name: "Uitloggen" }).click()

  await expect(page).toHaveURL(/\/login/)
  await expect
    .poll(() =>
      prisma.session.count({ where: { sessionToken: user.sessionToken } })
    )
    .toBe(0)
})

test("menu links to all main pages", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)
  const menuButton = page.locator("header").getByRole("button")

  await page.goto("/")

  for (const [name, path] of [
    ["Cadeaus", "/presents"],
    ["Overzicht", "/"],
  ]) {
    await menuButton.click()
    await page.getByRole("dialog").getByRole("link", { name }).click()
    await expect(page).toHaveURL(path)
    await expect(page.getByRole("dialog")).toBeHidden()
  }

  await menuButton.click()
  await expect(page.getByRole("link", { name: "Admin" })).toBeHidden()
})

test("avatar in the header links to the profile", async ({ signIn }) => {
  const user = await createUser({ name: "Pieter Post" })
  const page = await signIn(user)

  await page.goto("/")
  await page.locator("header").getByRole("link", { name: "PP" }).click()

  await expect(page).toHaveURL("/profile")
})

test("theme api returns the theme of a group", async ({ signIn }) => {
  const user = await createUser()
  const group = await createGroup(user, { theme: "christmas" })
  await createWishlist(user, { groups: [group] })
  const page = await signIn(user)

  const response = await page.request.get(`/api/theme?groupId=${group.id}`)

  expect(await response.json()).toEqual({ theme: "christmas" })
})

test("old profile pages go to where their content moved", async ({
  signIn,
}) => {
  const user = await createUser()
  const page = await signIn(user)

  for (const [path, destination] of [
    ["/profile/wishlists", "/"],
    ["/profile/groups", "/"],
    ["/profile/bought", "/presents"],
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL(destination)
  }
})
