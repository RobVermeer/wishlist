"use client"

import { Session } from "next-auth"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoaderCircle, UserRoundPlus } from "lucide-react"
import { FormEvent, useState, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateFirstNameById } from "@/lib/users/updateFirstNameById"
import { useTranslations } from "next-intl"

const AddInfoButton = ({ pending }: { pending: boolean }) => {
  const t = useTranslations()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin mr-2" size="16" />
      ) : (
        <UserRoundPlus className="mr-2" size="16" />
      )}{" "}
      {t("UserInfo.form.save")}
    </Button>
  )
}

interface Props {
  session: Session
}

export const UserInfoDialog = ({ session }: Props) => {
  const [sent, setSent] = useState(false)
  const [pending, startTransition] = useTransition()
  const { toast } = useToast()
  const t = useTranslations()
  const open = !sent && !session.user.firstName

  async function handleSubmit(firstName: string) {
    const { type, errors } = await updateFirstNameById(
      session.user.id,
      firstName
    )

    if (type === "error") {
      errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    setSent(true)
    toast({ title: t("UserInfo.toast") })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const firstName = new FormData(event.currentTarget)
      .get("firstName")
      ?.toString()

    if (!firstName) return

    startTransition(() => handleSubmit(firstName))
  }

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("UserInfo.title")}</DialogTitle>
          <DialogDescription>{t("UserInfo.text")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Label htmlFor="firstName">{t("UserInfo.form.firstName")}</Label>
          <Input id="firstName" name="firstName" required />

          <DialogFooter>
            <AddInfoButton pending={pending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
