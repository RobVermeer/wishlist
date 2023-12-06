import { Wishlist } from "@/components/Wishlist"
import { WishlistSkeleton } from "@/components/WishlistSkeleton/index."
import { Suspense } from "react"

interface Props {
  params: { wishlistId: string; groupId: string }
}

export default async function GroupWishlistPage({ params }: Props) {
  const { wishlistId, groupId } = params

  return (
    <Suspense fallback={<WishlistSkeleton />}>
      <Wishlist id={wishlistId} groupId={groupId} />
    </Suspense>
  )
}
