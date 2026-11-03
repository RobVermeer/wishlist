"use client"

import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { RotateCw } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface Props {
  retry: () => void
}

export default function Error({ retry }: Props) {
  const t = useTranslations("Error")

  return (
    <div className="grid justify-items-start gap-4">
      <EmptyState as="h1" title={t("empty.title")}>
        {t.rich("empty.text", {
          dashboard: chunks => (
            <Link href="/" className="text-primary">
              {chunks}
            </Link>
          ),
        })}
      </EmptyState>
      <Button onClick={() => retry()}>
        <RotateCw size="16" className="mr-2" /> {t("retry")}
      </Button>
    </div>
  )
}
