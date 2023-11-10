import { ReactNode } from "react"

interface Props {
  title: ReactNode
  children: ReactNode
}

export const EmptyState = ({ title, children }: Props) => (
  <div className="grid gap-1">
    <h3 className="text-xl text-secondary-foreground">{title}</h3>
    <p className="text-muted-foreground">{children}</p>
  </div>
)
