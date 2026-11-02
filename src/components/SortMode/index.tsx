"use client"

import { ArrowUpDown, Check } from "lucide-react"
import { useTranslations } from "next-intl"
import { ReactNode, createContext, useContext, useState } from "react"
import { Button } from "@/components/ui/button"

const SortModeContext = createContext(false)

export const useSortMode = () => useContext(SortModeContext)

interface Props {
  enabled: boolean
  withCategories: boolean
  children: ReactNode
}

// Shows the handles to drag wishes and categories only while sorting, so
// they don't clutter the list the rest of the time.
export const SortMode = ({ enabled, withCategories, children }: Props) => {
  const t = useTranslations("SortMode")
  const [sorting, setSorting] = useState(false)

  if (!enabled) return children

  return (
    <SortModeContext value={sorting}>
      <div className="flex min-h-9 items-center justify-end gap-3">
        {sorting && (
          <p className="mr-auto text-sm text-muted-foreground">
            {t("hint", { withCategories: String(withCategories) })}
          </p>
        )}
        {/* One button that changes its text, so focus stays on it. */}
        <Button
          size="sm"
          variant="outline"
          className="shrink-0"
          onClick={() => setSorting(!sorting)}
        >
          {sorting ? (
            <>
              <Check size="12" className="mr-2" /> {t("done")}
            </>
          ) : (
            <>
              <ArrowUpDown size="12" className="mr-2" /> {t("start")}
            </>
          )}
        </Button>
      </div>
      {children}
    </SortModeContext>
  )
}
