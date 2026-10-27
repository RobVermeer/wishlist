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
import { FormEvent, startTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  group: { id: string }
  className?: string
}

export const LeaveGroup = ({ group, className }: Props) => {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { id } = group
  const t = useTranslations()
  const { toast } = useToast()

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await leaveGroupById(id)

      if (result.type === "error") {
        result.errors.forEach(title => {
          toast({ variant: "destructive", title })
        })
        return
      }

      setOpen(false)
      router.push("/")
    })
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
          <form onSubmit={onSubmit}>
            <Button className="w-full" type="submit">
              <UserMinus size="16" className="mr-2" /> {t("LeaveGroup.leave")}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
