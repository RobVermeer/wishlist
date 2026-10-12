import { useTranslations } from "next-intl"
import { ListTitle } from "@/components/ListTitle"

const steps = ["login", "wishlist", "group"] as const

export const LandingSteps = () => {
  const t = useTranslations("Landing.steps")

  return (
    <section className="grid gap-2">
      <ListTitle>{t("title")}</ListTitle>

      <ol className="grid gap-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
              {index + 1}
            </span>
            {t(step)}
          </li>
        ))}
      </ol>
    </section>
  )
}
