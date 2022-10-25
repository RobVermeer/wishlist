import { useMutation, useQueryClient } from "@tanstack/react-query"
import styles from "./Checkbox.module.css"

export const Checkbox = ({ wishlistId, item }) => {
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
