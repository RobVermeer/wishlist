import {
  test as base,
  BrowserContextOptions,
  expect,
  Page,
} from "@playwright/test"
import { User } from "../src/generated/prisma/client"
import { prisma } from "../src/lib/prisma"
import { randomUUID } from "node:crypto"
import { adminUserId, baseURL, mailURL } from "./support/env"

export { prisma }

type TestUser = User & { sessionToken: string }

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
    followers = [],
    managers = [],
    shareToken = null,
  }: {
    title?: string | null
    description?: string | null
    theme?: string | null
    groups?: { id: string }[]
    followers?: { id: string }[]
    managers?: { id: string }[]
    shareToken?: string | null
  } = {}
) {
  return prisma.wishlist.create({
    data: {
      title,
      description,
      theme,
      shareToken,
      createdAt: new Date(),
      userId: owner.id,
      groups: { connect: groups.map(({ id }) => ({ id })) },
      followers: { connect: followers.map(({ id }) => ({ id })) },
      managers: { connect: managers.map(({ id }) => ({ id })) },
    },
  })
}

export async function createCategory(
  wishlist: { id: string },
  title: string,
  position: number
) {
  return prisma.wishlistCategory.create({
    data: { title, position, wishlistId: wishlist.id },
  })
}

export async function createItem(
  wishlist: { id: string },
  {
    title = `Wens ${uniqueId()}`,
    url = null,
    unlimited = false,
    boughtBy = null,
    category = null,
  }: {
    title?: string
    url?: string | null
    unlimited?: boolean
    boughtBy?: User | null
    category?: { id: string } | null
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
      categoryId: category?.id ?? null,
      position: await prisma.wishlistItem.count({
        where: { wishlistId: wishlist.id },
      }),
    },
  })
}

// Each participant draws the next one, the last one draws the first.
export async function createDraw(
  group: { id: string },
  participants: (User | { name: string; email: string })[],
  {
    budget = null,
    date = null,
    cancelled = false,
    lastSentAt = new Date(),
  }: {
    budget?: number | null
    date?: Date | null
    cancelled?: boolean
    lastSentAt?: Date
  } = {}
) {
  const draw = await prisma.draw.create({
    data: {
      groupId: group.id,
      createdAt: new Date(),
      cancelledAt: cancelled ? new Date() : null,
      budget,
      date,
    },
  })
  const rows = []

  for (const participant of participants) {
    const isUser = "id" in participant
    rows.push(
      await prisma.drawParticipant.create({
        data: {
          drawId: draw.id,
          name: isUser
            ? (participant.firstName ?? participant.name ?? "")
            : participant.name,
          email: participant.email!.toLowerCase(),
          userId: isUser ? participant.id : null,
          lastSentAt,
        },
      })
    )
  }

  for (const [index, row] of rows.entries()) {
    await prisma.drawParticipant.update({
      where: { id: row.id },
      data: { receiverId: rows[(index + 1) % rows.length].id },
    })
  }

  return { draw, participants: rows }
}

type SentEmail = {
  id: string
  to: string[]
  subject: string
  html: string
  replyTo: string[]
}

export async function emailsTo(address: string): Promise<SentEmail[]> {
  const response = await fetch(`${mailURL}/__emails`)
  const emails: SentEmail[] = await response.json()

  return emails.filter(({ to }) => to.includes(address))
}

type TrackedIssue = {
  message: string
  level: string
  extra: Record<string, unknown>
}

export async function trackedIssues(): Promise<TrackedIssue[]> {
  const response = await fetch(`${mailURL}/__issues`)
  return response.json()
}

export const toasts = (page: Page) =>
  page.locator('[role="region"][aria-label^="Notifications"]')

type Fixtures = {
  signIn: (user: TestUser, options?: BrowserContextOptions) => Promise<Page>
}

export const test = base.extend<Fixtures>({
  signIn: async ({ browser }, use) => {
    const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = []

    await use(async (user, options) => {
      const context = await browser.newContext({ ...options, baseURL })

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
