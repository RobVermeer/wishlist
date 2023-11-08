import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const ListTitle = ({ children }: Props) => (
  <h2 className="text-2xl text-slate-800">{children}</h2>
)
