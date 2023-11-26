import { EmptyState } from "@/components/EmptyState"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function NotFound() {
  const t = useTranslations("NotFound")

  return (
    <EmptyState title={t("empty.title")}>
      {t.rich("empty.text", {
        dashboard: (chunks) => (
          <Link href="/" className="text-primary">
            {chunks}
          </Link>
        ),
      })}
    </EmptyState>
  )
}
