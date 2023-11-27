import { Card } from "@/components/Card"
import { getWishlistById } from "@/lib/wishlists/getWishlistById"
import { Link } from "lucide-react"
import { EditItem } from "@/components/EditItem"
import { NextIntlClientProvider, useMessages } from "next-intl"
import { pickMessages } from "@/utils/pick"

interface Props {
  item: NonNullable<
    Awaited<ReturnType<typeof getWishlistById>>
  >["wishlistItem"][0]
}

export const YourItemCard = ({ item }: Props) => {
  const { title, url } = item
  const messages = useMessages()

  return (
    <Card className="flex items-center pr-24">
      {url && (
        <a href={url} target="_blank">
          <Link size="16" strokeWidth="2.5" className="inline mr-1" /> {title}
        </a>
      )}

      {!url && title}

      <NextIntlClientProvider messages={pickMessages(messages, "EditItem")}>
        <EditItem item={item} />
      </NextIntlClientProvider>
    </Card>
  )
}
