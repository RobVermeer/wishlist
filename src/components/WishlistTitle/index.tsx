import { useTranslations } from "next-intl"

interface Props {
  wishlist: {
    title: string | null
    isOwnList: boolean
    user: { firstName: string | null; name: string | null }
  }
  className?: string
}

export const WishlistTitle = ({ wishlist, className = "" }: Props) => {
  const t = useTranslations()
  const { title, user, isOwnList } = wishlist
  const listTitle =
    title ||
    (isOwnList
      ? t("Common.myList")
      : user.firstName || user.name?.split(" ")[0])

  return <span className={className}>{listTitle}</span>
}
