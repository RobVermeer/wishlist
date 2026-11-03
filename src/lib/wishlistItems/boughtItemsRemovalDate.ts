import type { Prisma } from "@/generated/prisma/client"

const day = 24 * 60 * 60 * 1000

// The groups and draws whose date counts: the current draw of each group.
export const partyGroups = {
  where: { removed: false },
  select: {
    draws: {
      where: { cancelledAt: null, date: { not: null } },
      select: { date: true },
    },
  },
} satisfies Prisma.Wishlist$groupsArgs

// Two days after the latest party in the groups of a wishlist, bought wishes
// go. Without a dated party, they stay.
export function boughtItemsRemovalDate(
  groups: { draws: { date: Date | null }[] }[]
) {
  const dates = groups.flatMap(({ draws }) =>
    draws.map(({ date }) => date!.getTime())
  )

  return dates.length ? new Date(Math.max(...dates) + 2 * day) : null
}
