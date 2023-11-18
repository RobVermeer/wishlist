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
import { deleteWishlistById } from "@/lib/wishlists/deleteWishlistById"
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { updateWishlistById } from "@/lib/wishlists/updateWishlistById"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, Trash } from "lucide-react"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  groups: Awaited<ReturnType<typeof getGroupsForUser>>
}

export const EditWishlist = ({ wishlist, groups }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title } = wishlist
  const [ownList, setOwnList] = useState(!title)

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
          <div className="flex items-center space-x-2">
            <Checkbox
              id="own-list"
              name="own-list"
              checked={ownList}
              onCheckedChange={(checked) => setOwnList(Boolean(checked))}
            />
            <Label htmlFor="own-list">Dit is mijn eigen lijstje</Label>
          </div>

          {!ownList && (
            <>
              <Label htmlFor="name">
                Naam van diegene voor wie je het lijstje beheert
              </Label>
              <Input id="name" name="name" defaultValue={title || ""} />
            </>
          )}

          <Separator />

          <div className="grid gap-1">
            <h3>In welke groepen moet je lijstje komen</h3>
            {groups.map((group) => (
              <div key={group.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${group.id}`}
                  value={group.id}
                  name="groups"
                  defaultChecked={wishlist.groups
                    .map((g) => g.id)
                    .includes(group.id)}
                />
                <label htmlFor={`group-${group.id}`}>{group.title}</label>
              </div>
            ))}
          </div>
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
