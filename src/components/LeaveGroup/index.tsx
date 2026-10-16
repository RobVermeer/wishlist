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
import { leaveGroupById } from "@/lib/groups/leaveGroupById"
import { UserMinus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  group: { id: string }
  className?: string
}

export const LeaveGroup = ({ group, className }: Props) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { id } = group
  const t = useTranslations()

  async function handleLeave() {
    await leaveGroupById(id)
    setOpen(false)
    router.push("/for-others")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} size="sm" variant="outline">
          <UserMinus size="12" className="mr-2" /> {t("LeaveGroup.button")}
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
