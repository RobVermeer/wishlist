import { NextResponse, NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.headers.get("Accept")?.includes("text/html")) {
    const response = NextResponse.next()
    response.headers.set(
      "Accept-CH",
      `Sec-CH-Prefers-Color-Scheme, Sec-CH-Prefers-Contrast`
    )
    response.headers.set("Vary", "Sec-CH-Prefers-Color-Scheme")
    response.headers.set("Critical-CH", "Sec-CH-Prefers-Color-Scheme")
    return response
  }

  return NextResponse.next()
}
