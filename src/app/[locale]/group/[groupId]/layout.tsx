import { Layout } from "@/components/Layout"
import { ReactNode } from "react"

interface Props {
  children: ReactNode
}

export default async function GroupLayout({ children }: Props) {
  return <Layout>{children}</Layout>
}
