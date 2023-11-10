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
import { useToast } from "@/components/ui/use-toast"
import { FileEdit, Pencil, Save, Trash } from "lucide-react"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  groups: Awaited<ReturnType<typeof getGroups>>
}

export const EditWishlist = ({ wishlist, groups }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title } = wishlist

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistById(id, data)

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
    const confirm = window.confirm(
      "Ben je er zeker van dat je deze verlanglijst wilt verwijderen?"
    )

    if (!confirm) return

    await deleteWishlistById(id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="absolute right-1" size="sm" variant="outline">
          <Pencil size="12" className="mr-2" /> Wijzig
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
        <DialogFooter className="gap-2 md:gap-0">
          <form action={handleRemove}>
            <Button className="w-full" type="submit" variant="outline">
              <Trash size="16" className="mr-2" /> Verwijder
            </Button>
          </form>
          <Button type="submit" form={`change-${id}`}>
            <Save size="16" className="mr-2" /> Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
