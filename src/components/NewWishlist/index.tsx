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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWishlistForUser } from "@/lib/wishlists/createWishlistForUser"
import { FormEvent, ReactNode, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import type { GroupOption } from "@/lib/groups/getGroupOptionsForUser"
import { WishlistGroupsField } from "@/components/WishlistGroupsField"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import { WishlistOwnerField } from "@/components/WishlistOwnerField"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  groups: GroupOption[]
  defaultGroupIds?: string[]
  defaultOwnList?: boolean
  trigger: ReactNode
}

export const NewWishlist = ({
  groups,
  defaultGroupIds = [],
  defaultOwnList = true,
  trigger,
}: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [ownList, setOwnList] = useState(defaultOwnList)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createWishlistForUser(data)

    if (type === "error") {
      errors.forEach(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
      return
    }

    setOpen(false)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    startTransition(() => handleSubmit(data))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("NewWishlist.title")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} id="add" className="grid gap-4 py-4">
          <WishlistOwnerField ownList={ownList} onOwnListChange={setOwnList} />

          <Label htmlFor="description">
            {t.rich("NewWishlist.form.description", {
              small: chunks => <small>{chunks}</small>,
            })}
          </Label>
          <Input id="description" name="description" />

          <Separator />

          <WishlistGroupsField
            label={t("NewWishlist.form.groups")}
            groups={groups}
            defaultGroupIds={defaultGroupIds}
            ownList={ownList}
          />

          <Label htmlFor="theme">{t("Common.wishlist.theme.label")}</Label>
          <Select name="theme">
            <SelectTrigger id="theme">
              <SelectValue
                placeholder={t("Common.wishlist.theme.placeholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default">
                  {t("Common.wishlist.theme.none")}
                </SelectItem>
                <SelectItem value="birthday">
                  {t("Common.wishlist.theme.birthday")}
                </SelectItem>
                <SelectItem value="holidays">
                  {t("Common.wishlist.theme.holidays")}
                </SelectItem>
                <SelectItem value="home">
                  {t("Common.wishlist.theme.home")}
                </SelectItem>
                <SelectItem value="travel">
                  {t("Common.wishlist.theme.travel")}
                </SelectItem>
                <SelectItem value="clothing">
                  {t("Common.wishlist.theme.clothing")}
                </SelectItem>
                <SelectItem value="sports">
                  {t("Common.wishlist.theme.sports")}
                </SelectItem>
                <SelectItem value="tools">
                  {t("Common.wishlist.theme.tools")}
                </SelectItem>
                <SelectItem value="pet">
                  {t("Common.wishlist.theme.pet")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
        <DialogFooter>
          <Button type="submit" form="add">
            <Plus size="16" className="mr-2" /> {t("NewWishlist.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
