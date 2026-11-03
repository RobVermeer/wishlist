"use client"

import { EmptyState } from "@/components/EmptyState"
import { Layout } from "@/components/Layout"
import messages from "@/messages/nl.json"
import Link from "next/link"
import { NextIntlClientProvider, useTranslations } from "next-intl"

// The texts of the error page when the root layout fails, which then can't
// provide them.
export const GlobalError = () => (
  <NextIntlClientProvider locale="nl" messages={{ Error: messages.Error }}>
    <ErrorContent />
  </NextIntlClientProvider>
)

const ErrorContent = () => {
  const t = useTranslations("Error")

  return (
    <Layout>
      <title>{`${t("empty.title")} - Niet Weer Sokken`}</title>
      <EmptyState title={t("empty.title")}>
        {t.rich("empty.text", {
          dashboard: chunks => (
            <Link href="/" className="text-primary">
              {chunks}
            </Link>
          ),
        })}
      </EmptyState>
    </Layout>
  )
}
