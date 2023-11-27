"use client"

import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Button } from "@/components/ui/button"
import { sendReminderToUser } from "@/lib/reminders"
import { Loader2, ShoppingBasket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useFormStatus } from "react-dom"
import { useTranslations } from "next-intl"

const FormButton = () => {
  const { pending } = useFormStatus()
  const t = useTranslations()

  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="animate-spin mr-2" size="16" />
      ) : (
        <ShoppingBasket className="mr-2" size="16" />
      )}{" "}
      {t("Remind.button")}
    </Button>
  )
}

interface Props {
  wishlist: NonNullable<Awaited<ReturnType<typeof getWishlistById>>>
}

export const RemindButton = ({ wishlist }: Props) => {
  const { toast } = useToast()
  const t = useTranslations()

  async function sendReminder() {
    const { type, errors } = await sendReminderToUser(wishlist.user.id)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    toast({ title: t("Remind.toast") })
  }

  return (
    <form action={sendReminder}>
      <FormButton />
    </form>
  )
}
