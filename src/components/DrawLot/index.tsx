import Link from "next/link"
import { Gift } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { DrawDetails } from "@/components/DrawDetails"
import { Button } from "@/components/ui/button"
import type { getLotForUser } from "@/lib/draws/getLotForUser"

interface Props {
  groupId: string
  lot: NonNullable<Awaited<ReturnType<typeof getLotForUser>>>
}

export const DrawLot = async ({ groupId, lot }: Props) => {
  const t = await getTranslations("Draw.lot")
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
      <DrawDetails budget={budget} date={date} />
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
