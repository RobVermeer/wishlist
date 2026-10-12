import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["nl"],
  defaultLocale: "nl",
  localePrefix: "never",
  localeDetection: false,
})
