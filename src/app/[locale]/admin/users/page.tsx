import { Card } from "@/components/Card"
import { List } from "@/components/List"
import { ListTitle } from "@/components/ListTitle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getUsers } from "@/lib/users/getUsers"
import { RemoveUser } from "./components/RemoveUser"
import { ToggleAdmin } from "./components/ToggleAdmin"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getInitials } from "@/lib/utils"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/nextAuth"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)

  if (!session) redirect("/login")

  const users = await getUsers()
  const { isSuperAdmin } = session.user
  const t = await getTranslations("Admin")

  return (
    <List>
      <ListTitle>{t("users.title")}</ListTitle>

      {users.map(user => (
        <Card key={user.id} className="flex flex-wrap gap-2 items-center">
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
            {(user.isSuperAdmin || user.isAdmin) && (
              <small className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {user.isSuperAdmin ? t("users.superAdmin") : t("users.admin")}
              </small>
            )}
            <br />
            <small className="text-xs text-muted-foreground">
              {user.email}
            </small>
          </span>

          <div className="ml-auto flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/users/${user.id}`}>{t("users.view")}</Link>
            </Button>
            {isSuperAdmin && !user.isSuperAdmin && (
              <ToggleAdmin id={user.id} isAdmin={user.isAdmin} />
            )}
            {!user.isSuperAdmin && (isSuperAdmin || !user.isAdmin) && (
              <RemoveUser id={user.id} name={user.name ?? user.email ?? ""} />
            )}
          </div>
        </Card>
      ))}
    </List>
  )
}
