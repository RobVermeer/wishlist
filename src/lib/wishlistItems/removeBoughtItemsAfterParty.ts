import "server-only"

import { prisma } from "@/lib/prisma"
import { today } from "@/lib/today"
import { removeEmptyCategories } from "@/lib/wishlistCategories"
import { boughtItemsRemovalDate, partyGroups } from "./boughtItemsRemovalDate"
import { bought } from "./bought"

// Removes what was bought for a party once it's two days over, like the
// owner removes a wish, so buyers keep it under their bought presents.
// Unlimited wishes and wishes bought after that day stay. Runs before wishes
// are shown or counted, for one verlanglijstje or all of them, and needs no
// scheduled job. Only wishlists with a party that is two days over are read.
export async function removeBoughtItemsAfterParty(wishlistId?: string) {
  const now = new Date(today())
  const partyOver = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
  const items = await prisma.wishlistItem.findMany({
    where: {
      removed: false,
      unlimited: false,
      ...bought,
      wishlist: {
        id: wishlistId,
        groups: {
          some: {
            removed: false,
            draws: { some: { cancelledAt: null, date: { lte: partyOver } } },
          },
        },
      },
    },
    select: {
      id: true,
      boughtAt: true,
      wishlist: { select: { id: true, groups: partyGroups } },
    },
  })
  const due = items.filter(({ boughtAt, wishlist }) => {
    const removeOn = boughtItemsRemovalDate(wishlist.groups)

    return removeOn && removeOn <= now && (!boughtAt || boughtAt < removeOn)
  })

  if (!due.length) return

  await prisma.$transaction(async tx => {
    await tx.wishlistItem.updateMany({
      where: { id: { in: due.map(({ id }) => id) } },
      data: { removed: true },
    })

    for (const wishlistId of new Set(due.map(({ wishlist }) => wishlist.id))) {
      await removeEmptyCategories(tx, wishlistId)
    }
  })
}
