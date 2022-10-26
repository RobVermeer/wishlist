import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Form } from "~/components/Form"
import styles from "./EditGroup.module.css"

export const EditGroup = ({ group }) => {
  const { data } = useSession()
  const isOwnGroup = data?.userId === group.createdBy.id
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(group.title)

  const update = useMutation(
    () => {
      return fetch(`/api/user/groups/${group.id}/edit`, {
        method: "put",
        body: JSON.stringify({ title }),
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
        setOpen(false)
      },
    }
  )

  const unsubscribe = useMutation(
    () => {
      return fetch(`/api/user/groups/${group.id}/subscribe`, {
        method: "put",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
        setOpen(false)
      },
    }
  )

  const remove = useMutation(
    () => {
      return fetch(`/api/user/groups/${group.id}/remove`, {
        method: "delete",
      }).then((res) => res.json())
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["groups"])
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
        Instellingen
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Wijzig group 🧐"
      >
        {isOwnGroup && (
          <Form onSubmit={() => update.mutate()}>
            <label htmlFor={`${group.id}-title`}>Titel</label>
            <input
              required
              id={`${group.id}-title`}
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
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
        )}

        {!isOwnGroup && (
          <>
            <p>
              Als je uit de groep stapt heb je weer een invite nodig om erbij te
              komen 🤕
            </p>
            <Button
              type="button"
              variant="danger"
              onClick={() => unsubscribe.mutate()}
            >
              Stap uit de groep
            </Button>
          </>
        )}
      </Dialog>
    </>
  )
}
