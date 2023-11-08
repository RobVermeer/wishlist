import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroups } from "@/lib/groups/getGroups"
import { RemoveGroup } from "./components/RemoveGroup"

export default async function AdminUsersPage() {
  const groups = await getGroups()

  return (
    <List>
      <ListTitle>Groups</ListTitle>

      {groups.map((group) => (
        <Card key={group.id} className="flex gap-2 items-center">
          <span className="leading-none">
            {group.title}
            <br />
            <small className="text-xs text-slate-500">
              {group.createdBy.name}
            </small>
          </span>

          <RemoveGroup id={group.id} />
        </Card>
      ))}
    </List>
  )
}
