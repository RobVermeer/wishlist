import { clsx } from "clsx"
import { InfinityIcon, Link, Square, SquareCheckBig } from "lucide-react"
import { useTranslations } from "next-intl"
import { ListTitle } from "@/components/ListTitle"

const items = [
  { key: "bike", link: true },
  { key: "books", unlimited: true },
  { key: "lego", bought: true },
  { key: "socks" },
] as const

export const LandingExample = () => {
  const t = useTranslations("Landing.example")

  return (
    <section className="grid gap-2">
      <ListTitle>{t("title")}</ListTitle>

      <figure className="grid gap-2 rounded-lg border p-4">
        <p className="text-center text-xl text-primary">{t("owner")}</p>

        <ul className="grid gap-2">
          {items.map(item => (
            <li
              key={item.key}
              className={clsx(
                "flex items-center justify-between rounded-md bg-secondary p-3 font-semibold",
                "bought" in item &&
                  "line-through decoration-primary decoration-2"
              )}
            >
              <span>
                {"link" in item && (
                  <Link size="16" strokeWidth="2.5" className="inline mr-1" />
                )}
                {t(`items.${item.key}`)}
              </span>
              {"unlimited" in item ? (
                <InfinityIcon aria-hidden />
              ) : "bought" in item ? (
                <SquareCheckBig
                  aria-hidden
                  className="text-primary"
                  strokeWidth="2.5"
                />
              ) : (
                <Square
                  aria-hidden
                  className="text-secondary-foreground"
                  strokeWidth="2.5"
                />
              )}
            </li>
          ))}
        </ul>

        <figcaption className="text-center text-sm text-muted-foreground">
          {t("caption")}
        </figcaption>
      </figure>
    </section>
  )
}
