import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useState } from "react"
import { Cards } from "~/components/Card"
import { PageTitle } from "~/components/PageTitle"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function WishlistPage() {
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const { query } = useRouter()
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["wishlist", query.id], () =>
    fetch(`/api/wishlists/${query.id}`).then((res) => res.json())
  )
  const { data: wishlist } = data
  const update = useMutation(
    ({ id, data }: { id: string; data: object }) => {
      return fetch(`/api/user/wishlists/${query.id}/item/${id}/edit`, {
        method: "put",
        body: JSON.stringify(data),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist", query.id])
      },
    }
  )
  const create = useMutation(
    (data: { title: string; url: string }) => {
      return fetch(`/api/user/wishlists/${query.id}/item/create`, {
        method: "post",
        body: JSON.stringify(data),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        setTitle("")
        setUrl("")
        queryClient.invalidateQueries(["wishlist", query.id])
      },
    }
  )
  const remove = useMutation(
    (id) => {
      return fetch(`/api/user/wishlists/${query.id}/item/${id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist", query.id])
      },
    }
  )

  if (!wishlist) return <div></div>

  return (
    <div className={styles.container}>
      <PageTitle>{wishlist.title}</PageTitle>
      <Cards>
        {wishlist.wishlistItem.map((item) => (
          <div key={item.id}>
            {item.title} - {item.url}
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.target as HTMLFormElement
                const data = new FormData(form)
                update.mutate({
                  id: item.id,
                  data: {
                    title: data.get("title"),
                    url: data.get("url"),
                  },
                })
              }}
            >
              <input type="text" name="title" defaultValue={item.title} />
              <input type="text" name="url" defaultValue={item.url} />
              <button type="submit">Edit item</button>
            </form>
            <button onClick={() => remove.mutate(item.id)}>Remove item</button>
          </div>
        ))}
      </Cards>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          create.mutate({
            title,
            url,
          })
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          type="text"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
        <button type="submit">Add item</button>
      </form>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({
    props: { title: "Wishlist" },
  }))
}

export default WishlistPage
