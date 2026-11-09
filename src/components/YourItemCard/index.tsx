import { Card } from "@/components/Card"
import type { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { InfinityIcon } from "lucide-react"
import { EditItem } from "@/components/EditItem"
import { ItemTitle } from "@/components/ItemTitle"
import { useTranslations } from "next-intl"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
  categories: string[]
  wishlistId: string
  wishlists: { id: string; name: string }[]
}

export const YourItemCard = ({
  item,
  categories,
  wishlistId,
  wishlists,
}: Props) => {
  const { title, links, unlimited } = item
  const t = useTranslations("Toggle")

  return (
    <Card className="flex items-center pr-24">
      {unlimited && (
        <>
          <InfinityIcon aria-hidden className="mr-1 shrink-0 self-start" />
          <span className="sr-only">{t("unlimitedLabel")}</span>
        </>
      )}
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
        wishlistId={wishlistId}
        wishlists={wishlists}
      />
    </Card>
  )
}
