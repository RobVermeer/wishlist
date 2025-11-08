import { InfinityIcon } from "lucide-react"
import { useTranslations } from "next-intl"

export const UnlimitedItem = () => {
  const t = useTranslations("Toggle")

  return (
    <div className="absolute right-3">
      <InfinityIcon />
      {/* <p>{t("unlimited")}</p> */}
    </div>
  )
}
