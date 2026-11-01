import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useTranslations } from "next-intl"

interface Props {
  href: string
  label: string
}

export const BackLink = ({ href, label }: Props) => {
  const t = useTranslations("BackLink")

  return (
    <Link
      href={href}
      className="-ml-1 flex w-fit max-w-full items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronLeft aria-hidden size="16" className="shrink-0" />
      <span className="sr-only">{t("back")} </span>
      <span className="truncate">{label}</span>
    </Link>
  )
}
