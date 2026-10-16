import Link from "next/link"
import { WishlistIcon } from "@/components/WishlistIcon"
import { WishlistTitle } from "@/components/WishlistTitle"
import { ComponentProps } from "react"

interface Props {
  wishlist: ComponentProps<typeof WishlistTitle>["wishlist"] & {
    id: string
    theme: string | null
  }
}

export const WishlistTile = ({ wishlist }: Props) => (
  <Link
    href={`/wishlist/${wishlist.id}`}
    className="group aspect-video flex gap-3 flex-col items-center justify-center font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all"
  >
    <WishlistIcon
      theme={wishlist.theme}
      className="absolute group-hover:text-primary opacity-20 group-hover:opacity-100 relative -top-4 transition-all"
    />
    <WishlistTitle
      className="text-center px-2 absolute bottom-3"
      wishlist={wishlist}
    />
  </Link>
)
