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

  const userCount = await prisma.user.count()
  const wishlistCount = await prisma.wishlist.count()
  const groupCount = await prisma.group.count()
  const itemCount = await prisma.wishlistItem.count()

  return { userCount, wishlistCount, groupCount, itemCount }
}
