import Link from "next/link"
import { Gift } from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"
import { Button } from "@/components/ui/button"
import type { getLotForUser } from "@/lib/draws/getLotForUser"

interface Props {
  groupId: string
  lot: NonNullable<Awaited<ReturnType<typeof getLotForUser>>>
}

export const DrawLot = async ({ groupId, lot }: Props) => {
  const t = await getTranslations("Draw.lot")
  const format = await getFormatter()
  const { receiver, wishlistId, budget, date } = lot

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
      <p className="font-display text-2xl font-semibold">
        {t.rich("drawn", {
          name: receiver,
          strong: chunks => <strong className="text-primary">{chunks}</strong>,
        })}
      </p>
      {(budget !== null || date) && (
        <p className="text-sm text-muted-foreground">
          {[
            budget !== null &&
              t("budget", {
                budget: format.number(budget, {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }),
              }),
            date &&
              t("date", {
                date: format.dateTime(date, {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "UTC",
                }),
              }),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {wishlistId ? (
        <Button asChild className="justify-self-start">
          <Link href={`/group/${groupId}/${wishlistId}`}>
            {t("wishlist", { name: receiver })}
          </Link>
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("noWishlist", { name: receiver })}
        </p>
      )}
    </section>
  )
}
