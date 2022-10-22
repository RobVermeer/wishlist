import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { PageTitle } from "../../../components/PageTitle"
import styles from "../../../styles/Profile.module.css"

function ProfileWishlistsPage() {
  const [title, setTitle] = useState("")
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["wishlists"], () =>
    fetch("/api/wishlists").then((res) => res.json())
  )
  const { data: wishlists = [] } = data
  const remove = useMutation(
    (wishlistId) => {
      return fetch("/api/user/wishlist/remove", {
        method: "delete",
        body: JSON.stringify({ wishlistId }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists"])
      },
    }
  )

  const create = useMutation(
    () => {
      return fetch("/api/wishlists", {
        method: "post",
        body: JSON.stringify({ title }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists"])
        setTitle("")
      },
    }
  )

  return (
    <div className={styles.container}>
      <PageTitle>Manage wishlists</PageTitle>
      <ul>
        {wishlists.map((wishlist) => {
          console.log(wishlist)

          return (
            <li key={wishlist.id}>
              {wishlist.title}{" "}
              <button onClick={() => remove.mutate(wishlist.id)}>remove</button>
            </li>
          )
        })}
      </ul>

      <form
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate()
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <button type="submit">Create new wishlist</button>
      </form>
    </div>
  )
}

export default ProfileWishlistsPage
