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
import { createWishlistForUser } from "@/lib/wishlists/createWishlistForUser"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

interface Props {
  groups: Awaited<ReturnType<typeof getGroupsForUser>>
}

export const NewWishlist = ({ groups }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [ownList, setOwnList] = useState(true)

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createWishlistForUser(data)

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size="16" className="mr-2" /> Maak een nieuw verlanglijstje aan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nieuw verlanglijstje 🤩</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
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
              <Input id="name" name="name" />
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
                  defaultChecked
                />
                <label htmlFor={`group-${group.id}`}>{group.title}</label>
              </div>
            ))}
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" form="add">
            <Plus size="16" className="mr-2" /> Maak aan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
