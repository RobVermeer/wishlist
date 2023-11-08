import { ReactNode } from "react"

interface Props {
  title: ReactNode
  children: ReactNode
}

export const EmptyState = ({ title, children }: Props) => (
  <div className="grid gap-1">
    <h3 className="text-xl text-slate-600">{title}</h3>
    <p className="text-slate-400">{children}</p>
  </div>
)
