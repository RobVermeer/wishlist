"use client"

import { CSSProperties, ReactNode, Ref } from "react"
import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { useCategoryOpen } from "./useCategoryOpen"

export interface Category {
  id: string
  title: string
  count: number
  items: ReactNode
}

interface Props {
  category: Category
  closedCategories: string
  handle?: ReactNode
  ref?: Ref<HTMLDivElement>
  style?: CSSProperties
}

export const CategorySection = ({
  category,
  closedCategories,
  handle,
  ref,
  style,
}: Props) => {
  const [open, setOpen] = useCategoryOpen(category.id, closedCategories)

  return (
    <Collapsible
      ref={ref}
      style={style}
      open={open}
      onOpenChange={setOpen}
      className="grid gap-2 mt-2"
    >
      <div className="flex items-center gap-1">
        {handle}
        <CollapsibleTrigger className="flex flex-1 items-center gap-2 py-1 text-left text-lg font-semibold">
          <ChevronDown
            size="18"
            strokeWidth="2.5"
            className={cn(
              "text-primary transition-transform",
              !open && "-rotate-90"
            )}
          />
          {category.title}
          <span className="text-sm font-normal text-muted-foreground">
            {category.count}
          </span>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="grid gap-2">
        {category.items}
      </CollapsibleContent>
    </Collapsible>
  )
}
