import type * as z from "zod"

interface Translator {
  (key: string, values?: Record<string, number>): string
  has(key: string): boolean
}

// Translates the errors of the schemas in schema.ts. Pass the translator of
// Validation, from getTranslations on the server or useTranslations on the
// client.
export const translateIssues = (error: z.ZodError, t: Translator) =>
  error.issues.map(issue => {
    if (!t.has(issue.message)) return t("invalid")

    return t(issue.message, {
      min: "minimum" in issue ? Number(issue.minimum) : 0,
      max: "maximum" in issue ? Number(issue.maximum) : 0,
    })
  })
