import { Card } from "@/components/Card"
import type { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { InfinityIcon, Link } from "lucide-react"
import { EditItem } from "@/components/EditItem"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
  categories: string[]
}

export const YourItemCard = ({ item, categories }: Props) => {
  const { title, unlimited } = item
  const url = item.links[0]?.url

  return (
    <Card className="flex items-center pr-24">
      {unlimited && <InfinityIcon className="mr-1" />}
      {url && (
        <a href={url} target="_blank" rel="ugc nofollow noopener noreferrer">
          <Link size="16" strokeWidth="2.5" className="inline mr-1" /> {title}
        </a>
      )}

      {!url && title}

      <EditItem
        item={{
          id: item.id,
          title,
          url: url ?? null,
          unlimited,
          category: item.category,
        }}
        categories={categories}
      />
    </Card>
  )
}
