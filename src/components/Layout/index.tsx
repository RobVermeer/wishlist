import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const Layout = ({ children }: Props) => (
  <div className="grid gap-4 p-4 mx-auto md:max-w-xl">{children}</div>
)
