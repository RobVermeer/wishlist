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
      "relative rounded-2xl border bg-card p-4 font-medium shadow-[0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(60_30_10/0.12)] transition-all hover:-translate-y-px hover:shadow-[0_2px_4px_rgb(0_0_0/0.05),0_10px_24px_-10px_rgb(60_30_10/0.25)]"
    )}
  >
    {children}
  </div>
)
