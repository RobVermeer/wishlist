import { authOptions } from "@/lib/nextAuth"
import { Wishlist } from "@/components/Wishlist"
import { getGroupById } from "@/lib/groups/getGroupById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { notFound, redirect } from "next/navigation"
import { BackLink } from "@/components/BackLink"

interface Props {
  params: Promise<{ wishlistId: string; groupId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId, wishlistId } = await params

  const wishlist = await getWishlistById(wishlistId)
  const group = await getGroupById(groupId)

  if (!wishlist || !group) return {}

  return {
    title: `${
      wishlist.title ||
      wishlist.user.firstName ||
      wishlist.user.name?.split(" ")[0]
    } - ${group.title} - Niet Weer Sokken`,
  }
}

export default async function GroupWishlistPage({ params }: Props) {
  const { wishlistId, groupId } = await params
  const session = await getServerSession(authOptions)

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
