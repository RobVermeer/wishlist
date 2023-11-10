import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroupById } from "@/lib/groups/getGroupById"
import { SendEmails } from "./components/SendEmails"

interface Props {
  params: { id: string }
}

export default async function AdminGroupsDrawPage({ params }: Props) {
  const group = await getGroupById(params.id)

  return (
    <List>
      <ListTitle>{group.title}</ListTitle>

      <p>Select users to draw lootjes for.</p>

      <SendEmails group={group} />
    </List>
  )
}
