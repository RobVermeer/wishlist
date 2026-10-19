"use client"

import { ListPlus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { FormEvent, startTransition, useState } from "react"
import { NewWishlist } from "@/components/NewWishlist"
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
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"
import type { GroupOption } from "@/lib/groups/getGroupOptionsForUser"
import type { ManagerOption } from "@/lib/users/getManagerOptionsForUser"
import { addWishlistToGroup } from "@/lib/wishlists/addWishlistToGroup"

interface Option {
  id: string
  name: string
  details: string
  replaces?: string
}

interface Props {
  group: { id: string; title: string }
  own: Option[]
  forSomeoneElse: Option[]
  groups: GroupOption[]
  managers: ManagerOption[]
}

export const AddWishlistToGroup = ({
  group,
  own,
  forSomeoneElse,
  groups,
  managers,
}: Props) => {
  const t = useTranslations("Group.addWishlist")
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const [wishlistId, setWishlistId] = useState(
    (own[0] ?? forSomeoneElse[0])?.id
  )

  const button = (
    <Button variant="outline">
      <ListPlus size="16" className="mr-2" /> {t("button")}
    </Button>
  )

  if (own.length + forSomeoneElse.length === 0) {
    return (
      <NewWishlist
        groups={groups}
        managers={managers}
        defaultGroupIds={[group.id]}
        trigger={button}
      />
    )
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!wishlistId) return

    startTransition(async () => {
      const result = await addWishlistToGroup(wishlistId, group.id)

      if (result.type === "error") {
        result.errors.forEach(title => {
          toast({ variant: "destructive", title })
        })
        return
      }

      setOpen(false)
      toast({ title: t("toast") })
    })
  }

  function createNew() {
    setOpen(false)
    setNewOpen(true)
  }

  const renderOptions = (title: string, options: Option[]) =>
    options.length > 0 && (
      <fieldset className="grid gap-3">
        <legend className="mb-2 text-sm font-semibold text-muted-foreground">
          {title}
        </legend>
        {options.map(option => (
          <div key={option.id} className="flex items-start gap-2">
            <RadioGroupItem
              value={option.id}
              id={`add-${option.id}`}
              className="mt-0.5"
            />
            <Label htmlFor={`add-${option.id}`} className="grid gap-1">
              {option.name}
              <small className="font-normal text-muted-foreground">
                {option.details}
              </small>
              {option.replaces && (
                <small className="font-normal text-primary">
                  {option.replaces}
                </small>
              )}
            </Label>
          </div>
        ))}
      </fieldset>
    )

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{button}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("text", { group: group.title })}
            </DialogDescription>
          </DialogHeader>
          <form id={`add-${group.id}`} onSubmit={onSubmit}>
            <RadioGroup
              value={wishlistId}
              onValueChange={setWishlistId}
              className="gap-5"
            >
              {renderOptions(t("own"), own)}
              {renderOptions(t("forSomeoneElse"), forSomeoneElse)}
            </RadioGroup>
          </form>
          <Button
            type="button"
            variant="ghost"
            className="justify-self-start"
            onClick={createNew}
          >
            <Plus size="16" className="mr-2" /> {t("new")}
          </Button>
          <DialogFooter>
            <Button type="submit" form={`add-${group.id}`}>
              <ListPlus size="16" className="mr-2" /> {t("submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewWishlist
        groups={groups}
        managers={managers}
        defaultGroupIds={[group.id]}
        open={newOpen}
        onOpenChange={setNewOpen}
      />
    </>
  )
}
