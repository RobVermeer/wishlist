import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Form } from "~/components/Form"

export const CreateWishlist = ({ userId }) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [otherName, setOtherName] = useState(false)
  // @ts-ignore
  const { data: groupsData = {} } = useQuery(["groups", userId], () =>
    fetch("/api/user/groups").then((res) => res.json())
  )
  const { data: groups = [] } = groupsData

  const create = useMutation(
    (data: { title: string; groups: string[] }) => {
      return fetch("/api/user/wishlists/create", {
        method: "post",
        body: JSON.stringify(data),
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
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        Maak een nieuwe wensenlijst aan
      </Button>

      <Dialog
        open={open}
        onClose={() => {
          setOtherName(false)
          setOpen(false)
        }}
        title="Nieuwe wensenlijst 🤩"
      >
        {open && (
          <Form
            onSubmit={(event) => {
              const form = event.target as HTMLFormElement
              const data = new FormData(form)

              create.mutate({
                title: data.get("wishlist-title") as string,
                groups: data.getAll("wishlist-groups") as string[],
              })
            }}
          >
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
                <label htmlFor="wishlist-title">Naam</label>
                <input name="wishlist-title" id="wishlist-title" type="text" />
              </>
            )}
            <p>
              <strong>In welke groepen wil je dit lijstje hebben?</strong>
            </p>
            {groups.map((group) => (
              <label key={group.id}>
                <input
                  value={group.id}
                  type="checkbox"
                  name="wishlist-groups"
                  defaultChecked={true}
                />{" "}
                {group.title}
              </label>
            ))}
            <Button variant="primary" type="submit">
              Maak aan
            </Button>
          </Form>
        )}
      </Dialog>
    </>
  )
}
