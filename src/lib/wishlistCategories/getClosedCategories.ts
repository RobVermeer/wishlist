import "server-only"

import { cookies } from "next/headers"
import { cookieName } from "@/components/CategoryList/closedCategories"

export async function getClosedCategories() {
  const cookieStore = await cookies()

  return cookieStore.get(cookieName)?.value ?? ""
}
