"use client"

import { useState } from "react"
import { format, parseISO } from "date-fns"
import { nl } from "react-day-picker/locale"
import { CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Props {
  id: string
  name: string
  placeholder: string
  // The first date that can be chosen, like `min` of a date input.
  min?: string
}

// A date field in the style of the app, instead of the date picker of the
// browser. It submits the date as yyyy-MM-dd, like a date input does.
export const DatePicker = ({ id, name, placeholder, min }: Props) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const selected = value ? parseISO(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start px-3 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarDays size="16" className="mr-2 shrink-0" />
          {selected
            ? format(selected, "d MMMM yyyy", { locale: nl })
            : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={nl}
          selected={selected}
          defaultMonth={selected ?? (min ? parseISO(min) : undefined)}
          disabled={min ? { before: parseISO(min) } : undefined}
          onSelect={date => {
            setValue(date ? format(date, "yyyy-MM-dd") : "")
            setOpen(false)
          }}
          autoFocus
        />
      </PopoverContent>
      <input type="hidden" name={name} value={value} />
    </Popover>
  )
}
