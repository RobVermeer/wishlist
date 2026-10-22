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
import { deleteWishlistById } from "@/lib/wishlists/deleteWishlistById"
import { updateWishlistById } from "@/lib/wishlists/updateWishlistById"
import { FormEvent, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { RemoveButton } from "@/components/RemoveButton"
import { Pencil, Save } from "lucide-react"
import type { GroupOption } from "@/lib/groups/getGroupOptionsForUser"
import { WishlistGroupsField } from "@/components/WishlistGroupsField"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import { WishlistOwnerField } from "@/components/WishlistOwnerField"
import { WishlistManagersField } from "@/components/WishlistManagersField"
import type { ManagerOption } from "@/lib/users/getManagerOptionsForUser"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  wishlist: {
    id: string
    title: string | null
    description: string | null
    theme: string | null
    groups: { id: string }[]
    managers: { id: string }[]
    isManager: boolean
  }
  groups: GroupOption[]
  managers: ManagerOption[]
  label?: string
  className?: string
}

export const EditWishlist = ({
  wishlist,
  groups,
  managers,
  label,
  className,
}: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { id, title, description, isManager } = wishlist
  const [ownList, setOwnList] = useState(!title)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistById(id, data)

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

  async function handleRemove() {
    const { type, errors } = await deleteWishlistById(id)

    if (type === "error") {
      errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
      return
    }

    setOpen(false)
    router.push("/")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={className} size="sm" variant="outline">
          <Pencil size="12" className="mr-2" />{" "}
          {label ?? t("EditWishlist.button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-dvh overflow-y-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-[425px]"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("EditWishlist.title")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <WishlistOwnerField
            ownList={ownList}
            onOwnListChange={setOwnList}
            defaultName={title || ""}
            canChangeOwner={!isManager}
          />
          {ownList && wishlist.managers.length > 0 && (
            <small className="-mt-2 text-muted-foreground">
              {t("Common.wishlist.managers.ownList")}
            </small>
          )}
          {!ownList && !isManager && (
            <WishlistManagersField
              managers={managers}
              defaultManagerIds={wishlist.managers.map(({ id }) => id)}
            />
          )}

          <Separator />

          <Label htmlFor="description">
            {t.rich("EditWishlist.form.description", {
              small: chunks => <small>{chunks}</small>,
            })}
          </Label>
          <Input
            id="description"
            name="description"
            defaultValue={description || ""}
          />

          <Label htmlFor="theme">{t("Common.wishlist.theme.label")}</Label>
          <Select name="theme" defaultValue={wishlist.theme || undefined}>
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
                <SelectItem value="baby">
                  {t("Common.wishlist.theme.baby")}
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

          <Separator />

          <WishlistGroupsField
            label={t("EditWishlist.form.groups")}
            groups={groups}
            defaultGroupIds={wishlist.groups.map(({ id }) => id)}
            ownList={ownList}
            wishlistId={id}
          />
        </form>
        <DialogFooter className="gap-2 md:gap-0">
          {!isManager && (
            <RemoveButton
              description={t("EditWishlist.remove.description")}
              onConfirm={handleRemove}
            />
          )}
          <Button type="submit" form={`change-${id}`}>
            <Save size="16" className="mr-2" /> {t("EditWishlist.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
