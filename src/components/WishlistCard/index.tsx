import { Card } from "@/components/Card"
import Link from "next/link"
import { WishlistTitle } from "@/components/WishlistTitle"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { getGroupById } from "@/lib/groups/getGroupById"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  group?: NonNullable<Awaited<ReturnType<typeof getGroupById>>>
}

export const WishlistCard = ({ wishlist, group }: Props) => {
  const { id } = wishlist

  return (
    <Link href={`${group ? `/group/${group.id}` : "/wishlist"}/${id}`}>
      <Card>
        <WishlistTitle wishlist={wishlist} />
      </Card>
    </Link>
  )
}
