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
import { getGroups } from "@/lib/groups/getGroups"
import { createWishlistForUser } from "@/lib/wishlists/createWishlistForUser"
import { useState } from "react"

interface Props {
  groups: Awaited<ReturnType<typeof getGroups>>
}

export const NewWishlist = ({ groups }: Props) => {
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: FormData) {
    await createWishlistForUser(data)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Maak een nieuw verlanglijstje aan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nieuw verlanglijstje 🤩</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
          <Label htmlFor="name">Naam (optioneel)</Label>
          <Input id="name" name="name" />
          {groups.map((group) => (
            <label key={group.id}>
              <input
                value={group.id}
                type="checkbox"
                name="groups"
                defaultChecked={true}
              />{" "}
              {group.title}
            </label>
          ))}
        </form>
        <DialogFooter>
          <Button type="submit" form="add">
            Maak aan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
