import { Card } from "@/components/Card"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { clsx } from "clsx"
import { Link } from "lucide-react"
import { useMemo } from "react"
import { ToggleItem } from "../ToggleItem"

interface Props {
  item: Awaited<ReturnType<typeof getWishlistById>>["wishlistItem"][0]
}

export const ItemCard = ({ item }: Props) => {
  const { title, url, boughtBy } = item

  const className = useMemo(() => {
    if (boughtBy) {
      return "line-through text-slate-400"
    }

    return ""
  }, [boughtBy])

  return (
    <Card className={clsx(className, "flex items-center")}>
      {url && (
        <a href={url} className="inline-flex gap-2 items-center">
          <Link size="16" /> {title}
        </a>
      )}

      {!url && title}

      <ToggleItem item={item} />
    </Card>
  )
}
