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
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

interface Props {
  id: string
}

export const NewItem = ({ id }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createWishlistItemForUser(id, data)

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
          <Plus size="16" className="mr-2" /> Voeg een wens toe
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
            <Plus size="16" className="mr-2" /> Voeg wens toe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
