import { useTranslations } from "next-intl"
import { ListTitle } from "@/components/ListTitle"

const occasions = ["sinterklaas", "christmas", "birthday", "baby"] as const

export const LandingOccasions = () => {
  const t = useTranslations("Landing.occasions")

  return (
    <section className="grid gap-2">
      <ListTitle>{t("title")}</ListTitle>

      <ul className="grid gap-2 grid-cols-2">
        {occasions.map(occasion => (
          <li
            key={occasion}
            className="relative overflow-hidden aspect-video flex items-center justify-center font-semibold rounded-md bg-secondary bg-cover bg-center"
            style={{ backgroundImage: `url('/theme/${occasion}.webp')` }}
          >
            <div className="absolute inset-0 translate-y-1/3 bg-linear-to-b from-transparent to-black" />
            <span className="absolute bottom-3 px-2 text-center text-primary-foreground">
              {t(occasion)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
