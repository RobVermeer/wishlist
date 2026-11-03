"use client"

import { LoaderCircle, UserMinus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { FormEvent, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { stopManagingWishlistById } from "@/lib/wishlists/stopManagingWishlistById"

interface Props {
  wishlistId: string
}

export const StopManagingWishlist = ({ wishlistId }: Props) => {
  const t = useTranslations("StopManagingWishlist")
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  async function stopManaging() {
    const result = await stopManagingWishlistById(wishlistId)

    if (result.type === "error") {
      result.errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    setOpen(false)
    toast({ title: t("toast") })
    router.push("/")
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(stopManaging)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <UserMinus size="16" className="mr-2" /> {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("text")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <form onSubmit={onSubmit}>
            <Button className="w-full" type="submit" disabled={pending}>
              {pending ? (
                <LoaderCircle size="16" className="mr-2 animate-spin" />
              ) : (
                <UserMinus size="16" className="mr-2" />
              )}{" "}
              {t("button")}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
