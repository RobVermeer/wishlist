import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export const Layout = ({ children }: Props) => (
  <main className="grid w-full gap-8 px-4 pt-6 pb-12 mx-auto md:max-w-[640px]">
    {children}
  </main>
)
