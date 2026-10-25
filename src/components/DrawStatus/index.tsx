"use client"

import { useTransition } from "react"
import { Send } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { resendDrawLot } from "@/lib/draws/resendDrawLot"
import type { getDrawForCreator } from "@/lib/draws/getDrawForCreator"
import { cn } from "@/lib/utils"

interface Props {
  participants: NonNullable<Awaited<ReturnType<typeof getDrawForCreator>>>
}

export const DrawStatus = ({ participants }: Props) => {
  const t = useTranslations("Draw.status")
  const { toast } = useToast()
  const [pending, startTransition] = useTransition()
  const left = participants.filter(({ status }) => status === "left")

  function resend(id: string) {
    startTransition(async () => {
      const { type, errors } = await resendDrawLot(id)

      if (type === "error") {
        errors.forEach(title => {
          toast({ variant: "destructive", title })
        })
        return
      }

      toast({ title: t("resent") })
    })
  }

  return (
    <div className="grid gap-2">
      <h4 id="draw-status" className="text-sm font-medium">
        {t("title")}
      </h4>
      <ul aria-labelledby="draw-status" className="grid gap-1">
        {participants.map(({ id, name, status, canResend }) => (
          <li
            key={id}
            className="flex items-center justify-between gap-2 rounded-md bg-secondary px-3 py-1.5"
          >
            <span className="truncate">{name}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "text-xs",
                  status === "member"
                    ? "text-muted-foreground"
                    : "font-medium text-primary"
                )}
              >
                {t(status)}
              </span>
              {status === "invited" && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={!canResend || pending}
                  onClick={() => resend(id)}
                >
                  <Send size="14" className="mr-1.5" /> {t("resend")}
                </Button>
              )}
            </span>
          </li>
        ))}
      </ul>
      {left.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("leftWarning", {
            names: left.map(({ name }) => name).join(", "),
            count: left.length,
          })}
        </p>
      )}
    </div>
  )
}
