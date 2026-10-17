import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const ListTitle = ({ children }: Props) => (
  <h2 className="mb-1 text-3xl font-semibold tracking-tight">{children}</h2>
)
