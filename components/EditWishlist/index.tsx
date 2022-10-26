import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Form } from "~/components/Form"
import styles from "./EditWishlist.module.css"

export const EditWishlist = ({ wishlist }) => {
  const userId = wishlist.user.id
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [otherName, setOtherName] = useState(Boolean(wishlist.title))
  const [title, setTitle] = useState(wishlist.title)
  const [userGroups, setUserGroups] = useState(
    wishlist.groups.map(({ id }) => id)
  )
  // @ts-ignore
  const { data: groupsData = {} } = useQuery(["groups", userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )
  const { data: groups = [] } = groupsData

  const update = useMutation(
    () => {
      return fetch(`/api/user/wishlists/${wishlist.id}/edit`, {
        method: "put",
        body: JSON.stringify({
          title: otherName ? title : "",
          groups: userGroups,
        }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", userId])
        setOpen(false)
      },
    }
  )

  const remove = useMutation(
    () => {
      return fetch(`/api/user/wishlists/${wishlist.id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlists", userId])
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Wijzig wensenlijst 🧐"
      >
        <Form onSubmit={() => update.mutate()}>
          <label htmlFor="other-name">
            <input
              type="checkbox"
              name="other-name"
              id="other-name"
              checked={otherName}
              onChange={(event) => setOtherName(event.target.checked)}
            />{" "}
            Dit lijstje is niet voor mij
          </label>
          {otherName && (
            <>
              <label htmlFor={`${wishlist.id}-title`}>Titel</label>
              <input
                required
                id={`${wishlist.id}-title`}
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </>
          )}

          <p>
            <strong>
              Selecteer de groepen waarin je lijstje zichtbaar moet zijn
            </strong>
          </p>
          {groups.map((group) => (
            <label key={group.id}>
              <input
                value={group.id}
                type="checkbox"
                name="wishlist-groups"
                checked={userGroups.includes(group.id)}
                onChange={() =>
                  setUserGroups((prev) => {
                    if (prev.includes(group.id)) {
                      return prev.filter((id) => id !== group.id)
                    }
                    {
                      return [...prev, group.id]
                    }
                  })
                }
              />{" "}
              {group.title}
            </label>
          ))}
          <Button variant="primary" type="submit">
            Opslaan
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => remove.mutate()}
          >
            Verwijder
          </Button>
        </Form>
      </Dialog>
    </>
  )
}
