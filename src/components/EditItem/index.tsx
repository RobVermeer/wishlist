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
import { deleteWishlistItemById } from "@/lib/wishlistItems/deleteWishlistItemById"
import { updateWishlistItemById } from "@/lib/wishlistItems/updateWishlistItemById"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  item: Awaited<ReturnType<typeof getWishlistById>>["wishlistItem"][0]
}

export const EditItem = ({ item }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title, url } = item

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistItemById(id, data)

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
    await deleteWishlistItemById(id)
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
          <DialogTitle>Wijzig wens 🧐</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor="title">Wens</Label>
          <Input required id="title" name="title" defaultValue={title} />
          <Label htmlFor="url">
            Linkje <small>(optioneel)</small>
          </Label>
          <Input id="url" name="url" defaultValue={url || ""} />
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
