import { CopyCheck, Gift, Link, ListPlus, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { ListTitle } from "@/components/ListTitle"
import { WishlistIcon, wishlistColors } from "@/components/WishlistIcon"
import { cn } from "@/lib/utils"

const groups = ["sinterklaas", "christmas"] as const

const points = [
  { key: "multiple", Icon: ListPlus, color: "text-pink-500" },
  { key: "oneLink", Icon: Link, color: "text-sky-500" },
  { key: "noDouble", Icon: CopyCheck, color: "text-emerald-500" },
] as const

export const LandingGroups = () => {
  const t = useTranslations("Landing.groups")
  const owner = t("owner")

  return (
    <section className="grid gap-2">
      <ListTitle>{t("title")}</ListTitle>

      <figure
        aria-label={t("label")}
        className="grid gap-3 rounded-lg border p-4"
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="overflow-hidden rounded-md bg-secondary">
            <div
              className={cn(
                "flex h-20 flex-col justify-between p-2",
                wishlistColors("birthday")
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white/70 shadow-sm dark:bg-white/15">
                <WishlistIcon theme="birthday" className="size-4" />
              </span>
              <h3 className="font-display text-sm font-semibold text-foreground">
                {owner}
              </h3>
            </div>
            <p className="flex items-center gap-1 p-2 text-xs text-muted-foreground">
              <Link aria-hidden size="12" /> {t("shared")}
            </p>
          </li>
          {groups.map(group => (
            <li key={group} className="overflow-hidden rounded-md bg-secondary">
              <div
                className="relative flex h-20 items-end bg-cover bg-center p-2"
                style={{ backgroundImage: `url('/theme/${group}.webp')` }}
              >
                <div className="absolute inset-0 bg-linear-to-t from-black/75 to-transparent" />
                <h3 className="relative text-sm font-semibold text-white">
                  {t(`${group}.title`)}
                </h3>
              </div>
              <ul className="flex flex-wrap gap-1.5 p-2">
                {(t.raw(`${group}.members`) as string[]).map(name => (
                  <li
                    key={name}
                    className={
                      name === owner
                        ? "flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                        : "rounded-full bg-background px-2.5 py-1 text-xs"
                    }
                  >
                    {name === owner && <Gift aria-hidden size="12" />}
                    {name}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          <li className="flex min-h-20 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-input p-2 text-muted-foreground">
            <Plus aria-hidden size="20" />
            <h3 className="text-sm font-medium">{t("other")}</h3>
          </li>
        </ul>
      </figure>

      <ul className="grid gap-2 sm:grid-cols-3">
        {points.map(({ key, Icon, color }) => (
          <li
            key={key}
            className="row-span-2 grid grid-rows-subgrid gap-1 rounded-md bg-secondary p-4"
          >
            <h3 className="flex items-start gap-2 font-semibold">
              <Icon
                aria-hidden
                className={cn("mt-0.5 shrink-0", color)}
                size="20"
                strokeWidth="2.5"
              />
              {t(`points.${key}.title`)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(`points.${key}.text`)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
