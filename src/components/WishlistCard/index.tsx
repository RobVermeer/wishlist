import type { ComponentProps } from "react"
import { Card } from "@/components/Card"
import Link from "next/link"
import { WishlistTitle } from "@/components/WishlistTitle"
import type { getGroupById } from "@/lib/groups/getGroupById"

interface Props {
  wishlist: { id: string } & ComponentProps<typeof WishlistTitle>["wishlist"]
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
