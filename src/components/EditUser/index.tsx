"use client"

import { LoaderCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTranslations } from "next-intl"
import { updateProfile } from "@/lib/users/updateProfile"
import { FormEvent, useRef, useTransition } from "react"
import { useToast } from "@/components/ui/use-toast"

const SubmitButton = ({ pending }: { pending: boolean }) => {
  const t = useTranslations()

  return (
    <Button type="submit" className="mt-2" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin mr-2" size="16" />
      ) : (
        <Save size="16" className="mr-2" />
      )}{" "}
      {t("EditUser.form.save")}
    </Button>
  )
}

interface Props {
  firstName: string
}

export const EditUser = ({ firstName }: Props) => {
  const t = useTranslations()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateProfile(data)

    if (type === "error") {
      errors.forEach((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    formRef.current?.reset()
    toast({ title: t("EditUser.toast") })
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => handleSubmit(data))
  }

  return (
    <form onSubmit={onSubmit} ref={formRef} className="grid gap-4 py-4">
      <Label htmlFor="firstName">{t("EditUser.form.firstName")}</Label>
      <Input id="firstName" name="firstName" defaultValue={firstName} />

      <Label htmlFor="avatar">
        {t.rich("EditUser.form.avatar", {
          small: (chunks) => <small>{chunks}</small>,
        })}
      </Label>
      <Input id="avatar" name="avatar" type="file" accept="image/*" />

      <SubmitButton pending={pending} />
    </form>
  )
}
