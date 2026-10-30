import Link from "next/link"
import { useTranslations } from "next-intl"

export function Footer() {
  const t = useTranslations("Footer")

  return (
    <footer className="mx-auto px-4 pb-8 text-center text-sm text-muted-foreground md:max-w-[640px]">
      <Link href="/privacy" className="hover:text-primary hover:underline">
        {t("privacy")}
      </Link>
    </footer>
  )
}
