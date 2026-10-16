import { Plus } from "lucide-react"
import { ComponentProps } from "react"

interface Props extends ComponentProps<"button"> {
  label: string
}

export const AddTile = ({ label, ...props }: Props) => (
  <button
    type="button"
    className="aspect-video flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input p-3 text-center font-semibold text-muted-foreground transition-all hover:border-primary hover:text-primary"
    {...props}
  >
    <Plus size="24" />
    {label}
  </button>
)
