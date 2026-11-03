"use client"

import { Button } from "@/components/ui/button"
import { sendReminderForWishlist } from "@/lib/reminders"
import { LoaderCircle, ShoppingBasket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { FormEvent, useTransition } from "react"
import { useTranslations } from "next-intl"

const FormButton = ({ pending }: { pending: boolean }) => {
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
  wishlistId: string
}

export const RemindButton = ({ wishlistId }: Props) => {
  const { toast } = useToast()
  const t = useTranslations()
  const [pending, startTransition] = useTransition()

  async function sendReminder() {
    const { type, errors } = await sendReminderForWishlist(wishlistId)

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(sendReminder)
  }

  return (
    <form onSubmit={onSubmit}>
      <FormButton pending={pending} />
    </form>
  )
}
