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
import { getWishlistsForUser } from "@/lib/wishlists/getWishlistsForUser"
import { updateWishlistById } from "@/lib/wishlists/updateWishlistById"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Pencil, Save, Trash } from "lucide-react"
import { getGroupsForUser } from "@/lib/groups/getGroupsForUser"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useTranslations } from "next-intl"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
  wishlist: Awaited<ReturnType<typeof getWishlistsForUser>>[0]
  groups: Awaited<ReturnType<typeof getGroupsForUser>>
}

export const EditWishlist = ({ wishlist, groups }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const { id, title, description } = wishlist
  const [ownList, setOwnList] = useState(!title)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateWishlistById(id, data)

    if (type === "error") {
      return errors.map(title => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    setOpen(false)
  }

  async function handleRemove() {
    await deleteWishlistById(id)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="absolute right-1" size="sm" variant="outline">
          <Pencil size="12" className="mr-2" /> {t("EditWishlist.button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("EditWishlist.title")}</DialogTitle>
        </DialogHeader>
        <form
          action={handleSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <div className="flex items-center space-x-2">
            <Checkbox
              id="own-list"
              name="own-list"
              checked={ownList}
              onCheckedChange={checked => setOwnList(Boolean(checked))}
            />
            <Label htmlFor="own-list">
              {t("EditWishlist.form.ownList.label")}
            </Label>
          </div>

          {!ownList && (
            <>
              <Label htmlFor="name">
                {t("EditWishlist.form.ownList.title")}
              </Label>
              <Input id="name" name="name" defaultValue={title || ""} />
            </>
          )}

          <Label htmlFor="description">
            {t("EditWishlist.form.description")}
          </Label>
          <Input
            id="description"
            name="description"
            defaultValue={description || ""}
          />

          <Separator />

          <div className="grid gap-1">
            <h3>{t("EditWishlist.form.groups")}</h3>
            {groups.map(group => (
              <div key={group.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${group.id}`}
                  value={group.id}
                  name="groups"
                  defaultChecked={wishlist.groups
                    .map(g => g.id)
                    .includes(group.id)}
                />
                <label htmlFor={`group-${group.id}`}>{group.title}</label>
              </div>
            ))}
          </div>

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
        </form>
        <DialogFooter className="gap-2 md:gap-0">
          <form action={handleRemove}>
            <Button className="w-full" type="submit" variant="outline">
              <Trash size="16" className="mr-2" /> {t("EditWishlist.remove")}
            </Button>
          </form>
          <Button type="submit" form={`change-${id}`}>
            <Save size="16" className="mr-2" /> {t("EditWishlist.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
