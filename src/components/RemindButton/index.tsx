"use client"

import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Button } from "@/components/ui/button"
import { sendReminderToUser } from "@/lib/reminders"
import { Separator } from "@/components/ui/separator"
import { ShoppingBasket } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistById>>
}

export const RemindButton = ({ wishlist }: Props) => {
  const { toast } = useToast()

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

    toast({ title: "We hebben het gevraagd!" })
  }

  return (
    <>
      <Separator className="my-3" />

      <form action={sendReminder}>
        <Button className="w-full" type="submit">
          <ShoppingBasket className="mr-2" size="16" /> Vraag om meer cadeaus op
          de lijst
        </Button>
      </form>
    </>
  )
}
