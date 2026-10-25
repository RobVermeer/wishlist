import { getFormatter, getTranslations } from "next-intl/server"

interface Props {
  budget: number | null
  date: Date | null
}

export const DrawDetails = async ({ budget, date }: Props) => {
  const t = await getTranslations("Draw.lot")
  const format = await getFormatter()

  if (budget === null && !date) return null

  return (
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
  )
}
