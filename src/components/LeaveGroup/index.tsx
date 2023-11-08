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
import { getGroups } from "@/lib/groups/getGroups"
import { leaveGroupById } from "@/lib/groups/leaveGroupById"
import { useState } from "react"

interface Props {
  group: Awaited<ReturnType<typeof getGroups>>[0]
}

export const LeaveGroup = ({ group }: Props) => {
  const [open, setOpen] = useState(false)
  const { id } = group

  async function handleLeave() {
    await leaveGroupById(id)
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
          <DialogTitle>Verlaat groep 🧐</DialogTitle>
        </DialogHeader>
        <p>
          Als je uit de groep stapt heb je weer een invite nodig om erbij te
          komen 🤕
        </p>
        <DialogFooter>
          <form action={handleLeave}>
            <Button type="submit" variant="destructive">
              Stap uit de groep
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
