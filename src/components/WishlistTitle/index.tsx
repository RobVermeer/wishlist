import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { useTranslations } from "next-intl"

interface Props {
  showGroups?: boolean
  wishlist: NonNullable<Awaited<ReturnType<typeof getWishlistById>>>
  className?: string
}

export const WishlistTitle = ({
  wishlist,
  showGroups = false,
  className = "",
}: Props) => {
  const t = useTranslations()
  const { title, user, groups, isOwnList } = wishlist
  const listTitle =
    title ||
    (isOwnList
      ? t("Common.myList")
      : user.firstName || user.name?.split(" ")[0])

  if (!showGroups) {
    return <span className={className}>{listTitle}</span>
  }

  const inGroups = groups
    .map(({ title }) => title)
    .join(", ")
    .replace(/,([^,]+)$/i, " & $1")

  return (
    <span className={className}>
      {listTitle}{" "}
      {inGroups && (
        <small className="text-muted-foreground">
          {t("Common.inGroup", { count: groups.length, groups: inGroups })}
        </small>
      )}
    </span>
  )
}
