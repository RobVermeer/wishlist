import { EmptyState } from "@/components/EmptyState"
import { Header } from "@/components/Header"
import { Layout } from "@/components/Layout"
import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { getTranslations } from "next-intl/server"

export default async function NotFound() {
  const session = await getServerSession(authOptions)
  const t = await getTranslations("NotFound")

  return (
    <>
      <Header session={session} />

      <Layout>
        <EmptyState title={t("empty.title")}>
          {t.rich("empty.text", {
            dashboard: (chunks) => (
              <Link href="/" className="text-primary">
                {chunks}
              </Link>
            ),
          })}
        </EmptyState>
      </Layout>
    </>
  )
}
