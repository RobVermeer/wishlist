import { useSession } from "next-auth/react"
import { Card } from "~/components/Card"
import { EditWishlist } from "~/components/EditWishlist"
import styles from "./CardWishlist.module.css"

export const WishlistTitle = ({ wishlist, showGroups = false }) => {
  const { data } = useSession()
  const { title, user, groups } = wishlist
  const isOwnList = user.id === data.userId
  const listTitle = title || (isOwnList ? "Mijn lijstje" : user.name)

  if (!showGroups) {
    return listTitle
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

export const CardWishlist = ({
  wishlist,
  index,
  showGroups = false,
  groupId = null,
  showEdit = false,
}) => {
  const link = groupId
    ? `/group/${groupId}/${wishlist.id}`
    : `/profile/wishlists/${wishlist.id}`

  return (
    <Card
      key={wishlist.id}
      index={index}
      link={link}
      title={<WishlistTitle wishlist={wishlist} showGroups={showGroups} />}
      adornment={showEdit && <EditWishlist wishlist={wishlist} />}
    />
  )
}
