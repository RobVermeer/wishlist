import { Card } from "@/components/Card"
import type { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { InfinityIcon } from "lucide-react"
import { EditItem } from "@/components/EditItem"
import { ItemTitle } from "@/components/ItemTitle"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
  categories: string[]
}

export const YourItemCard = ({ item, categories }: Props) => {
  const { title, links, unlimited } = item

  return (
    <Card className="flex items-center pr-24">
      {unlimited && <InfinityIcon className="mr-1 shrink-0 self-start" />}
      <ItemTitle title={title} links={links} />

      <EditItem
        item={{
          id: item.id,
          title,
          links: links.map(({ url }) => url),
          unlimited,
          category: item.category,
        }}
        categories={categories}
      />
    </Card>
  )
}
