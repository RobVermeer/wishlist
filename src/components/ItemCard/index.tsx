import { Card } from "@/components/Card"
import type { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { clsx } from "clsx"
import { ItemTitle } from "@/components/ItemTitle"
import { ToggleItem } from "@/components/ToggleItem"
import { useTranslations } from "next-intl"
import { UnlimitedItem } from "../UnlimitedItem"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
}

export const ItemCard = ({ item }: Props) => {
  const { id, title, links, boughtBy, boughtAt, boughtByMe, unlimited } = item
  const t = useTranslations("Toggle")
  const bought = Boolean(boughtBy || boughtAt) && !unlimited

  return (
    <Card className="flex flex-wrap items-center gap-2">
      <span className="flex-1">
        <ItemTitle
          title={title}
          links={links}
          className={clsx(
            bought && "line-through decoration-primary decoration-2"
          )}
        />
      </span>

      {unlimited ? (
        <UnlimitedItem />
      ) : bought && !boughtByMe ? (
        <span className="shrink-0 text-sm text-muted-foreground">
          {t("boughtByOther")}
        </span>
      ) : (
        <ToggleItem id={id} boughtByMe={boughtByMe} />
      )}
    </Card>
  )
}
