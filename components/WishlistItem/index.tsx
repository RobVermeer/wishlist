import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CSSProperties } from "react"
import styles from "./WishlistItem.module.css"

const Checkbox = ({ wishlistId, item }) => {
  const queryClient = useQueryClient()

  const { mutate } = useMutation(
    (id) => {
      return fetch(`/api/wishlists/${wishlistId}/item/${id}/check`, {
        method: "put",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist", wishlistId])
      },
    }
  )

  return (
    <div className={styles.checkbox}>
      <input
        type="checkbox"
        checked={Boolean(item.boughtBy)}
        onChange={() => mutate(item.id)}
      />
    </div>
  )
}

export const WishlistItem = ({ wishlistId, item, children = null, index }) => {
  const { url, title } = item
  const checked = Boolean(item.boughtBy)
  const classNames = `${styles.item} ${checked ? styles.checked : ""}`

  return (
    <div className={classNames} style={{ "--_index": index } as CSSProperties}>
      {url ? <a href={url}>{title}</a> : title}
      {children ? children : <Checkbox wishlistId={wishlistId} item={item} />}
    </div>
  )
}
