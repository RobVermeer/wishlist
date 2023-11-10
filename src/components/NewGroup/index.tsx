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
import { createGroupForUser } from "@/lib/groups/createGroupForUser"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

export const NewGroup = () => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createGroupForUser(data)

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
          <Plus size="16" className="mr-2" /> Maak een nieuwe groep aan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nieuwe groep 👨‍👨‍👧‍👦</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
          <Label htmlFor="title">Naam</Label>
          <Input required id="title" name="title" />
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
