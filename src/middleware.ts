import createMiddleware from "next-intl/middleware"
import { NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
  const handleI18nRouting = createMiddleware({
    locales: ["nl"],
    defaultLocale: "nl",
    domains: [
      {
        domain:
          process.env.NODE_ENV === "production"
            ? "wishlist.ru-coding.nl"
            : "localhost:3000",
        defaultLocale: "nl",
        locales: ["nl"],
      },
    ],
    localePrefix: "never",
    localeDetection: false,
  })

  const response = handleI18nRouting(request)

  if (request.headers.get("Accept")?.includes("text/html")) {
    response.headers.set(
      "Accept-CH",
      `Sec-CH-Prefers-Color-Scheme, Sec-CH-Prefers-Contrast`
    )
    response.headers.set("Vary", "Sec-CH-Prefers-Color-Scheme")
    response.headers.set("Critical-CH", "Sec-CH-Prefers-Color-Scheme")
    return response
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
