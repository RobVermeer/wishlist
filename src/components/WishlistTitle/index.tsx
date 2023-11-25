import { getWishlistById } from "@/lib/wishlists/getWishlistById"

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
  const { title, user, groups, isOwnList } = wishlist
  const listTitle =
    title ||
    (isOwnList ? "Mijn lijstje" : user.firstName || user.name?.split(" ")[0])

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
          in groep{groups.length !== 1 && "en"} {inGroups}
        </small>
      )}
    </span>
  )
}
