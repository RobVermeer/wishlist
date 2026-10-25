import {
  Baby,
  Smartphone,
  Gift,
  InfinityIcon,
  List,
  ShoppingBasket,
  SquareCheckBig,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { ListTitle } from "@/components/ListTitle"
import { cn } from "@/lib/utils"

const features = [
  { key: "phone", Icon: Smartphone, color: "text-teal-500" },
  { key: "secret", Icon: SquareCheckBig, color: "text-primary" },
  { key: "bought", Icon: Gift, color: "text-pink-500" },
  { key: "categories", Icon: List, color: "text-orange-500" },
  { key: "managed", Icon: Baby, color: "text-purple-500" },
  { key: "unlimited", Icon: InfinityIcon, color: "text-emerald-500" },
  { key: "remind", Icon: ShoppingBasket, color: "text-sky-500" },
] as const

export const LandingFeatures = () => {
  const t = useTranslations("Landing.features")

  return (
    <section className="grid gap-2">
      <ListTitle>{t("title")}</ListTitle>

      <ul className="grid gap-2 sm:grid-cols-2">
        {features.map(({ key, Icon, color }) => (
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
              {t(`${key}.title`)}
            </h3>
            <p className="text-sm text-muted-foreground">{t(`${key}.text`)}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
