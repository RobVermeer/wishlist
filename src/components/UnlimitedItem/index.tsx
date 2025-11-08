import { InfinityIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

export const UnlimitedItem = () => {
  const t = useTranslations("Toggle")

  return (
    <div className="absolute right-3">
      <Popover>
        <PopoverTrigger>
          <InfinityIcon />
        </PopoverTrigger>
        <PopoverContent>
          <p>{t("unlimited")}</p>
        </PopoverContent>
      </Popover>
    </div>
  )
}
