import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function NotFound() {
  const t = await getTranslations("NotFound")

  return (
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
  )
}
