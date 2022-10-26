import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { WishlistTitle } from "~/components/CardWishlist"
import { Dialog } from "~/components/Dialog"
import { EditItem } from "~/components/EditItem"
import { Form } from "~/components/Form"
import { PageTitle } from "~/components/PageTitle"
import { getWishlistById } from "~/lib/wishlists/getWishlistById"
import styles from "~/styles/Profile.module.css"
import { withBaseProps } from "~/utils/withBaseProps"

function ProfileWishlistPage({ initialData }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const { query } = useRouter()
  const queryClient = useQueryClient()
  const { data = {} } = useQuery(
    ["wishlists", query.id],
    () => fetch(`/api/wishlists/${query.id}`).then((res) => res.json()),
    { initialData }
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
        queryClient.invalidateQueries(["wishlists", query.id])
      },
    }
  )

  if (!wishlist) return <div></div>

  return (
    <div>
      <PageTitle>
        <WishlistTitle wishlist={wishlist} />
      </PageTitle>

      {wishlist.wishlistItem.length === 0 && (
        <p>Je hebt nog geen wensen, maak er snel wat aan! 😎</p>
      )}

      <Cards>
        {wishlist.wishlistItem.map((item, index) => (
          <Card
            key={item.id}
            title={item.title}
            url={item.url}
            index={index}
            adornment={<EditItem wishlistId={wishlist.id} item={item} />}
          />
        ))}

        <Button
          className={styles.button}
          variant="primary"
          onClick={() => setOpen(true)}
        >
          Voeg een wens toe
        </Button>
      </Cards>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Voeg wens toe 🤠"
      >
        <Form
          onSubmit={() => {
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
        </Form>
      </Dialog>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await withBaseProps(ctx, async (context) => {
    const { query } = context
    const data = await getWishlistById(query.id)

    return {
      props: { title: "Wishlist", initialData: { data } },
    }
  })
}

export default ProfileWishlistPage
