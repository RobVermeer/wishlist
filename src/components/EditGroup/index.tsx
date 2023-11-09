"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { deleteGroupById } from "@/lib/groups/deleteGroupById"
import { getGroups } from "@/lib/groups/getGroups"
import { updateGroupById } from "@/lib/groups/updateGroupById"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  group: Awaited<ReturnType<typeof getGroups>>[0]
}

export const EditGroup = ({ group }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title } = group

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateGroupById(id, data)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    setOpen(false)
  }

  async function handleRemove() {
    await deleteGroupById(id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="ml-auto" size="sm" variant="outline">
          Wijzig
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Wijzig groep 🧐</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor="title">Naam</Label>
          <Input required id="title" name="title" defaultValue={title} />
        </form>
        <DialogFooter>
          <form action={handleRemove}>
            <Button type="submit" variant="destructive">
              Verwijder
            </Button>
          </form>
          <Button type="submit" form={`change-${id}`}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
