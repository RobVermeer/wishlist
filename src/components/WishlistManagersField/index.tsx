"use client"

import { Plus, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { ManagerOption } from "@/lib/users/getManagerOptionsForUser"

interface Props {
  managers: ManagerOption[]
  defaultManagerIds?: string[]
}

export const WishlistManagersField = ({
  managers,
  defaultManagerIds = [],
}: Props) => {
  const t = useTranslations("Common.wishlist.managers")
  const [open, setOpen] = useState(false)
  const [chosenIds, setChosenIds] = useState(defaultManagerIds)
  const chosen = managers.filter(({ id }) => chosenIds.includes(id))
  const available = managers.filter(({ id }) => !chosenIds.includes(id))

  function choose(id: string) {
    setChosenIds(ids => [...ids, id])
    setOpen(false)
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="mb-1 text-sm font-medium">{t("label")}</legend>
      <p className="text-sm text-muted-foreground">
        {managers.length > 0 ? t("text") : t("empty")}
      </p>

      {chosen.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {chosen.map(manager => (
            <li
              key={manager.id}
              className="flex items-center gap-1 rounded-full bg-secondary py-1 pr-1 pl-3 text-sm"
            >
              <input type="hidden" name="managers" value={manager.id} />
              {manager.name}
              <button
                type="button"
                aria-label={t("remove", { name: manager.name })}
                className="rounded-full p-1 hover:bg-background"
                onClick={() =>
                  setChosenIds(ids => ids.filter(id => id !== manager.id))
                }
              >
                <X size="14" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="justify-self-start"
            >
              <Plus size="16" className="mr-1" /> {t("choose")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-0">
            <Command
              filter={(_, search, keywords = []) =>
                keywords.some(name =>
                  name.toLowerCase().includes(search.toLowerCase())
                )
                  ? 1
                  : 0
              }
            >
              <CommandInput placeholder={t("search")} />
              <CommandList>
                <CommandEmpty>{t("noMatch")}</CommandEmpty>
                <CommandGroup>
                  {available.map(manager => (
                    <CommandItem
                      key={manager.id}
                      value={manager.id}
                      keywords={[manager.name]}
                      onSelect={() => choose(manager.id)}
                    >
                      {manager.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </fieldset>
  )
}
