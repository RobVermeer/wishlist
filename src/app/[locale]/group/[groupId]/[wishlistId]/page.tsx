import { getSession } from "@/lib/getSession"
import { Wishlist } from "@/components/Wishlist"
import { getGroupById } from "@/lib/groups/getGroupById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { BackLink } from "@/components/BackLink"
import { getTranslations } from "next-intl/server"
import { getWishlistName } from "@/lib/wishlists/getWishlistName"

interface Props {
  params: Promise<{ wishlistId: string; groupId: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId, wishlistId, locale } = await params
  const t = await getTranslations({ locale, namespace: "Common" })

  const wishlist = await getWishlistById(wishlistId)
  const group = await getGroupById(groupId)

  if (!wishlist || !group) return {}

  const title =
    wishlist.title ||
    (wishlist.isOwnList ? t("myList") : getWishlistName(wishlist))

  return {
    title: `${title} - ${group.title} - Niet Weer Sokken`,
  }
}

export default async function GroupWishlistPage({ params }: Props) {
  const { wishlistId, groupId } = await params
  const session = await getSession()

  if (!session) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/group/${groupId}/${wishlistId}`
      )}`
    )
  }

  const group = await getGroupById(groupId)

  if (!group) {
    notFound()
  }

  return (
    <Wishlist
      id={wishlistId}
      groupId={groupId}
      backLink={<BackLink href={`/group/${group.id}`} label={group.title} />}
    />
  )
}
