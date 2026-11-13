import "server-only"

import { getSession } from "@/lib/getSession"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"
import { cache } from "react"
import { isSuperAdmin } from "./isSuperAdmin"

const usersPerPage = 25

// SQLite only ignores case for ASCII, so sort in JavaScript: Émile then comes
// after daan, and "Gebruiker 2" before "Gebruiker 10".
const collator = new Intl.Collator("nl", { sensitivity: "base", numeric: true })

const compareUsers = (
  a: { name: string | null; email: string | null },
  b: { name: string | null; email: string | null }
) => {
  const nameA = a.name?.trim() ?? ""
  const nameB = b.name?.trim() ?? ""

  // Users without a name go last, by e-mail address.
  if (!nameA !== !nameB) return nameA ? -1 : 1

  return (
    collator.compare(nameA, nameB) ||
    collator.compare(a.email ?? "", b.email ?? "")
  )
}

export const getUsers = cache(async (search: string, page: number) => {
  const session = await getSession()
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  if (!session.user.isAdmin) {
    throw new Error(t("noAccess"))
  }

  const matches = await prisma.user.findMany({
    where: search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {},
    select: { id: true, name: true, email: true },
  })
  const pageCount = Math.max(1, Math.ceil(matches.length / usersPerPage))
  // A page that no longer exists, after removing users, shows the last one.
  const currentPage = Math.min(Math.max(1, page), pageCount)
  const ids = matches
    .sort(compareUsers)
    .slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage)
    .map(user => user.id)

  const data = await prisma.user.findMany({ where: { id: { in: ids } } })
  const users = ids
    .map(id => data.find(user => user.id === id))
    .filter(user => user !== undefined)
    .map(user => ({ ...user, isSuperAdmin: isSuperAdmin(user.id) }))

  return { users, page: currentPage, pageCount }
})
