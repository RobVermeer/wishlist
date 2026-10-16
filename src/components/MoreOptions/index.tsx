"use client"

import { ChevronDown } from "lucide-react"
import { useTranslations } from "next-intl"
import { ReactNode, useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface Props {
  defaultOpen?: boolean
  children: ReactNode
}

export const MoreOptions = ({ defaultOpen = false, children }: Props) => {
  const t = useTranslations("MoreOptions")
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="grid gap-4">
      <CollapsibleTrigger className="flex items-center gap-1 justify-self-start text-sm font-medium text-primary">
        <ChevronDown
          size="16"
          className={cn("transition-transform", !open && "-rotate-90")}
        />
        {t("toggle")}
      </CollapsibleTrigger>
      <CollapsibleContent
        forceMount
        className="grid gap-4 data-[state=closed]:hidden"
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}
