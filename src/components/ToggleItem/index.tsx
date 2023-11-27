"use client"

import { CheckSquare, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { toggleWishlistItemById } from "@/lib/wishlistItems/toggleWishlistItemById"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
  checked: string
  undo: string
}

export const ToggleItem = ({ item, checked, undo }: Props) => {
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

    toast({
      title: boughtBy ? undo : checked,
    })
  }

  return (
    <form action={onToggle} className="absolute right-1">
      <Button type="submit" variant="ghost" size="icon">
        {boughtBy ? (
          <CheckSquare className="text-primary" strokeWidth="2.5" />
        ) : (
          <Square className="text-secondary-foreground" strokeWidth="2.5" />
        )}
      </Button>
    </form>
  )
}
