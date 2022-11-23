import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { getUsers } from "~/lib/users/getUsers"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import AdminUsersPage from "./content"

export default async function Page() {
  const session = await unstable_getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    return notFound()
  }

  const data = await getUsers()

  return <AdminUsersPage session={session} userData={data} />
}
