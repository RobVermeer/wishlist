import { Button } from "@/components/ui/button"
import { getTranslations } from "next-intl/server"
import Link from "next/link"

interface Props {
  path: string
  page: number
  pageCount: number
  // Other search params to keep, like a search.
  params?: Record<string, string>
}

export const Pagination = async ({
  path,
  page,
  pageCount,
  params = {},
}: Props) => {
  if (pageCount < 2) return null

  const t = await getTranslations("Pagination")

  const href = (to: number) => {
    const query = new URLSearchParams(params)
    if (to > 1) query.set("pagina", String(to))
    const search = query.toString()

    return search ? `${path}?${search}` : path
  }

  return (
    <nav
      aria-label={t("label")}
      className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2"
    >
      <div>
        {page > 1 && (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page - 1)} rel="prev">
              {t("previous")}
            </Link>
          </Button>
        )}
      </div>
      <span className="text-sm text-muted-foreground">
        {t("status", { page, pageCount })}
      </span>
      <div className="text-right">
        {page < pageCount && (
          <Button asChild variant="outline" size="sm">
            <Link href={href(page + 1)} rel="next">
              {t("next")}
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
