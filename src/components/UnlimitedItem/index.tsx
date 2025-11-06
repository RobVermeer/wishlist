import { InfinityIcon } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useTranslations } from "next-intl"

export const UnlimitedItem = () => {
  const t = useTranslations("Toggle")

  return (
    <div className="absolute right-3">
      <Tooltip>
        <TooltipTrigger>
          <InfinityIcon />
        </TooltipTrigger>
        <TooltipContent>
          <p>{t("unlimited")}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
