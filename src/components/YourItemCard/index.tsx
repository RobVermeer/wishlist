import { Card } from "@/components/Card"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Link } from "lucide-react"
import { EditItem } from "@/components/EditItem"

interface Props {
  item: Awaited<ReturnType<typeof getWishlistById>>["wishlistItem"][0]
}

export const YourItemCard = ({ item }: Props) => {
  const { title, url } = item

  return (
    <Card className="flex items-center">
      {url && (
        <a href={url} className="inline-flex gap-2 items-center">
          <Link size="16" /> {title}
        </a>
      )}

      {!url && title}

      <EditItem item={item} />
    </Card>
  )
}
