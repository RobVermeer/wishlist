import { Card } from "@/components/Card"
import type { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { clsx } from "clsx"
import { Link } from "lucide-react"
import { ToggleItem } from "@/components/ToggleItem"
import { useTranslations } from "next-intl"
import { UnlimitedItem } from "../UnlimitedItem"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
}

export const ItemCard = ({ item }: Props) => {
  const { id, title, url, boughtBy, boughtByMe, unlimited } = item
  const t = useTranslations("Toggle")
  const bought = Boolean(boughtBy) && !unlimited

  return (
    <Card className="flex flex-wrap items-center gap-2">
      <span
        className={clsx(
          "flex-1",
          bought && "line-through decoration-primary decoration-2"
        )}
      >
        {url ? (
          <a href={url} target="_blank" rel="ugc nofollow noopener noreferrer">
            <Link size="16" strokeWidth="2.5" className="inline mr-1" /> {title}
          </a>
        ) : (
          title
        )}
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
