import { test, expect, createUser } from "./fixtures"
import { Page } from "@playwright/test"

const iPhone = {
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  viewport: { width: 390, height: 844 },
}

const android = {
  userAgent:
    "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
  viewport: { width: 412, height: 915 },
}

const card = (page: Page) =>
  page.getByRole("region", { name: "Zet Niet Weer Sokken op je telefoon" })

const pretendInstalled = (page: Page) =>
  page.addInitScript(() => {
    const matchMedia = window.matchMedia.bind(window)
    window.matchMedia = query =>
      query === "(display-mode: standalone)"
        ? ({ ...matchMedia(query), matches: true } as MediaQueryList)
        : matchMedia(query)
  })

test.describe("on an iPhone", () => {
  test.use(iPhone)

  test("visitors see how to add Niet Weer Sokken to their home screen", async ({
    page,
  }) => {
    await page.goto("/login")

    await expect(card(page)).toContainText("Tik op Deel")
    await expect(card(page)).toContainText("Kies Zet op beginscherm.")
    await expect(card(page)).toContainText("Tik op Voeg toe.")
    await expect(
      card(page).getByRole("button", { name: "Installeer de app" })
    ).toHaveCount(0)
  })

  test("nothing is shown once Niet Weer Sokken is opened as an app", async ({
    page,
  }) => {
    await pretendInstalled(page)

    await page.goto("/login")

    await expect(
      page.getByRole("heading", {
        name: "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
      })
    ).toBeVisible()
    await expect(card(page)).toBeHidden()
  })
})

test.describe("on Android", () => {
  test.use(android)

  test("visitors install Niet Weer Sokken with one button", async ({
    page,
  }) => {
    await page.goto("/login")
    await expect(card(page)).toContainText("Kies App installeren")

    await page.evaluate(() => {
      const event = new Event("beforeinstallprompt", { cancelable: true })
      Object.assign(event, {
        prompt: async () => {
          document.body.dataset.installPrompted = "true"
        },
        userChoice: Promise.resolve({ outcome: "accepted" }),
      })
      window.dispatchEvent(event)
    })

    await card(page).getByRole("button", { name: "Installeer de app" }).click()

    await expect(page.locator("body")).toHaveAttribute(
      "data-install-prompted",
      "true"
    )
    await expect(card(page)).toBeHidden()
  })
})

test("logged in, the explanation is on the profile and not on the dashboard", async ({
  signIn,
}) => {
  const page = await signIn(await createUser(), iPhone)

  await page.goto("/")
  await expect(page.getByRole("heading", { name: /Hoi/ })).toBeVisible()
  await expect(card(page)).toBeHidden()

  await page.goto("/profile")
  await expect(card(page)).toContainText("Kies Zet op beginscherm.")
})

test("on a computer only the profile explains it, for both phones", async ({
  page,
  signIn,
}) => {
  await page.goto("/login")
  await expect(
    page.getByRole("heading", {
      name: "Maak en deel je verlanglijstje, zodat je niet weer sokken krijgt.",
    })
  ).toBeVisible()
  await expect(card(page)).toBeHidden()

  const loggedIn = await signIn(await createUser())
  await loggedIn.goto("/profile")
  await expect(card(loggedIn)).toContainText(
    "Open Niet Weer Sokken op je telefoon en volg de stappen hieronder."
  )
  await expect(
    card(loggedIn).getByRole("heading", { name: "iPhone of iPad" })
  ).toBeVisible()
  await expect(card(loggedIn)).toContainText("Kies Zet op beginscherm.")
  await expect(
    card(loggedIn).getByRole("heading", { name: "Android" })
  ).toBeVisible()
  await expect(card(loggedIn)).toContainText("Kies App installeren")
})

test("the installed app doesn't show it on the profile either", async ({
  signIn,
}) => {
  const page = await signIn(await createUser(), iPhone)
  await pretendInstalled(page)

  await page.goto("/profile")

  await expect(page.getByLabel("Voornaam")).toBeVisible()
  await expect(card(page)).toBeHidden()
})
