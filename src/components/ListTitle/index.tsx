import { ReactNode } from "react"

interface Props {
  children: ReactNode
  // h1 when it's the title of the page, h2 for a section.
  as?: "h1" | "h2"
}

export const ListTitle = ({ children, as: Heading = "h2" }: Props) => (
  <Heading className="mb-1 text-3xl font-semibold tracking-tight">
    {children}
  </Heading>
)
