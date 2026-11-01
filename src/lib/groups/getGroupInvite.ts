import "server-only"

import { prisma } from "@/lib/prisma"
import { cache } from "react"

// Only the name: anyone with the link of a group sees it, also before they log
// in, so the invitation and its preview can say which group it is.
export const getGroupInvite = cache(async (id: string) =>
  prisma.group.findUnique({
    where: { id, removed: false },
    select: { id: true, title: true },
  })
)
