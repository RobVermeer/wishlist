import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const Layout = ({ children }: Props) => (
  <div className="grid gap-6 p-4 mb-8 mx-auto md:max-w-xl">{children}</div>
)
