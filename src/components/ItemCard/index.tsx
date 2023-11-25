import { Card } from "@/components/Card"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { clsx } from "clsx"
import { Link } from "lucide-react"
import { ToggleItem } from "@/components/ToggleItem"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
}

export const ItemCard = ({ item }: Props) => {
  const { title, url, boughtBy } = item

  return (
    <Card
      className={clsx(
        "flex items-center pr-12",
        boughtBy && "line-through decoration-primary decoration-2"
      )}
    >
      {url && (
        <a href={url} target="_blank">
          <Link size="16" strokeWidth="2.5" className="inline mr-1" /> {title}
        </a>
      )}

      {!url && title}

      <ToggleItem item={item} />
    </Card>
  )
}
