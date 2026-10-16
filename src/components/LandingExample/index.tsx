import { clsx } from "clsx"
import { InfinityIcon, Link } from "lucide-react"
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
  const tToggle = useTranslations("Toggle")

  return (
    <section className="grid gap-2">
      <ListTitle>{t("title")}</ListTitle>

      <figure className="grid gap-2 rounded-lg border p-4">
        <p className="text-center text-xl text-primary">{t("owner")}</p>

        <ul className="grid gap-2">
          {items.map(item => (
            <li
              key={item.key}
              className="flex items-center justify-between gap-2 rounded-md bg-secondary p-3 font-semibold"
            >
              <span
                className={clsx(
                  "bought" in item &&
                    "line-through decoration-primary decoration-2"
                )}
              >
                {"link" in item && (
                  <Link size="16" strokeWidth="2.5" className="inline mr-1" />
                )}
                {t(`items.${item.key}`)}
              </span>
              {"unlimited" in item ? (
                <span className="flex items-center gap-1 text-sm font-normal text-muted-foreground">
                  <InfinityIcon aria-hidden size="18" />{" "}
                  {tToggle("unlimitedLabel")}
                </span>
              ) : "bought" in item ? (
                <span className="text-sm font-normal text-muted-foreground no-underline">
                  {tToggle("boughtByOther")}
                </span>
              ) : (
                <span className="rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium">
                  {t("buy")}
                </span>
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
