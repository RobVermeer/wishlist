"use client"

import { Check, ChevronsUpDown, Plus } from "lucide-react"
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
import { cn } from "@/lib/utils"

interface Props {
  id: string
  name: string
  categories: string[]
  defaultValue?: string
}

export const CategoryCombobox = ({
  id,
  name,
  categories,
  defaultValue = "",
}: Props) => {
  const t = useTranslations("CategoryCombobox")
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(defaultValue)
  const [search, setSearch] = useState("")
  const newCategory = search.trim()
  const exists = categories.some(
    category => category.toLowerCase() === newCategory.toLowerCase()
  )

  function select(category: string) {
    setValue(category)
    setSearch("")
    setOpen(false)
  }

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between px-3 font-normal"
          >
            <span className={cn(!value && "text-muted-foreground")}>
              {value || t("placeholder")}
            </span>
            <ChevronsUpDown size="16" className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-(--radix-popover-trigger-width) p-0"
        >
          <Command>
            <CommandInput
              placeholder={t("search")}
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{t("empty")}</CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem value={t("none")} onSelect={() => select("")}>
                    <span className="size-4" />
                    {t("none")}
                  </CommandItem>
                )}
                {categories.map(category => (
                  <CommandItem
                    key={category}
                    value={category}
                    onSelect={() => select(category)}
                  >
                    <Check
                      className={cn(
                        value === category ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {category}
                  </CommandItem>
                ))}
                {newCategory && !exists && (
                  <CommandItem
                    value={newCategory}
                    onSelect={() => select(newCategory)}
                  >
                    <Plus />
                    {t("create", { category: newCategory })}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
