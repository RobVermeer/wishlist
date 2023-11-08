import { getWishlistById } from "@/lib/wishlists/getWishlistById"

interface Props {
  showGroups?: boolean
  wishlist: Awaited<ReturnType<typeof getWishlistById>>
}

export const WishlistTitle = ({ wishlist, showGroups = false }: Props) => {
  const { title, user, groups, isOwnList } = wishlist
  const listTitle =
    title ||
    (isOwnList ? "Mijn lijstje" : user.firstName || user.name?.split(" ")[0])

  if (!showGroups) {
    return <>{listTitle}</>
  }

  const inGroups = groups
    .map(({ title }) => title)
    .join(", ")
    .replace(/,([^,]+)$/i, " & $1")

  return (
    <span>
      {listTitle}{" "}
      {inGroups && (
        <small>
          in groep{groups.length !== 1 && "en"} {inGroups}
        </small>
      )}
    </span>
  )
}
