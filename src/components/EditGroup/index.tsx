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
import { deleteGroupById } from "@/lib/groups/deleteGroupById"
import { removeMemberFromGroup } from "@/lib/groups/removeMemberFromGroup"
import { removeWishlistFromGroup } from "@/lib/groups/removeWishlistFromGroup"
import { updateGroupById } from "@/lib/groups/updateGroupById"
import { FormEvent, startTransition, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { RemoveButton } from "@/components/RemoveButton"
import { Separator } from "@/components/ui/separator"
import { RemovableList } from "./RemovableList"
import { Pencil, Save } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTranslations } from "next-intl"

interface Props {
  group: { id: string; title: string; theme: string | null }
  members: { id: string; name: string }[]
  wishlists: { id: string; name: string }[]
  className?: string
}

export const EditGroup = ({ group, members, wishlists, className }: Props) => {
  const { toast } = useToast()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { id, title } = group
  const t = useTranslations()

  async function handleSubmit(data: FormData) {
    const { type, errors } = await updateGroupById(id, data)

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

  function showErrors(
    result: { type: "success" } | { type: "error"; errors: string[] }
  ) {
    if (result.type === "error") {
      result.errors.forEach(title => {
        toast({ variant: "destructive", title })
      })
    }
  }

  async function handleRemove() {
    const { type, errors } = await deleteGroupById(id)

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
          <Pencil size="12" className="mr-2" /> {t("EditGroup.button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-h-dvh overflow-y-auto sm:max-h-[calc(100dvh-4rem)] sm:max-w-[425px]"
        onOpenAutoFocus={event => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("EditGroup.title")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          id={`change-${id}`}
          className="grid gap-4 py-4"
        >
          <Label htmlFor="title">{t("EditGroup.form.title")}</Label>
          <Input required id="title" name="title" defaultValue={title} />
          <Label htmlFor="theme">{t("Common.group.theme.label")}</Label>
          <Select name="theme" defaultValue={group.theme || undefined}>
            <SelectTrigger id="theme">
              <SelectValue placeholder={t("Common.group.theme.placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="default">
                  {t("Common.group.theme.none")}
                </SelectItem>
                <SelectItem value="sinterklaas">
                  {t("Common.group.theme.sinterklaas")}
                </SelectItem>
                <SelectItem value="christmas">
                  {t("Common.group.theme.christmas")}
                </SelectItem>
                <SelectItem value="birthday">
                  {t("Common.group.theme.birthday")}
                </SelectItem>
                <SelectItem value="baby">
                  {t("Common.group.theme.baby")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </form>
        {members.length > 0 && (
          <>
            <Separator />
            <RemovableList
              id={`members-${id}`}
              title={t("EditGroup.members.title")}
              items={members}
              button={t("EditGroup.members.remove.button")}
              description={name =>
                t("EditGroup.members.remove.description", { name })
              }
              onRemove={memberId =>
                startTransition(async () =>
                  showErrors(await removeMemberFromGroup(id, memberId))
                )
              }
            />
          </>
        )}
        {wishlists.length > 0 && (
          <>
            <Separator />
            <RemovableList
              id={`wishlists-${id}`}
              title={t("EditGroup.wishlists.title")}
              items={wishlists}
              button={t("EditGroup.wishlists.remove.button")}
              description={name =>
                t("EditGroup.wishlists.remove.description", { name })
              }
              onRemove={wishlistId =>
                startTransition(async () =>
                  showErrors(await removeWishlistFromGroup(id, wishlistId))
                )
              }
            />
          </>
        )}
        <DialogFooter className="gap-2 md:gap-0">
          <RemoveButton
            description={t("EditGroup.remove.description")}
            onConfirm={handleRemove}
          />
          <Button type="submit" form={`change-${id}`}>
            <Save size="16" className="mr-2" /> {t("EditGroup.form.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
