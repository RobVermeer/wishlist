"use client"

import { CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { toggleWishlistItemById } from "@/lib/wishlistItems/toggleWishlistItemById"

interface Props {
  item: Awaited<ReturnType<typeof getWishlistById>>["wishlistItem"][0]
}

export const ToggleItem = ({ item }: Props) => {
  const { id, boughtBy } = item

  async function onToggle() {
    try {
      await toggleWishlistItemById(id)
    } catch (error) {
      alert(error)
    }
  }

  return (
    <form action={onToggle} className="ml-auto">
      <Button type="submit" variant="ghost" size="icon">
        {boughtBy ? <CheckSquare /> : <Square />}
      </Button>
    </form>
  )
}
