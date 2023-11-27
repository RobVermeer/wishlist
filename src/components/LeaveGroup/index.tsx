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
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { leaveGroupById } from "@/lib/groups/leaveGroupById"
import { Pencil, UserMinus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

interface Props {
  group: Awaited<ReturnType<typeof getGroupsForUser>>[0]
}

export const LeaveGroup = ({ group }: Props) => {
  const [open, setOpen] = useState(false)
  const { id } = group
  const t = useTranslations()

  async function handleLeave() {
    await leaveGroupById(id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="absolute right-1" size="sm" variant="outline">
          <Pencil size="12" className="mr-2" /> {t("LeaveGroup.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("LeaveGroup.title")}</DialogTitle>
        </DialogHeader>
        <p>{t("LeaveGroup.text")}</p>
        <DialogFooter>
          <form action={handleLeave}>
            <Button className="w-full" type="submit">
              <UserMinus size="16" className="mr-2" /> {t("LeaveGroup.leave")}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
