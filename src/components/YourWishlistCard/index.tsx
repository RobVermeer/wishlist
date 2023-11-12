import { Card } from "@/components/Card"
import Link from "next/link"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { EditWishlist } from "@/components/EditWishlist"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  groups: Awaited<ReturnType<typeof getGroupsForUser>>
}

export const YourWishlistCard = ({ wishlist, groups }: Props) => {
  const { id } = wishlist

  return (
    <Card className="flex items-center pr-24">
      <Link href={`/wishlist/${id}`}>
        <WishlistTitle wishlist={wishlist} showGroups />
      </Link>

      <EditWishlist wishlist={wishlist} groups={groups} />
    </Card>
  )
}
