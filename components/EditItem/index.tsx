import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Form } from "~/components/Form"
import styles from "./EditItem.module.css"

export const EditItem = ({ wishlistId, item }) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(item.title)
  const [url, setUrl] = useState(item.url)

  const update = useMutation(
    () => {
      return fetch(`/api/user/wishlists/${wishlistId}/item/${item.id}/edit`, {
        method: "put",
        body: JSON.stringify({ title, url }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist", wishlistId])
        setOpen(false)
      },
    }
  )

  const remove = useMutation(
    () => {
      return fetch(`/api/user/wishlists/${wishlistId}/item/${item.id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist", wishlistId])
        setOpen(false)
      },
    }
  )

  return (
    <>
      <Button
        className={styles.button}
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        Wijzig
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} title="Wijzig wens 🧐">
        <Form onSubmit={() => update.mutate()}>
          <label htmlFor={`${item.id}-title`}>Wens</label>
          <input
            required
            id={`${item.id}-title`}
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <label htmlFor={`${item.id}-url`}>
            URL <small>(optioneel)</small>
          </label>
          <input
            id={`${item.id}-url`}
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
          <Button variant="primary" type="submit">
            Opslaan
          </Button>
          <Button variant="danger" onClick={() => remove.mutate()}>
            Verwijder
          </Button>
        </Form>
      </Dialog>
    </>
  )
}
