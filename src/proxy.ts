import createMiddleware from "next-intl/middleware"
import { NextRequest } from "next/server"
import { routing } from "@/i18n/routing"

const handleI18nRouting = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
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
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
}
