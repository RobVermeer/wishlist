import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import AdminDashboardPage from "./content"

export default async function Page() {
  const session = await unstable_getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    return notFound()
  }

  return <AdminDashboardPage />
}
