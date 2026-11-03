"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { ArchiveRestore } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { unDeleteGroupById } from "@/lib/groups/unDeleteGroupById"

interface Props {
  id: string
  title: string
}

export const UnDeleteGroup = ({ id, title }: Props) => {
  const t = useTranslations()
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()

  const unDeleteGroup = () => {
    startTransition(async () => {
      const { type, errors } = await unDeleteGroupById(id)

      if (type === "error") {
        errors.forEach(title => toast({ variant: "destructive", title }))
        return
      }

      toast({ title: t("Admin.group.restored") })
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="w-fit"
          size="sm"
          variant="outline"
          disabled={pending}
        >
          <ArchiveRestore size="16" className="mr-2" />
          {t("Admin.group.restore")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("Admin.confirm")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("Admin.group.restoreConfirm", { title })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Remove.cancel")}</AlertDialogCancel>
          <AlertDialogAction className="flex gap-2" onClick={unDeleteGroup}>
            <ArchiveRestore size="16" />
            {t("Admin.group.restore")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
