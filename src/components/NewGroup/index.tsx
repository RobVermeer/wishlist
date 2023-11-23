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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
          <Label htmlFor="theme">Thema</Label>
          <Select name="theme">
            <SelectTrigger id="theme">
              <SelectValue placeholder="Selecteer een thema" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default">Geen thema</SelectItem>
                <SelectItem value="sinterklaas">Sinterklaas</SelectItem>
                <SelectItem value="christmas">Kerst</SelectItem>
                <SelectItem value="birthday">Verjaardag</SelectItem>
                <SelectItem value="baby">Baby</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
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
