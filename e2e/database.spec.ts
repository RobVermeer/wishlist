import { readdirSync, readFileSync } from "node:fs"
import { DatabaseSync } from "node:sqlite"
import { test, expect, createUser, createGroup, prisma } from "./fixtures"

test("dates are stored as unix epoch milliseconds", async ({ signIn }) => {
  const user = await createUser()
  const page = await signIn(user)
  const title = `Datum ${user.id}`.slice(0, 40)

  await page.goto("/")
  await page.getByRole("button", { name: "Nieuwe groep" }).click()
  const dialog = page.getByRole("dialog", { name: /Nieuwe groep/ })
  await dialog.getByLabel("Naam van de groep").fill(title)
  await dialog.getByRole("button", { name: "Maak aan" }).click()
  await expect(dialog).toBeHidden()

  const [group] = await prisma.$queryRaw<{ type: string; createdAt: number }[]>`
    SELECT typeof(createdAt) AS type, createdAt FROM "Group" WHERE title = ${title}
  `

  expect(group.type).toBe("integer")
  expect(Math.abs(Number(group.createdAt) - Date.now())).toBeLessThan(60_000)
})

test("changes wait for another connection that is writing", async ({
  signIn,
}) => {
  const owner = await createUser()
  const member = await createUser()
  const group = await createGroup(owner, { members: [member] })
  const page = await signIn(member)

  await page.goto(`/group/${group.id}`)
  await page.getByRole("button", { name: "Stap uit", exact: true }).click()
  const dialog = page.getByRole("dialog", { name: "Uit de groep stappen?" })

  // Hold a write lock, like the fixtures of a test running in parallel, while
  // the server leaves the group. It waits for the lock and answers once the
  // lock is released, or fails right away when it can't wait. SQLite waits
  // synchronously, so the server answers nothing else while it waits.
  await prisma.$transaction(async tx => {
    await tx.user.update({ where: { id: owner.id }, data: { firstName: "O" } })
    await dialog.getByRole("button", { name: "Stap uit de groep" }).click()
    await expect
      .poll(() =>
        page.request.get("/robots.txt", { timeout: 250 }).then(
          () => "answers",
          () => "waits"
        )
      )
      .toBe("waits")
  })

  await expect(page).toHaveURL("/")
  const { members } = await prisma.group.findUniqueOrThrow({
    where: { id: group.id },
    include: { members: true },
  })
  expect(members.map(({ id }) => id)).toEqual([owner.id])
})

test("moving links to their own table keeps the link of every wish", () => {
  const db = new DatabaseSync(":memory:")
  const migrations = readdirSync("prisma/migrations")
    .filter(name => name !== "migration_lock.toml")
    .sort()
  const migrate = (name: string) =>
    db.exec(readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8"))
  const links = migrations.findIndex(name =>
    name.endsWith("_add_wishlist_item_links")
  )

  migrations.slice(0, links).forEach(migrate)
  db.exec(`
    INSERT INTO "User" ("id") VALUES ('user');
    INSERT INTO "Wishlist" ("id", "createdAt", "userId") VALUES ('list', 0, 'user');
    INSERT INTO "WishlistItem" ("id", "title", "createdAt", "wishlistId", "url") VALUES
      ('bike', 'Fiets', 0, 'list', 'https://example.com/fiets'),
      ('book', 'Boek', 0, 'list', NULL),
      ('game', 'Spel', 0, 'list', '');
  `)
  migrations.slice(links).forEach(migrate)

  expect(
    db
      .prepare(
        `SELECT "wishlistItemId", "url", "position" FROM "WishlistItemLink"`
      )
      .all()
  ).toEqual([
    {
      wishlistItemId: "bike",
      url: "https://example.com/fiets",
      position: 0,
    },
  ])
})

test("dropping the old link column keeps links written during the deploy", () => {
  const db = new DatabaseSync(":memory:")
  const migrations = readdirSync("prisma/migrations")
    .filter(name => name !== "migration_lock.toml")
    .sort()
  const migrate = (name: string) =>
    db.exec(readFileSync(`prisma/migrations/${name}/migration.sql`, "utf8"))
  const drop = migrations.findIndex(name =>
    name.endsWith("_drop_wishlist_item_url")
  )
  expect(drop).toBeGreaterThan(0)

  migrations.slice(0, drop).forEach(migrate)
  // While the deploy runs, the old server still writes the old column: a new
  // wish, or a changed link of a wish that kept the link it had before. Wishes
  // nobody touched still have the link that was copied, the new server clears
  // the column on every save.
  db.exec(`
    INSERT INTO "User" ("id") VALUES ('user');
    INSERT INTO "Wishlist" ("id", "createdAt", "userId") VALUES ('list', 0, 'user');
    INSERT INTO "WishlistItem" ("id", "title", "createdAt", "wishlistId", "url") VALUES
      ('bike', 'Fiets', 0, 'list', 'https://example.com/fiets'),
      ('book', 'Boek', 0, 'list', 'https://example.com/boek'),
      ('game', 'Spel', 0, 'list', 'https://example.com/spel-2'),
      ('lamp', 'Lamp', 0, 'list', NULL),
      ('sock', 'Sokken', 0, 'list', '');
    INSERT INTO "WishlistItemLink" ("id", "url", "position", "wishlistItemId") VALUES
      ('bike', 'https://example.com/fiets', 0, 'bike'),
      ('game', 'https://example.com/spel', 0, 'game'),
      ('lamp', 'https://example.com/lamp', 0, 'lamp');
  `)
  migrations.slice(drop).forEach(migrate)

  expect(
    db
      .prepare(
        `SELECT "wishlistItemId", "url", "position" FROM "WishlistItemLink"
         ORDER BY "wishlistItemId", "position"`
      )
      .all()
  ).toEqual([
    { wishlistItemId: "bike", url: "https://example.com/fiets", position: 0 },
    { wishlistItemId: "book", url: "https://example.com/boek", position: 0 },
    { wishlistItemId: "game", url: "https://example.com/spel", position: 0 },
    { wishlistItemId: "game", url: "https://example.com/spel-2", position: 1 },
    { wishlistItemId: "lamp", url: "https://example.com/lamp", position: 0 },
  ])
  expect(
    db
      .prepare(`SELECT "name" FROM pragma_table_info('WishlistItem')`)
      .all()
      .map(({ name }) => name)
  ).not.toContain("url")
})
