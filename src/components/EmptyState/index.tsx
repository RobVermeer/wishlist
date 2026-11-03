import { ReactNode } from "react"

interface Props {
  title: ReactNode
  children?: ReactNode
  // h1 when the empty state is all there is on the page.
  as?: "h1" | "h3"
}

export const EmptyState = ({ title, children, as: Heading = "h3" }: Props) => (
  <div className="grid gap-1">
    <Heading className="text-xl text-secondary-foreground">{title}</Heading>
    {children && <p className="text-muted-foreground">{children}</p>}
  </div>
)
