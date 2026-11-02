"use client"

import { ReactNode, useRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  className?: string
  details?: ReactNode
  children?: ReactNode
}

// Shows who you drew only when you ask, so it doesn't show when you show the
// app to someone. Until then the name isn't in the page, also not for screen
// readers or searching in the page, and every visit starts hidden again.
// The placeholder for the name shows it too, people tap that first.
export const LotReveal = ({ name, className, details, children }: Props) => {
  const t = useTranslations("Draw.lot")
  const [revealed, setRevealed] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)

  const reveal = () => {
    setRevealed(true)
    // The placeholder disappears, so keep the focus on the toggle.
    toggle.current?.focus()
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className={cn("font-display font-semibold", className)}>
          {revealed
            ? t.rich("drawn", {
                name,
                strong: chunks => (
                  <strong className="text-primary">{chunks}</strong>
                ),
              })
            : t.rich("hidden", {
                secret: chunks => (
                  <>
                    <span className="sr-only">{chunks}</span>
                    <button
                      type="button"
                      aria-label={t("revealName")}
                      onClick={reveal}
                      className="inline-block cursor-pointer outline-none focus-visible:rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&:hover>span]:bg-primary/30"
                    >
                      <span
                        aria-hidden
                        className="inline-block h-[0.75em] w-24 rounded-full bg-primary/20 transition-colors"
                      />
                    </button>
                  </>
                ),
              })}
        </p>
        <Button
          ref={toggle}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRevealed(!revealed)}
        >
          {revealed ? (
            <EyeOff size="16" className="mr-2" />
          ) : (
            <Eye size="16" className="mr-2" />
          )}
          {revealed ? t("hide") : t("reveal")}
        </Button>
      </div>
      {details}
      {revealed && children}
    </>
  )
}
