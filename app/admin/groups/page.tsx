import { Group } from "@prisma/client"
import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { getGroups } from "~/lib/groups/getGroups"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import AdminGroupsPage from "./content"

export default async function Page() {
  const session = await unstable_getServerSession(authOptions)

  if (!session || !session.user.isAdmin) {
    return notFound()
  }

  const data = await getGroups()

  return <AdminGroupsPage groupsData={data as unknown as Group[]} />
}
