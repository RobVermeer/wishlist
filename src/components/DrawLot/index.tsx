import { Gift } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DrawDetails } from "@/components/DrawDetails"
import { LotReveal } from "@/components/LotReveal"
import type { getLotForUser } from "@/lib/draws/getLotForUser"

interface Props {
  lot: NonNullable<Awaited<ReturnType<typeof getLotForUser>>>
}

export const DrawLot = async ({ lot }: Props) => {
  const t = await getTranslations("Draw.lot")
  const { receiver, hasWishlist, budget, date } = lot

  return (
    <section
      aria-labelledby="lot-title"
      className="grid gap-2 rounded-lg bg-secondary p-4"
    >
      <h3
        id="lot-title"
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
      >
        <Gift aria-hidden size="16" className="text-primary" /> {t("title")}
      </h3>
      <LotReveal
        name={receiver}
        className="text-2xl"
        details={<DrawDetails budget={budget} date={date} />}
      >
        {!hasWishlist && (
          <p className="text-sm text-muted-foreground">
            {t("noWishlist", { name: receiver })}
          </p>
        )}
      </LotReveal>
    </section>
  )
}
