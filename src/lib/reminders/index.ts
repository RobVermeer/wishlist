"use server"

import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/getSession"
import { revalidatePath } from "next/cache"
import { getErrorMessage } from "@/lib/utils"
import { getTranslations } from "next-intl/server"
import { sendReminder } from "@/lib/email"
import { canBeRemindedForWishlist } from "./canBeRemindedForWishlist"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"
import { managedByUser, sharedWithUser } from "@/lib/wishlists/visibility"

export const sendReminderForWishlist = async (wishlistId: string) => {
  try {
    const session = await getSession()
    const t = await getTranslations("Errors")

    if (!session) {
      throw new Error(t("notLoggedIn"))
    }

    const from = session.user.id

    const recipient = { id: true, firstName: true, name: true, email: true }
    const wishlist = await prisma.wishlist.findFirst({
      where: {
        id: wishlistId,
        removed: false,
        AND: [sharedWithUser(from), { NOT: managedByUser(from) }],
      },
      select: {
        id: true,
        title: true,
        userId: true,
        user: { select: recipient },
        managers: { select: recipient },
      },
    })

    if (!wishlist) {
      throw new Error(t("wishlist.notFound"))
    }

    const canBeReminded = await canBeRemindedForWishlist(wishlist.id)

    if (!canBeReminded) {
      throw new Error(t("reminder.alreadySent"))
    }

    // The owner and everyone who manages the list with them can add wishes
    for (const toUser of [wishlist.user, ...wishlist.managers]) {
      await sendReminder({
        toUser,
        wishlist: {
          id: wishlist.id,
          // Someone's own list reads as "your list" to them, any other list
          // is named after who it's for
          name:
            toUser.id === wishlist.userId && !wishlist.title
              ? null
              : getWishlistName(wishlist),
        },
      })
    }

    await prisma.reminder.create({
      data: {
        to: wishlist.userId,
        from,
        wishlistId: wishlist.id,
      },
    })

    revalidatePath("/")

    return {
      type: "success" as const,
    }
  } catch (error) {
    return {
      type: "error" as const,
      errors: [getErrorMessage(error)],
    }
  }
}
