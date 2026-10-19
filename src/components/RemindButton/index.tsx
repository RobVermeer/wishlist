"use client"

import { Button } from "@/components/ui/button"
import { sendReminderToUser } from "@/lib/reminders"
import { LoaderCircle, ShoppingBasket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useFormStatus } from "react-dom"
import { useTranslations } from "next-intl"

const FormButton = () => {
  const { pending } = useFormStatus()
  const t = useTranslations()

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? (
        <LoaderCircle className="animate-spin mr-2" size="16" />
      ) : (
        <ShoppingBasket className="mr-2" size="16" />
      )}{" "}
      {t("Remind.button")}
    </Button>
  )
}

interface Props {
  userId: string
}

export const RemindButton = ({ userId }: Props) => {
  const { toast } = useToast()
  const t = useTranslations()

  async function sendReminder() {
    const { type, errors } = await sendReminderToUser(userId)

    if (type === "error") {
      errors.forEach(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    toast({ title: t("Remind.toast") })
  }

  return (
    <form action={sendReminder}>
      <FormButton />
    </form>
  )
}
