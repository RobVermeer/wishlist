import "server-only"

import { cookies } from "next/headers"
import { cookieName } from "@/components/CategoryList/openCategories"

export async function getOpenCategories() {
  const cookieStore = await cookies()

  return cookieStore.get(cookieName)?.value ?? ""
}
