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
    <Card className="flex items-center pr-24">
      {url && (
        <a href={url} target="_blank">
          <Link size="16" strokeWidth="2.5" className="inline mr-1" /> {title}
        </a>
      )}

      {!url && title}

      <EditItem item={item} />
    </Card>
  )
}
