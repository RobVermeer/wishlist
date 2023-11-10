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
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface Props {
  groups: Awaited<ReturnType<typeof getGroups>>
}

export const NewWishlist = ({ groups }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

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
