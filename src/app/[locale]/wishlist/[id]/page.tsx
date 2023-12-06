import { Wishlist } from "@/components/Wishlist"
import { Suspense } from "react"
import { WishlistSkeleton } from "@/components/WishlistSkeleton/index."

interface Props {
  params: { id: string; locale: string }
}

export default async function WishlistPage({ params }: Props) {
  const { id } = params

  return (
    <Suspense fallback={<WishlistSkeleton />}>
      <Wishlist id={id} />
    </Suspense>
  )
}
