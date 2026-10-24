import "server-only"

import { prisma } from "@/lib/prisma"
import { managedByUser } from "@/lib/wishlists/visibility"

// The wishlists that leave a group with a member: the ones they manage, unless
// someone else who manages it is still in the group.
export async function getWishlistsLeavingGroup(
  groupId: string,
  userId: string
) {
  const otherManagerInGroup = {
    subscribed: { some: { id: groupId } },
    NOT: { id: userId },
  }

  return prisma.wishlist.findMany({
    where: {
      ...managedByUser(userId),
      groups: { some: { id: groupId } },
      NOT: {
        OR: [
          { user: otherManagerInGroup },
          { managers: { some: otherManagerInGroup } },
        ],
      },
    },
    select: { id: true },
  })
}
