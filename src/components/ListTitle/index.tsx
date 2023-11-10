import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const ListTitle = ({ children }: Props) => (
  <h2 className="text-2xl mb-2 text-primary">{children}</h2>
)
