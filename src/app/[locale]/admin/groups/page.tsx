import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { getGroups } from "@/lib/groups/getGroups"
import { RemoveGroup } from "./components/RemoveGroup"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const groups = await getGroups()

  return (
    <List>
      <ListTitle>Groups</ListTitle>

      {groups.map((group) => (
        <Card key={group.id} className="flex gap-2 items-center">
          <span className="leading-none">
            {group.title}
            <br />
            <small className="text-xs text-muted-foreground">
              {group.createdBy.name}
            </small>
          </span>

          <div className="absolute right-2 flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/groups/${group.id}`}>Edit</Link>
            </Button>

            <RemoveGroup id={group.id} />
          </div>
        </Card>
      ))}
    </List>
  )
}
