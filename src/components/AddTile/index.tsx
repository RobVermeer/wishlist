import { Plus } from "lucide-react"
import { ComponentProps } from "react"

interface Props extends ComponentProps<"button"> {
  label: string
}

export const AddTile = ({ label, ...props }: Props) => (
  <button
    type="button"
    className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-input bg-card/40 p-4 text-center font-medium text-muted-foreground transition-all hover:-rotate-1 hover:border-primary hover:text-primary"
    {...props}
  >
    <Plus size="24" />
    {label}
  </button>
)
