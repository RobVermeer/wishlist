import { Card } from "@/components/Card"
import Link from "next/link"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { EditWishlist } from "@/components/EditWishlist"
import { getGroups } from "@/lib/groups/getGroups"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  groups: Awaited<ReturnType<typeof getGroups>>
}

export const YourWishlistCard = ({ wishlist, groups }: Props) => {
  const { id } = wishlist

  return (
    <Card className="flex items-center">
      <Link href={`/wishlist/${id}`}>
        <WishlistTitle wishlist={wishlist} />
      </Link>

      <EditWishlist wishlist={wishlist} groups={groups} />
    </Card>
  )
}
