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
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
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
  groups: Awaited<ReturnType<typeof getGroupsForUser>>
}

export const NewWishlist = ({ groups }: Props) => {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [ownList, setOwnList] = useState(true)
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await createWishlistForUser(data)

    if (type === "error") {
      return errors.map((title) => {
        toast({
          variant: "destructive",
          title,
        })
      })
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus size="16" className="mr-2" /> {t("NewWishlist.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("NewWishlist.title")}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} id="add" className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="own-list"
              name="own-list"
              checked={ownList}
              onCheckedChange={(checked) => setOwnList(Boolean(checked))}
            />
            <Label htmlFor="own-list">
              {t("NewWishlist.form.ownList.label")}
            </Label>
          </div>

          {!ownList && (
            <>
              <Label htmlFor="name">
                {t("NewWishlist.form.ownList.title")}
              </Label>
              <Input id="name" name="name" />
            </>
          )}

          <Separator />

          <div className="grid gap-1">
            <h3>{t("NewWishlist.form.groups")}</h3>
            {groups.map((group) => (
              <div key={group.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${group.id}`}
                  value={group.id}
                  name="groups"
                  defaultChecked
                />
                <label htmlFor={`group-${group.id}`}>{group.title}</label>
              </div>
            ))}
          </div>

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
