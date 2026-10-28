import "server-only"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { getTranslations } from "next-intl/server"

export const getStats = async () => {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("Errors")

  if (!session) {
    throw new Error(t("notLoggedIn"))
  }

  if (!session.user.isAdmin) {
    throw new Error(t("noAccess"))
  }

  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)
  const activeItem = { removed: false, wishlist: { removed: false } }
  const activeDraw = { cancelledAt: null, group: { removed: false } }

  const [
    users,
    activeUsers,
    wishlists,
    removedWishlists,
    wishlistsForSomeoneElse,
    groups,
    removedGroups,
    items,
    boughtItems,
    removedItems,
    draws,
    participants,
    invitedParticipants,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastSeenAt: { gte: yearAgo } } }),
    prisma.wishlist.count({ where: { removed: false } }),
    prisma.wishlist.count({ where: { removed: true } }),
    prisma.wishlist.count({ where: { removed: false, title: { not: null } } }),
    prisma.group.findMany({
      where: { removed: false },
      select: { _count: { select: { members: true } } },
    }),
    prisma.group.count({ where: { removed: true } }),
    prisma.wishlistItem.count({ where: activeItem }),
    prisma.wishlistItem.count({
      where: { ...activeItem, userId: { not: null } },
    }),
    prisma.wishlistItem.count({
      where: { OR: [{ removed: true }, { wishlist: { removed: true } }] },
    }),
    prisma.draw.count({ where: activeDraw }),
    prisma.drawParticipant.count({ where: { draw: activeDraw } }),
    prisma.drawParticipant.count({ where: { draw: activeDraw, userId: null } }),
  ])

  const members = groups.reduce((sum, group) => sum + group._count.members, 0)

  return {
    users: { total: users, active: activeUsers },
    wishlists: {
      active: wishlists,
      removed: removedWishlists,
      forSomeoneElse: wishlistsForSomeoneElse,
    },
    groups: {
      active: groups.length,
      removed: removedGroups,
      averageMembers: groups.length ? members / groups.length : 0,
    },
    items: { active: items, bought: boughtItems, removed: removedItems },
    draws: {
      active: draws,
      participants,
      invited: invitedParticipants,
    },
  }
}
