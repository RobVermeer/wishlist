import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  title: string
  count: number
  open: boolean
}

export const CategoryTitle = ({ title, count, open }: Props) => (
  <>
    <ChevronDown
      size="18"
      strokeWidth="2.5"
      className={cn("text-primary transition-transform", !open && "-rotate-90")}
    />
    {title}
    <span className="text-sm font-normal text-muted-foreground">{count}</span>
  </>
)
