import { test as base, expect, Page } from "@playwright/test"
import { PrismaClient, User } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { randomUUID } from "node:crypto"
import { adminUserId, baseURL, mailURL, testEnv } from "./support/env"

export const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3(
    { url: testEnv.DATABASE_URL, fileMustExist: true },
    { timestampFormat: "unixepoch-ms" }
  ),
})

export type TestUser = User & { sessionToken: string }

const uniqueId = () => randomUUID().slice(0, 8)

async function createSession(user: User): Promise<TestUser> {
  const sessionToken = randomUUID()

  await prisma.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  return { ...user, sessionToken }
}

export async function createUser({
  firstName = "Tester",
  name,
}: { firstName?: string | null; name?: string } = {}) {
  const id = uniqueId()
  const user = await prisma.user.create({
    data: {
      name: name ?? `${firstName ?? "Anoniem"} ${id}`,
      firstName,
      email: `user-${id}@e2e.test`,
    },
  })

  return createSession(user)
}

export async function createAdmin() {
  const user = await prisma.user.upsert({
    where: { id: adminUserId },
    update: {},
    create: {
      id: adminUserId,
      name: "Admin E2E",
      firstName: "Admin",
      email: "admin@e2e.test",
    },
  })

  return createSession(user)
}

export async function createGroup(
  owner: User,
  {
    title = `Groep ${uniqueId()}`,
    theme = null,
    members = [],
    removed = false,
  }: {
    title?: string
    theme?: string | null
    members?: User[]
    removed?: boolean
  } = {}
) {
  return prisma.group.create({
    data: {
      title,
      theme,
      removed,
      createdAt: new Date(),
      userId: owner.id,
      members: {
        connect: [owner, ...members].map(({ id }) => ({ id })),
      },
    },
  })
}

export async function createWishlist(
  owner: User,
  {
    title = null,
    description = null,
    theme = null,
    groups = [],
  }: {
    title?: string | null
    description?: string | null
    theme?: string | null
    groups?: { id: string }[]
  } = {}
) {
  return prisma.wishlist.create({
    data: {
      title,
      description,
      theme,
      createdAt: new Date(),
      userId: owner.id,
      groups: { connect: groups.map(({ id }) => ({ id })) },
    },
  })
}

export async function createItem(
  wishlist: { id: string },
  {
    title = `Wens ${uniqueId()}`,
    url = null,
    unlimited = false,
    boughtBy = null,
  }: {
    title?: string
    url?: string | null
    unlimited?: boolean
    boughtBy?: User | null
  } = {}
) {
  return prisma.wishlistItem.create({
    data: {
      title,
      url,
      unlimited,
      createdAt: new Date(),
      wishlistId: wishlist.id,
      userId: boughtBy?.id ?? null,
    },
  })
}

export type SentEmail = {
  id: string
  to: string[]
  subject: string
  html: string
}

export async function emailsTo(address: string): Promise<SentEmail[]> {
  const response = await fetch(`${mailURL}/__emails`)
  const emails: SentEmail[] = await response.json()

  return emails.filter(({ to }) => to.includes(address))
}

export const toasts = (page: Page) =>
  page.locator('[role="region"][aria-label^="Notifications"]')

type Fixtures = {
  signIn: (user: TestUser) => Promise<Page>
}

export const test = base.extend<Fixtures>({
  signIn: async ({ browser }, use) => {
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = []

    await use(async user => {
      const context = await browser.newContext({ baseURL })

      await context.addCookies([
        {
          name: "next-auth.session-token",
          value: user.sessionToken,
          url: baseURL,
        },
      ])
      contexts.push(context)

      return context.newPage()
    })

    await Promise.all(contexts.map(context => context.close()))
  },
})

export { expect }
