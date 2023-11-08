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
import { createWishlistItemForUser } from "@/lib/wishlistItems/createWishlistItemForUser"
import { useState } from "react"

interface Props {
  id: string
}

export const NewItem = ({ id }: Props) => {
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: FormData) {
    await createWishlistItemForUser(id, data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Voeg een wens toe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Voeg wens toe 🤠</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
          <Label htmlFor="title">Wens</Label>
          <Input required id="title" name="title" />
          <Label htmlFor="url">
            Linkje <small>(optioneel)</small>
          </Label>
          <Input id="url" name="url" />
        </form>
        <DialogFooter>
          <Button type="submit" form="add">
            Voeg wens toe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
