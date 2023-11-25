import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers } from "@/lib/users/getUsers"
import { RemoveUser } from "./components/RemoveUser"

export default async function AdminUsersPage() {
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
            <AvatarFallback>
              {(user.firstName || user?.name)?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
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
