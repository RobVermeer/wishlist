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
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2, UserPlus2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateFirstNameById } from "@/lib/users/updateFirstNameById"
import { useTranslations } from "next-intl"

const AddInfoButton = () => {
  const { pending } = useFormStatus()
  const t = useTranslations()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin mr-2" size="16" />
      ) : (
        <UserPlus2 className="mr-2" size="16" />
      )}{" "}
      {t("UserInfo.form.save")}
    </Button>
  )
}

interface Props {
  session: Session
}

export const UserInfoDialog = ({ session }: Props) => {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()
  const t = useTranslations()

  useEffect(() => {
    if (!sent && !open && !session.user.firstName) {
      setOpen(true)
    }
  }, [sent, open, session.user.firstName])

  async function handleSubmit(formData: FormData) {
    const firstName = formData.get("firstName")?.toString()
    const lastName = formData.get("lastName")?.toString()

    if (!firstName) return

    await updateFirstNameById(session.user.id, firstName, lastName)
    setOpen(false)
    setSent(true)
    toast({ title: t("UserInfo.toast") })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("UserInfo.title")}</DialogTitle>
          <DialogDescription>{t("UserInfo.text")}</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="grid gap-4">
          <Label htmlFor="firstName">{t("UserInfo.form.firstName")}</Label>
          <Input id="firstName" name="firstName" required />

          <Label htmlFor="lastName">
            {t.rich("UserInfo.form.lastName", {
              small: (chunks) => <small>{chunks}</small>,
            })}
          </Label>
          <Input id="lastName" name="lastName" />
          <DialogFooter>
            <AddInfoButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
