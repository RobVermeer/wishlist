import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useState } from "react"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfileWishlistsPage({ session }) {
  const { userId } = session
  const [title, setTitle] = useState("")
  const [groupsForWishlist, setGroupsForWishlist] = useState([])
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["wishlists", userId], () =>
    fetch("/api/user/wishlists").then((res) => res.json())
  )
  const { data: wishlists = [] } = data
  const { data: groupsData = {} } = useQuery(["groups", userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )
  const { data: groups = [] } = groupsData
  const remove = useMutation(
    (wishlistId) => {
      return fetch(`/api/user/wishlists/${wishlistId}/remove`, {
        method: "delete",
        body: JSON.stringify({ wishlistId }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", userId])
      },
    }
  )

  const create = useMutation(
    () => {
      return fetch("/api/user/wishlists/create", {
        method: "post",
        body: JSON.stringify({
          title,
          groups: groupsForWishlist,
        }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", userId])
        setTitle("")
      },
    }
  )
  const subscribe = useMutation(
    ({ wishlistId, groupId }: { wishlistId: string; groupId: string }) => {
      return fetch(`/api/user/wishlists/${wishlistId}/subscribe`, {
        method: "post",
        body: JSON.stringify({
          groupId,
        }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", userId])
      },
    }
  )
  const update = useMutation(
    ({ id, data }: { id: string; data: object }) => {
      return fetch(`/api/user/wishlists/${id}/edit`, {
        method: "put",
        body: JSON.stringify(data),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", userId])
      },
    }
  )

  return (
    <div className={styles.container}>
      <PageTitle>Manage wishlists</PageTitle>
      <ul>
        {wishlists.map((wishlist) => (
          <li key={wishlist.id}>
            {wishlist.title || "Mijn lijstje"}{" "}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.target as HTMLFormElement
                const data = new FormData(form)
                update.mutate({
                  id: wishlist.id,
                  data: {
                    title: data.get("title"),
                  },
                })
              }}
            >
              <input type="text" name="title" defaultValue={wishlist.title} />
              <button type="submit">Bewerk verlanglijstje</button>
            </form>
            {groups.map((group) => (
              <label key={group.id}>
                <input
                  type="checkbox"
                  name="groups"
                  checked={wishlist.groups
                    .map(({ id }) => id)
                    .includes(group.id)}
                  onChange={() => {
                    subscribe.mutate({
                      wishlistId: wishlist.id,
                      groupId: group.id,
                    })
                  }}
                />
                {group.title}
              </label>
            ))}
            <button onClick={() => remove.mutate(wishlist.id)}>
              Verwijder
            </button>
          </li>
        ))}
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
        {groups.map((group) => (
          <label key={group.id} htmlFor={group.id}>
            <input
              type="checkbox"
              name="groups"
              id={group.id}
              checked={groupsForWishlist.includes(group.id)}
              onChange={() =>
                setGroupsForWishlist((prev) => {
                  if (prev.includes(group.id)) {
                    return prev.filter((g) => g !== group.id)
                  } else {
                    return [...prev, group.id]
                  }
                })
              }
            />
            {group.title}
          </label>
        ))}
        <button type="submit">Nieuw verlanglijstje</button>
      </form>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({
    props: { title: "Profile - Wishlists" },
  }))
}

export default ProfileWishlistsPage
