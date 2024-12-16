import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroupById } from "@/lib/groups/getGroupById"
import { SendEmails } from "./components/SendEmails"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { UnDeleteGroup } from "./components/UnDeleteGroup"

interface Props {
  params: { id: string }
}

export default async function AdminGroupsDrawPage({ params }: Props) {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const group = await getGroupById(params.id, true)

  if (!group) {
    notFound()
  }

  return (
    <List>
      <ListTitle>{group.title}</ListTitle>
      <p>Undo delete group</p>
      <UnDeleteGroup id={group.id} />

      <p>Select users to draw lootjes for.</p>
      <SendEmails group={group} />
    </List>
  )
}
