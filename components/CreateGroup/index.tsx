import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Form } from "~/components/Form"

export const CreateGroup = () => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const create = useMutation({
    mutationFn: (title: string) => {
      return fetch("/api/user/groups/create", {
        method: "post",
        body: JSON.stringify({ title }),
      }).then((res) => res.json())
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["groups"])
      setOpen(false)
    },
  })

  return (
    <>
      <Button
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
      >
        Maak een nieuwe groep aan
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Nieuwe groep 👨‍👨‍👧‍👦"
      >
        {open && (
          <Form
            onSubmit={(event) => {
              const form = event.target as HTMLFormElement
              const data = new FormData(form)

              create.mutate(data.get("group-title") as string)
            }}
          >
            <label htmlFor="group-title">Naam:</label>
            <input name="group-title" id="group-title" type="text" />

            <Button variant="primary" type="submit">
              Maak aan
            </Button>
          </Form>
        )}
      </Dialog>
    </>
  )
}
