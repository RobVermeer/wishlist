import { authOptions } from "@/app/[locale]/api/auth/[...nextauth]/route"
import { Wishlist } from "@/components/Wishlist"
import { getGroupById } from "@/lib/groups/getGroupById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

interface Props {
  params: { wishlistId: string; groupId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupId, wishlistId } = params

  const wishlist = await getWishlistById(wishlistId)
  const group = await getGroupById(groupId)

  if (!wishlist || !group) return {}

  return {
    title: `${
      wishlist.title ||
      wishlist.user.firstName ||
      wishlist.user.name?.split(" ")[0]
    } - ${group.title} - Wishlist`,
  }
}

export default async function GroupWishlistPage({ params }: Props) {
  const { wishlistId, groupId } = params
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect(
      `/login?callbackUrl=${encodeURIComponent(
        `/group/${groupId}/${wishlistId}`
      )}`
    )
  }

  return <Wishlist id={wishlistId} groupId={groupId} />
}
