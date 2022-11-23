"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Card } from "~/components/Card"
import { Cards } from "~/components/Cards"
import { WishlistTitle } from "~/components/CardWishlist"
import { Dialog } from "~/components/Dialog"
import { EditItem } from "~/components/EditItem"
import { Form } from "~/components/Form"
import { PageTitle } from "~/components/PageTitle"
import { WishlistItemProperties } from "~/lib/wishlistItems/publicProperties"
import { WishlistProperties } from "~/lib/wishlists/publicProperties"

interface ProfileWishlistPageProps {
  initialData: WishlistProperties[]
  params: { id: string }
}

function ProfileWishlistPage({
  initialData,
  params,
}: ProfileWishlistPageProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const queryClient = useQueryClient()
  // @ts-ignore
  const { data = {} } = useQuery(
    ["wishlists", params.id],
    () => fetch(`/api/wishlists/${params.id}`).then((res) => res.json()),
    { initialData }
  )
  const { data: wishlist } = data

  const create = useMutation(
    (data: { title: string; url: string }) => {
      return fetch(`/api/user/wishlists/${params.id}/item/create`, {
        method: "post",
        body: JSON.stringify(data),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        setTitle("")
        setUrl("")
        queryClient.invalidateQueries(["wishlists", params.id])
      },
    }
  )

  if (!wishlist) return <div></div>

  return (
    <div>
      <PageTitle>
        <WishlistTitle wishlist={wishlist} />
      </PageTitle>

      <Cards>
        {wishlist.wishlistItem.length === 0 && (
          <p>Je hebt nog geen wensen, maak er snel wat aan! 😎</p>
        )}

        {wishlist.wishlistItem.map(
          (item: WishlistItemProperties, index: number) => (
            <Card
              key={item.id}
              title={item.title}
              url={item.url}
              index={index}
              adornment={<EditItem wishlistId={wishlist.id} item={item} />}
            />
          )
        )}

        <Button variant="primary" onClick={() => setOpen(true)}>
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
          <label htmlFor="title">Wens:</label>
          <input
            required
            id="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label htmlFor="url">
            Linkje: <small>(optioneel)</small>
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

export default ProfileWishlistPage
