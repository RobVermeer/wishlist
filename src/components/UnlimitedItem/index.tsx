import { InfinityIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

export const UnlimitedItem = () => {
  const t = useTranslations("Toggle")

  return (
    <Popover>
      <PopoverTrigger className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
        <InfinityIcon size="18" /> {t("unlimitedLabel")}
      </PopoverTrigger>
      <PopoverContent>
        <p>{t("unlimited")}</p>
      </PopoverContent>
    </Popover>
  )
}
