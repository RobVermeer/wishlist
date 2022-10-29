import { useSession } from "next-auth/react"
import { Card } from "~/components/Card"
import { EditWishlist } from "~/components/EditWishlist"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"
import styles from "./CardWishlist.module.css"

interface WishlistTitleProps {
  wishlist: WishlistProperties
  showGroups?: boolean
  isOwn?: boolean
}

export const WishlistTitle = ({
  wishlist,
  showGroups = false,
  isOwn = false,
}: WishlistTitleProps) => {
  const { title, user, groups } = wishlist
  const listTitle =
    title ||
    (isOwn ? "Mijn lijstje" : user.firstName || user.name?.split(" ")[0])

  if (!showGroups) {
    return <>{listTitle}</>
  }

  const inGroups = groups
    .map(({ title }) => title)
    .join(", ")
    .replace(/,([^,]+)$/i, " & $1")

  return (
    <span className={styles.title}>
      {listTitle}{" "}
      {inGroups && (
        <small>
          in groep{groups.length !== 1 && "en"} {inGroups}
        </small>
      )}
    </span>
  )
}

interface CardWishlistProps {
  wishlist: WishlistProperties
  index: number
  showGroups?: boolean
  groupId?: string
  showEdit?: boolean
}

export const CardWishlist = ({
  wishlist,
  index,
  showGroups = false,
  groupId,
  showEdit = false,
}: CardWishlistProps) => {
  const { data } = useSession()
  const isOwn = wishlist.user.id === data?.userId
  const link = groupId
    ? `/group/${groupId}/${wishlist.id}`
    : `/profile/wishlists/${wishlist.id}`

  return (
    <Card
      key={wishlist.id}
      index={index}
      link={link}
      title={
        <WishlistTitle
          wishlist={wishlist}
          showGroups={showGroups}
          isOwn={isOwn}
        />
      }
      adornment={showEdit && <EditWishlist wishlist={wishlist} />}
      isOwn={isOwn}
    />
  )
}
