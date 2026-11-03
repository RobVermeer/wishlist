"use client"

import { EmptyState } from "@/components/EmptyState"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function Error() {
  const t = useTranslations("Error")

  return (
    <EmptyState as="h1" title={t("empty.title")}>
      {t.rich("empty.text", {
        dashboard: chunks => (
          <Link href="/" className="text-primary">
            {chunks}
          </Link>
        ),
      })}
    </EmptyState>
  )
}
