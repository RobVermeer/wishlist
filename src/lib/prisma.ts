import { PrismaClient } from "@/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

type Database = { prepare: (source: string) => { run: () => unknown } }

// The adapter starts transactions with a deferred BEGIN. Once such a
// transaction has read, SQLite can't wait for another connection that is
// writing and fails right away with SQLITE_BUSY ("Operation has timed out").
// BEGIN IMMEDIATE takes the write lock up front, which does wait. The app has
// a single connection, but the e2e fixtures write from their own. When BEGIN
// IMMEDIATE times out we fall back to BEGIN, because the adapter keeps its
// transaction lock when BEGIN throws.
class ImmediateTransactions extends PrismaBetterSqlite3 {
  async connect() {
    const adapter = await super.connect()
    const { client } = adapter as unknown as { client: Database }
    const prepare = client.prepare.bind(client)

    client.prepare = source =>
      source === "BEGIN"
        ? {
            run: () => {
              try {
                return prepare("BEGIN IMMEDIATE").run()
              } catch {
                return prepare(source).run()
              }
            },
          }
        : prepare(source)

    return adapter
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  const adapter = new ImmediateTransactions(
    { url: process.env.DATABASE_URL!, fileMustExist: true },
    { timestampFormat: "unixepoch-ms" }
  )

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
