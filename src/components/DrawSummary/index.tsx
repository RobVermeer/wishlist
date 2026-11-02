"use client"

import { ReactNode, useState } from "react"
import { ChevronDown, Dices } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { DrawStatus } from "@/components/DrawStatus"
import type { getDrawForCreator } from "@/lib/draws/getDrawForCreator"
import { cn } from "@/lib/utils"

interface Props {
  participants: NonNullable<Awaited<ReturnType<typeof getDrawForCreator>>>
  children: ReactNode
}

// Once the lootjes are drawn there's little left to do, so the creator sees
// one line, unless someone still has to join or left the group.
export const DrawSummary = ({ participants, children }: Props) => {
  const t = useTranslations("Draw.manage")
  const joined = participants.filter(({ status }) => status === "member")
  const [open, setOpen] = useState(joined.length < participants.length)

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
      <section
        aria-labelledby="draw-title"
        className="grid gap-3 rounded-md border p-4"
      >
        <h3 id="draw-title">
          <CollapsibleTrigger className="flex w-full items-center gap-2 text-left">
            <Dices aria-hidden size="18" className="shrink-0 text-primary" />
            <span className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-medium">{t("drawnTitle")}</span>{" "}
              <span className="font-sans text-sm text-muted-foreground">
                {t("summary", {
                  joined: joined.length,
                  count: participants.length,
                })}
              </span>
            </span>
            <ChevronDown
              aria-hidden
              size="18"
              className={cn(
                "ml-auto shrink-0 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
        </h3>
        <CollapsibleContent className="grid gap-3">
          <p className="text-sm text-muted-foreground">{t("drawnText")}</p>
          <DrawStatus participants={participants} />
          {children}
        </CollapsibleContent>
      </section>
    </Collapsible>
  )
}
