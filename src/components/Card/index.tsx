import { clsx } from "clsx"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: Props) => (
  <div className={clsx(className, "rounded-md p-3 bg-slate-100")}>
    {children}
  </div>
)
