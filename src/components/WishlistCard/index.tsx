import { Card } from "@/components/Card"
import Link from "next/link"
import { WishlistTitle } from "@/components/WishlistTitle"

export const WishlistCard = ({ wishlist, group }) => {
  const { id } = wishlist

  return (
    <Link href={`${group ? `/group/${group.id}` : "/wishlist"}/${id}`}>
      <Card>
        <WishlistTitle wishlist={wishlist} />
      </Card>
    </Link>
  )
}
