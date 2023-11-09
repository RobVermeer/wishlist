"use client"

import { CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { toggleWishlistItemById } from "@/lib/wishlistItems/toggleWishlistItemById"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  item: Awaited<ReturnType<typeof getWishlistById>>["wishlistItem"][0]
}

export const ToggleItem = ({ item }: Props) => {
  const { toast } = useToast()
  const { id, boughtBy } = item

  async function onToggle() {
    const { type, errors } = await toggleWishlistItemById(id)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
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
