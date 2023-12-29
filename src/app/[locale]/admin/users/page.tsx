import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers } from "@/lib/users/getUsers"
import { RemoveUser } from "./components/RemoveUser"
import { getInitials } from "@/utils/string"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const users = await getUsers()

  return (
    <List>
      <ListTitle>Users</ListTitle>

      {users.map((user) => (
        <Card key={user.id} className="flex gap-2 items-center">
          <Avatar>
            {user?.image && (
              <AvatarImage
                src={user.image}
                alt={`Avatar of ${user.firstName || user?.name}`}
              />
            )}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>

          <span className="leading-none">
            {user.name} <small>({user.firstName})</small>
            <br />
            <small className="text-xs text-muted-foreground">
              {user.email}
            </small>
          </span>

          <RemoveUser id={user.id} />
        </Card>
      ))}
    </List>
  )
}
