import { clsx } from "clsx"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: Props) => (
  <div
    className={clsx(
      className,
      "font-semibold relative rounded-md p-3 bg-secondary hover:ring-2 ring-inset ring-primary transition-all"
    )}
  >
    {children}
  </div>
)
