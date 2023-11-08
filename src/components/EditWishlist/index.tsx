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
import { deleteWishlistById } from "@/lib/wishlists/deleteWishlistById"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { updateWishlistById } from "@/lib/wishlists/updateWishlistById"
import { useState } from "react"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  groups: Awaited<ReturnType<typeof getGroups>>
}

export const EditWishlist = ({ wishlist, groups }: Props) => {
  const [open, setOpen] = useState(false)
  const { id, title } = wishlist

  async function handleSubmit(data: FormData) {
    await updateWishlistById(id, data)
    setOpen(false)
  }

  async function handleRemove() {
    await deleteWishlistById(id)
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
          <DialogTitle>Wijzig verlanglijstje 🧐</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor="name">Naam (optioneel)</Label>
          <Input id="name" name="name" defaultValue={title || ""} />
          {groups.map((group) => (
            <label key={group.id}>
              <input
                value={group.id}
                type="checkbox"
                name="groups"
                defaultChecked={wishlist.groups
                  .map((g) => g.id)
                  .includes(group.id)}
              />{" "}
              {group.title}
            </label>
          ))}
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
