import { unstable_getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import { getGroupById } from "~/lib/groups/getGroupById"
import { GroupProperties } from "~/lib/groups/publicProperties"
import { authOptions } from "~/pages/api/auth/[...nextauth]"
import GroupPage from "./content"

export default async function Page({
  params,
}: {
  params: { groupId: string }
}) {
  const { groupId } = params
  const session = await unstable_getServerSession(authOptions)
  const data = await getGroupById(groupId)

  if (!data || !session) notFound()

  return (
    <GroupPage
      groupId={groupId}
      session={session}
      initialData={{ data } as unknown as GroupProperties[]}
    />
  )
}
