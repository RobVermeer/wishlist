import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const List = ({ children }: Props) => (
  <div className="grid gap-2">{children}</div>
)
