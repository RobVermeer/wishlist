import { Wishlist } from "@/components/Wishlist"
import { getGroupById } from "@/lib/groups/getGroupById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Metadata } from "next"

interface Props {
  params: { wishlistId: string; groupId: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const wishlist = await getWishlistById(params.wishlistId)
  const group = await getGroupById(params.groupId)

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

  return <Wishlist id={wishlistId} groupId={groupId} />
}
