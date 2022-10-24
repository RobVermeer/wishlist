import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useRef, useState } from "react"
import { Button } from "~/components/Button"
import { Cards } from "~/components/Card"
import { Dialog } from "~/components/Dialog"
import { EditItem } from "~/components/EditItem"
import { PageTitle } from "~/components/PageTitle"
import { WishlistItem } from "~/components/WishlistItem"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfileWishlistPage() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const { query } = useRouter()
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(["wishlist", query.id], () =>
    fetch(`/api/wishlists/${query.id}`).then((res) => res.json())
  )
  const { data: wishlist } = data

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

  if (!wishlist) return <div></div>

  return (
    <div className={styles.container}>
      <PageTitle>{wishlist.title || "Mijn lijstje"}</PageTitle>

      {wishlist.wishlistItem.length === 0 && (
        <p>Je hebt nog geen wensen, maak er snel wat aan! 😎</p>
      )}

      {wishlist.wishlistItem.length > 0 && (
        <Cards>
          {wishlist.wishlistItem.map((item, index) => (
            <WishlistItem
              key={item.id}
              item={item}
              wishlistId={item.id}
              index={index}
            >
              <EditItem wishlistId={wishlist.id} item={item} />
            </WishlistItem>
          ))}
        </Cards>
      )}

      <Button
        className={styles.button}
        variant="primary"
        onClick={() => setOpen(true)}
      >
        Add new item
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Voeg wens toe 🤠"
      >
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault()
            create.mutate({
              title,
              url,
            })
            setOpen(false)
          }}
        >
          <label htmlFor="title">Wens</label>
          <input
            required
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label htmlFor="url">
            URL <small>(optioneel)</small>
          </label>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button variant="primary" type="submit">
            Voeg wens toe
          </Button>
        </form>
      </Dialog>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async () => ({
    props: { title: "Wishlist" },
  }))
}

export default ProfileWishlistPage
